package dishhandlers_test

import (
	"2kitchen/internal/auth"
	dishhandlers "2kitchen/internal/handlers/dish"
	"2kitchen/internal/models"
	dishrepositories "2kitchen/internal/repositories/dish"
	restaurantrepositories "2kitchen/internal/repositories/restaurant"
	userrepositories "2kitchen/internal/repositories/user"
	dishroutes "2kitchen/internal/routes/dish"
	dishservices "2kitchen/internal/services/dish"
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
	return fmt.Sprintf("dish-%d", time.Now().UnixNano())
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

	_, err = testDB.Exec(ctx, `TRUNCATE TABLE dishes RESTART IDENTITY`)
	if err != nil {
		log.Fatalf("Failed to truncate tables: %v", err)
	}

	code := m.Run()

	testDB.Close()
	os.Exit(code)
}

func setupTestApp() (*fiber.App, [2]int, [2]int) {
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

	restaurantService := restaurantservices.NewRestaurantService(restaurantRepo)
	dishService := dishservices.NewDishService(dishRepo)
	handler := dishhandlers.NewDishHandler(dishService, restaurantService, ctx)

	app := fiber.New()
	dishroutes.SetupDishRoutes(app, handler)

	ownerIds, restaurantIds := seedRestaurants(userRepo, restaurantRepo)
	addTestDishes(ctx, dishRepo, restaurantIds)

	return app, ownerIds, restaurantIds
}

func seedRestaurants(userRepo *userrepositories.UserRepository, restaurantRepo *restaurantrepositories.RestaurantRepository) ([2]int, [2]int) {
	var ownerIds [2]int
	var restaurantIds [2]int

	for i, name := range [2]string{"Trattoria Uno", "Steak House Due"} {
		suffix := fmt.Sprintf("%s-%d", uniqueSuffix(), i)
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

		restaurantId, err := restaurantRepo.CreateRestaurant(ctx, userId, name, "")
		if err != nil {
			log.Fatal("Error creating test restaurant:", err)
		}
		ownerIds[i] = userId
		restaurantIds[i] = restaurantId
	}

	return ownerIds, restaurantIds
}

func addTestDishes(ctx context.Context, repo *dishrepositories.DishRepository, restaurantIds [2]int) {
	dishes := []models.ModificationDish{
		{
			Name:        "Паста Карбонара",
			Price:       1200,
			Description: "Спагетти, бекон, сливки, яйца, пармезан",
			Protein:     25,
			Fat:         32,
			Carbs:       45,
			Calories:    568,
			Restaurant:  restaurantIds[0],
		},
		{
			Name:        "Стейк Рибай",
			Price:       2400,
			Description: "Говяжий стейк с овощами гриль",
			Protein:     38,
			Fat:         28,
			Carbs:       5,
			Calories:    424,
			Restaurant:  restaurantIds[1],
		},
	}

	for _, dish := range dishes {
		if _, err := repo.AddDish(ctx, dish); err != nil {
			log.Fatal("Error adding test dishes:", err)
		}
	}
}

func TestAllDishes(t *testing.T) {
	app, _, restaurantIds := setupTestApp()

	req := httptest.NewRequest("GET", "/dishes", nil)
	resp, err := app.Test(req)

	require.NoError(t, err)
	require.Equal(t, fiber.StatusOK, resp.StatusCode)

	var dishes []models.Dish
	err = json.NewDecoder(resp.Body).Decode(&dishes)
	require.NoError(t, err)

	require.Len(t, dishes, 2)
	require.Equal(t, restaurantIds[0], dishes[0].Restaurant)
	require.Equal(t, restaurantIds[1], dishes[1].Restaurant)
}

func TestRestaurantDishes(t *testing.T) {
	app, _, restaurantIds := setupTestApp()

	for _, id := range restaurantIds {
		target := fmt.Sprintf("/dishes/%d", id)
		req := httptest.NewRequest("GET", target, nil)
		resp, err := app.Test(req)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusOK, resp.StatusCode)

		var dishes []models.Dish
		err = json.NewDecoder(resp.Body).Decode(&dishes)

		require.NoError(t, err)

		for _, dish := range dishes {
			require.Equal(t, id, dish.Restaurant)
		}
	}
}

func TestAddRestaurantDish_RequiresAuth(t *testing.T) {
	app, _, _ := setupTestApp()

	body, _ := json.Marshal(models.ModificationDish{Name: "Тирамису", Price: 500})
	req := httptest.NewRequest("POST", "/dishes", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	require.NoError(t, err)
	require.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
}

func TestAddRestaurantDish_IgnoresClientSuppliedRestaurant(t *testing.T) {
	app, ownerIds, restaurantIds := setupTestApp()

	accessToken, _, err := auth.GenerateTokens(ownerIds[0])
	require.NoError(t, err)

	newDish := models.ModificationDish{
		Name:       "Тирамису",
		Price:      500,
		Restaurant: restaurantIds[1],
	}
	body, _ := json.Marshal(newDish)
	req := httptest.NewRequest("POST", "/dishes", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := app.Test(req)
	require.NoError(t, err)
	require.Equal(t, fiber.StatusCreated, resp.StatusCode)

	dishesReq := httptest.NewRequest("GET", fmt.Sprintf("/dishes/%d", restaurantIds[0]), nil)
	dishesResp, err := app.Test(dishesReq)
	require.NoError(t, err)

	var dishes []models.Dish
	require.NoError(t, json.NewDecoder(dishesResp.Body).Decode(&dishes))

	found := false
	for _, dish := range dishes {
		if dish.Name == "Тирамису" {
			found = true
			require.Equal(t, restaurantIds[0], dish.Restaurant)
		}
	}
	require.True(t, found, "expected new dish to be scoped to the authenticated owner's restaurant")
}
