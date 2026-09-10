package dishroutes

import (
	"2kitchen/internal/auth"
	dishhandlers "2kitchen/internal/handlers/dish"

	"github.com/gofiber/fiber/v2"
)

func SetupDishRoutes(app *fiber.App, h *dishhandlers.DishHandler) {
	dishesGroup := app.Group("/dishes")
	dishesGroup.Get("", h.AllDishes)
	dishesGroup.Get("/:restId/:id", h.RestaurantDish)
	dishesGroup.Get("/:restId", h.RestaurantDishes)
	dishesGroup.Post("", auth.AuthMiddleware, h.AddRestaurantDish)
	dishesGroup.Delete("", auth.AuthMiddleware, h.RemoveRestaurantDish)
}
