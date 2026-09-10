package orderhandlers_test

import (
	"2kitchen/internal/auth"
	dishrepositories "2kitchen/internal/repositories/dish"
	orderrepositories "2kitchen/internal/repositories/order"
	restaurantrepositories "2kitchen/internal/repositories/restaurant"
	userrepositories "2kitchen/internal/repositories/user"

	orderhandler "2kitchen/internal/handlers/order"
	"2kitchen/internal/models"
	orderroutes "2kitchen/internal/routes/order"
	dishservices "2kitchen/internal/services/dish"
	orderservices "2kitchen/internal/services/order"
	restaurantservices "2kitchen/internal/services/restaurant"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/require"
)

var testDB *pgxpool.Pool
var ctx = context.Background()

func uniqueSuffix() string {
	return fmt.Sprintf("order-%d", time.Now().UnixNano())
}

func TestMain(m *testing.M) {
	var err error

	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		log.Fatal("TEST_DATABASE_URL not set")
	}

	testDB, err = pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("Unable to connect to test DB: %v", err)
	}

	if _, err := userrepositories.NewUserRepository(ctx, testDB); err != nil {
		log.Fatalf("Failed to ensure users table: %v", err)
	}
	if _, err := restaurantrepositories.NewRestaurantRepository(ctx, testDB); err != nil {
		log.Fatalf("Failed to ensure restaurants table: %v", err)
	}
	if _, err := dishrepositories.NewDishRepository(ctx, testDB); err != nil {
		log.Fatalf("Failed to ensure dishes table: %v", err)
	}
	if _, err := orderrepositories.NewOrderRepository(ctx, testDB); err != nil {
		log.Fatalf("Failed to ensure orders table: %v", err)
	}

	_, err = testDB.Exec(ctx, `TRUNCATE TABLE orders RESTART IDENTITY`)
	if err != nil {
		log.Fatalf("Failed to truncate tables: %v", err)
	}

	code := m.Run()

	testDB.Close()
	os.Exit(code)
}

type testRestaurant struct {
	ownerId      int
	restaurantId int
	accessToken  string
}

func setupTestApp() (*fiber.App, testRestaurant) {
	userRepo, err := userrepositories.NewUserRepository(ctx, testDB)
	if err != nil {
		log.Fatal("Error initializing users repository:", err)
	}
	restaurantRepo, err := restaurantrepositories.NewRestaurantRepository(ctx, testDB)
	if err != nil {
		log.Fatal("Error initializing restaurants repository:", err)
	}
	dishRepo, err := dishrepositories.NewDishRepository(ctx, testDB)
	if err != nil {
		log.Fatal("Error initializing dishes repository:", err)
	}
	orderRepo, err := orderrepositories.NewOrderRepository(ctx, testDB)
	if err != nil {
		log.Fatal("Error initializing orders repository:", err)
	}

	restaurantService := restaurantservices.NewRestaurantService(restaurantRepo)
	dishService := dishservices.NewDishService(dishRepo)
	orderService := orderservices.NewOrderService(orderRepo)
	handler := orderhandler.NewOrderHandler(orderService, dishService, restaurantService, ctx)

	app := fiber.New()
	orderroutes.SetupOrderRoutes(app, handler)

	restaurant := seedRestaurant(userRepo, restaurantRepo)
	addTestOrders(orderRepo, restaurant.restaurantId)

	return app, restaurant
}

func seedRestaurant(userRepo *userrepositories.UserRepository, restaurantRepo *restaurantrepositories.RestaurantRepository) testRestaurant {
	suffix := uniqueSuffix()
	userId, err := userRepo.AddUser(ctx, models.CreateUserRequest{
		Username:  "owner-" + suffix,
		Password:  "password123",
		FirstName: "Test",
		LastName:  "Owner",
		Email:     "owner-" + suffix + "@example.com",
	})
	if err != nil {
		log.Fatal("Error creating test owner:", err)
	}

	restaurantId, err := restaurantRepo.CreateRestaurant(ctx, userId, "Test Restaurant "+suffix, "")
	if err != nil {
		log.Fatal("Error creating test restaurant:", err)
	}

	accessToken, _, err := auth.GenerateTokens(userId)
	if err != nil {
		log.Fatal("Error generating test token:", err)
	}

	return testRestaurant{ownerId: userId, restaurantId: restaurantId, accessToken: accessToken}
}

func addTestOrders(repo *orderrepositories.OrderRepository, restaurantId int) {
	orders := []models.CreateOrder{
		{Restaurant: restaurantId, Items: []models.OrderItem{}},
		{Restaurant: restaurantId, Items: []models.OrderItem{}},
	}

	for _, order := range orders {
		if _, err := repo.CreateOrder(ctx, order); err != nil {
			log.Fatal("Error adding test orders:", err)
		}
	}
}

func TestMyRestaurantOrders(t *testing.T) {
	app, restaurant := setupTestApp()

	req := httptest.NewRequest("GET", "/orders", nil)
	req.Header.Set("Authorization", "Bearer "+restaurant.accessToken)
	resp, err := app.Test(req)

	require.NoError(t, err)
	require.Equal(t, fiber.StatusOK, resp.StatusCode)

	var orders []models.Order
	err = json.NewDecoder(resp.Body).Decode(&orders)
	require.NoError(t, err)

	require.Len(t, orders, 2)
	require.Equal(t, restaurant.restaurantId, orders[0].Restaurant)
}

func TestMyRestaurantOrders_RequiresAuth(t *testing.T) {
	app, _ := setupTestApp()

	req := httptest.NewRequest("GET", "/orders", nil)
	resp, err := app.Test(req)

	require.NoError(t, err)
	require.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
}

func TestCreateOrder(t *testing.T) {
	app, restaurant := setupTestApp()
	newOrder := models.CreateOrder{
		Restaurant: restaurant.restaurantId,
		Items:      []models.OrderItem{},
	}
	body, err := json.Marshal(newOrder)
	if err != nil {
		t.Fatalf("could not marshal newOrder: %v", err)
	}
	req := httptest.NewRequest("POST", "/orders", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	require.NoError(t, err)
	require.Equal(t, fiber.StatusOK, resp.StatusCode)

	var res map[string]any
	err = json.NewDecoder(resp.Body).Decode(&res)
	require.NoError(t, err)

	idFloat, ok := res["id"].(float64)
	require.True(t, ok, "expected id to be a number, got %#v", res["id"])
	require.True(t, idFloat > 0, "expected ID > 0, got %v", idFloat)
}

func TestSimulateOrders_RequiresDishes(t *testing.T) {
	app, restaurant := setupTestApp()

	req := httptest.NewRequest("POST", "/orders/simulate", nil)
	req.Header.Set("Authorization", "Bearer "+restaurant.accessToken)
	resp, err := app.Test(req)

	require.NoError(t, err)
	require.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
}
