package orderroutes

import (
	"2kitchen/internal/auth"
	orderhandler "2kitchen/internal/handlers/order"

	"github.com/gofiber/fiber/v2"
)

func SetupOrderRoutes(app *fiber.App, h *orderhandler.OrderHandler) {
	ordersGroup := app.Group("/orders")
	ordersGroup.Get("", auth.AuthMiddleware, h.MyRestaurantOrders)
	ordersGroup.Post("", h.CreateOrder)
	ordersGroup.Post("/simulate", auth.AuthMiddleware, h.SimulateOrders)
}
