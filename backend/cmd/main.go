package main

import (
	dishhandlers "2kitchen/internal/handlers/dish"
	orderhandlers "2kitchen/internal/handlers/order"
	restauranthandlers "2kitchen/internal/handlers/restaurant"
	userhandlers "2kitchen/internal/handlers/user"
	dishrepositories "2kitchen/internal/repositories/dish"
	orderrepositories "2kitchen/internal/repositories/order"
	restaurantrepositories "2kitchen/internal/repositories/restaurant"
	userrepositories "2kitchen/internal/repositories/user"
	dishroutes "2kitchen/internal/routes/dish"
	orderroutes "2kitchen/internal/routes/order"
	restaurantroutes "2kitchen/internal/routes/restaurant"
	userroutes "2kitchen/internal/routes/user"
	dishservices "2kitchen/internal/services/dish"
	orderservices "2kitchen/internal/services/order"
	restaurantservices "2kitchen/internal/services/restaurant"
	userservices "2kitchen/internal/services/user"
	"context"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sirupsen/logrus"
)

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	ctx := context.Background()
	dbpool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))

	if err != nil {
		logrus.Fatal("Failed to connect to database:", err)
	}

	// users
	rUsers, err := userrepositories.NewUserRepository(ctx, dbpool)
	if err != nil {
		logrus.Fatal("Error initializing users repository:", err)
	}
	sUsers := userservices.NewUserRepository(rUsers)
	hUsers := userhandlers.NewUserHandler(sUsers, ctx)
	userroutes.SetupRoutes(app, hUsers)

	// restaurants (must exist before dishes/orders: both reference restaurants.id)
	rRestaurants, err := restaurantrepositories.NewRestaurantRepository(ctx, dbpool)
	if err != nil {
		logrus.Fatal("Error initializing restaurants repository:", err)
	}
	sRestaurants := restaurantservices.NewRestaurantService(rRestaurants)
	hRestaurants := restauranthandlers.NewRestaurantHandler(sRestaurants, ctx)
	restaurantroutes.SetupRestaurantRoutes(app, hRestaurants)

	// dishes
	rDishes, err := dishrepositories.NewDishRepository(ctx, dbpool)
	if err != nil {
		logrus.Fatal("Error initializing dishes repository:", err)
	}
	sDishes := dishservices.NewDishService(rDishes)
	hDishes := dishhandlers.NewDishHandler(sDishes, sRestaurants, ctx)
	dishroutes.SetupDishRoutes(app, hDishes)

	// orders
	rOrders, err := orderrepositories.NewOrderRepository(ctx, dbpool)
	if err != nil {
		logrus.Fatal("Error initializing orders repository:", err)
	}
	sOrders := orderservices.NewOrderService(rOrders)
	hOrders := orderhandlers.NewOrderHandler(sOrders, sDishes, sRestaurants, ctx)
	orderroutes.SetupOrderRoutes(app, hOrders)

	port := "8080"
	logrus.WithFields(logrus.Fields{
		"port": port,
	}).Info("Server starting on port")
	logrus.Fatal(app.Listen(":" + port))
}
