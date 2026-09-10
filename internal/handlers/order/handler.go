package orderhandlers

import (
	"2kitchen/internal/auth"
	"2kitchen/internal/models"
	dishservices "2kitchen/internal/services/dish"
	orderservices "2kitchen/internal/services/order"
	restaurantservices "2kitchen/internal/services/restaurant"
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type OrderHandler struct {
	service           *orderservices.OrderService
	dishService       *dishservices.DishService
	restaurantService *restaurantservices.RestaurantService
	ctx               context.Context
}

func NewOrderHandler(service *orderservices.OrderService, dishService *dishservices.DishService, restaurantService *restaurantservices.RestaurantService, ctx context.Context) *OrderHandler {
	return &OrderHandler{service: service, dishService: dishService, restaurantService: restaurantService, ctx: ctx}
}

func (h *OrderHandler) MyRestaurantOrders(c *fiber.Ctx) error {
	restaurant, err := h.callerRestaurant(c)
	if err != nil {
		logrus.WithError(err).Warn("could not resolve caller's restaurant for orders list")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}

	orders, err := h.service.RestaurantOrders(h.ctx, restaurant.ID)
	if err != nil {
		logrus.WithError(err).WithField("restId", restaurant.ID).Error("failed to load orders")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to load orders"})
	}
	return c.Status(fiber.StatusOK).JSON(orders)
}

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	req := models.CreateOrder{}
	if err := c.BodyParser(&req); err != nil {
		logrus.WithError(err).Warn("invalid create-order request body")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}
	id, err := h.service.CreateOrder(h.ctx, req)
	if err != nil {
		logrus.WithError(err).WithField("restId", req.Restaurant).Error("failed to create order")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"id": id})
}

func (h *OrderHandler) SimulateOrders(c *fiber.Ctx) error {
	restaurant, err := h.callerRestaurant(c)
	if err != nil {
		logrus.WithError(err).Warn("could not resolve caller's restaurant for order simulation")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}

	dishes, err := h.dishService.GetRestDishes(h.ctx, restaurant.ID)
	if err != nil {
		logrus.WithError(err).WithField("restId", restaurant.ID).Error("failed to load dishes for order simulation")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to load dishes"})
	}

	if err := h.service.SimulateOrders(h.ctx, restaurant.ID, dishes); err != nil {
		logrus.WithError(err).WithField("restId", restaurant.ID).Warn("failed to simulate orders")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.SendStatus(fiber.StatusOK)
}

func (h *OrderHandler) callerRestaurant(c *fiber.Ctx) (models.Restaurant, error) {
	userId, err := auth.UserIDFromContext(c)
	if err != nil {
		return models.Restaurant{}, err
	}
	return h.restaurantService.RestaurantByOwner(h.ctx, userId)
}
