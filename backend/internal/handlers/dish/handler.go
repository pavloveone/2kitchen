package dishhandlers

import (
	"2kitchen/internal/auth"
	"2kitchen/internal/models"
	dishservices "2kitchen/internal/services/dish"
	restaurantservices "2kitchen/internal/services/restaurant"
	"context"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type DishHandler struct {
	service           *dishservices.DishService
	restaurantService *restaurantservices.RestaurantService
	ctx               context.Context
}

func NewDishHandler(service *dishservices.DishService, restaurantService *restaurantservices.RestaurantService, ctx context.Context) *DishHandler {
	return &DishHandler{service: service, restaurantService: restaurantService, ctx: ctx}
}

func (h *DishHandler) AllDishes(c *fiber.Ctx) error {
	dishes, err := h.service.GetAllDishes(h.ctx)
	if err != nil {
		logrus.WithError(err).Error("failed to load all dishes")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to load dishes"})
	}
	return c.Status(fiber.StatusOK).JSON(dishes)
}

func (h *DishHandler) RestaurantDishes(c *fiber.Ctx) error {
	idParam := c.Params("restId")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logrus.WithField("restId", idParam).Warn("invalid restaurant id in dishes request")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid ID"})
	}
	dishes, err := h.service.GetRestDishes(h.ctx, id)
	if err != nil {
		logrus.WithError(err).WithField("restId", id).Error("failed to load restaurant dishes")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "dishes not found"})
	}

	return c.Status(fiber.StatusOK).JSON(dishes)
}

func (h *DishHandler) RestaurantDish(c *fiber.Ctx) error {
	restParam := c.Params("restId")
	restId, err := strconv.Atoi(restParam)
	if err != nil {
		logrus.WithField("restId", restParam).Warn("invalid restaurant id in dish request")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid rest ID"})
	}
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logrus.WithField("id", idParam).Warn("invalid dish id in dish request")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid dish ID"})
	}
	dish, err := h.service.DishById(h.ctx, restId, id)
	if err != nil {
		logrus.WithError(err).WithFields(logrus.Fields{"restId": restId, "id": id}).Error("failed to load dish")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "dish not found"})
	}
	return c.Status(fiber.StatusOK).JSON(dish)
}

func (h *DishHandler) AddRestaurantDish(c *fiber.Ctx) error {
	req := models.ModificationDish{}
	if err := c.BodyParser(&req); err != nil {
		logrus.WithError(err).Warn("invalid add-dish request body")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	restaurant, err := h.callerRestaurant(c)
	if err != nil {
		logrus.WithError(err).Warn("could not resolve caller's restaurant for add-dish")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	req.Restaurant = restaurant.ID

	dishId, err := h.service.AddDish(h.ctx, req)
	if err != nil {
		logrus.WithError(err).WithField("restId", restaurant.ID).Error("failed to add dish")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"id": dishId})
}

func (h *DishHandler) RemoveRestaurantDish(c *fiber.Ctx) error {
	req := models.ModificationDish{}
	if err := c.BodyParser(&req); err != nil {
		logrus.WithError(err).Warn("invalid remove-dish request body")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	restaurant, err := h.callerRestaurant(c)
	if err != nil {
		logrus.WithError(err).Warn("could not resolve caller's restaurant for remove-dish")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	req.Restaurant = restaurant.ID

	if err := h.service.RemoveDish(h.ctx, req); err != nil {
		logrus.WithError(err).WithFields(logrus.Fields{"restId": restaurant.ID, "dishId": req.ID}).Error("failed to remove dish")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusOK)
}

func (h *DishHandler) callerRestaurant(c *fiber.Ctx) (models.Restaurant, error) {
	userId, err := auth.UserIDFromContext(c)
	if err != nil {
		return models.Restaurant{}, err
	}
	return h.restaurantService.RestaurantByOwner(h.ctx, userId)
}
