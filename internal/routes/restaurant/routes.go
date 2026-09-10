package restaurantroutes

import (
	"2kitchen/internal/auth"
	restauranthandlers "2kitchen/internal/handlers/restaurant"

	"github.com/gofiber/fiber/v2"
)

func SetupRestaurantRoutes(app *fiber.App, h *restauranthandlers.RestaurantHandler) {
	restaurantsGroup := app.Group("/restaurants")
	restaurantsGroup.Get("", h.AllRestaurants)
	restaurantsGroup.Get("/me", auth.AuthMiddleware, h.MyRestaurant)
	restaurantsGroup.Put("/me", auth.AuthMiddleware, h.UpdateMyRestaurant)
	restaurantsGroup.Delete("/me", auth.AuthMiddleware, h.DeleteMyRestaurant)
	restaurantsGroup.Get("/:id", h.RestaurantById)
	restaurantsGroup.Post("", auth.AuthMiddleware, h.CreateRestaurant)
}
