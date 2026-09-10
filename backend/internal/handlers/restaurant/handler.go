package restauranthandlers

import (
	"2kitchen/internal/auth"
	"2kitchen/internal/models"
	restaurantservices "2kitchen/internal/services/restaurant"
	"context"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type RestaurantHandler struct {
	service *restaurantservices.RestaurantService
	ctx     context.Context
}

func NewRestaurantHandler(service *restaurantservices.RestaurantService, ctx context.Context) *RestaurantHandler {
	return &RestaurantHandler{service: service, ctx: ctx}
}

func (h *RestaurantHandler) AllRestaurants(c *fiber.Ctx) error {
	restaurants, err := h.service.AllRestaurants(h.ctx)
	if err != nil {
		logrus.WithError(err).Error("failed to load restaurants")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to load restaurants"})
	}
	return c.Status(fiber.StatusOK).JSON(restaurants)
}

func (h *RestaurantHandler) RestaurantById(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logrus.WithField("id", idParam).Warn("invalid restaurant id")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid restaurant id"})
	}
	restaurant, err := h.service.RestaurantById(h.ctx, id)
	if err != nil {
		logrus.WithError(err).WithField("id", id).Warn("restaurant not found")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "restaurant not found"})
	}
	return c.Status(fiber.StatusOK).JSON(restaurant)
}

func (h *RestaurantHandler) MyRestaurant(c *fiber.Ctx) error {
	userId, err := auth.UserIDFromContext(c)
	if err != nil {
		logrus.WithError(err).Warn("unauthenticated request for /restaurants/me")
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	restaurant, err := h.service.RestaurantByOwner(h.ctx, userId)
	if err != nil {
		logrus.WithError(err).WithField("userId", userId).Warn("could not resolve restaurant for owner")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(restaurant)
}

func (h *RestaurantHandler) CreateRestaurant(c *fiber.Ctx) error {
	userId, err := auth.UserIDFromContext(c)
	if err != nil {
		logrus.WithError(err).Warn("unauthenticated request to create a restaurant")
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	req := models.CreateRestaurantRequest{}
	if err := c.BodyParser(&req); err != nil {
		logrus.WithError(err).Warn("invalid create-restaurant request body")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}
	if req.Name == "" {
		logrus.WithField("userId", userId).Warn("create-restaurant request missing name")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name is required"})
	}

	id, err := h.service.CreateRestaurant(h.ctx, userId, req.Name, req.Description)
	if err != nil {
		logrus.WithError(err).WithField("userId", userId).Warn("failed to create restaurant")
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"id": id})
}

func (h *RestaurantHandler) UpdateMyRestaurant(c *fiber.Ctx) error {
	restaurant, err := h.callerRestaurant(c)
	if err != nil {
		logrus.WithError(err).Warn("could not resolve caller's restaurant for update")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}

	req := models.CreateRestaurantRequest{}
	if err := c.BodyParser(&req); err != nil {
		logrus.WithError(err).Warn("invalid update-restaurant request body")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name is required"})
	}

	if err := h.service.UpdateRestaurant(h.ctx, restaurant.ID, req.Name, req.Description); err != nil {
		logrus.WithError(err).WithField("restId", restaurant.ID).Error("failed to update restaurant")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update restaurant"})
	}
	return c.SendStatus(fiber.StatusOK)
}

func (h *RestaurantHandler) DeleteMyRestaurant(c *fiber.Ctx) error {
	restaurant, err := h.callerRestaurant(c)
	if err != nil {
		logrus.WithError(err).Warn("could not resolve caller's restaurant for deletion")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}

	if err := h.service.DeleteRestaurant(h.ctx, restaurant.ID); err != nil {
		logrus.WithError(err).WithField("restId", restaurant.ID).Error("failed to delete restaurant")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete restaurant"})
	}
	return c.SendStatus(fiber.StatusOK)
}

func (h *RestaurantHandler) callerRestaurant(c *fiber.Ctx) (models.Restaurant, error) {
	userId, err := auth.UserIDFromContext(c)
	if err != nil {
		return models.Restaurant{}, err
	}
	return h.service.RestaurantByOwner(h.ctx, userId)
}
