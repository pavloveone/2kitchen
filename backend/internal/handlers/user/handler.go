package userhandlers

import (
	"2kitchen/internal/models"
	userservices "2kitchen/internal/services/user"
	"context"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type UserHander struct {
	service *userservices.UserService
	ctx     context.Context
}

func NewUserHandler(service *userservices.UserService, ctx context.Context) *UserHander {
	return &UserHander{service: service, ctx: ctx}
}

func (h *UserHander) GetAllUsers(c *fiber.Ctx) error {
	users, err := h.service.AllUsers(h.ctx)
	if err != nil {
		logrus.WithError(err).Error("failed to load users")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "An error occurred while loading users"})
	}
	return c.Status(fiber.StatusOK).JSON(users)
}

func (h *UserHander) GetUserById(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logrus.WithField("id", idParam).Warn("invalid user id")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid user id"})
	}
	user, err := h.service.UserById(h.ctx, id)
	if err != nil {
		logrus.WithError(err).WithField("id", id).Warn("user not found")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "User not found"})
	}
	return c.Status(fiber.StatusOK).JSON(user)
}

func (h *UserHander) AddUser(c *fiber.Ctx) error {
	req := models.CreateUserRequest{}
	if err := c.BodyParser(&req); err != nil {
		logrus.WithError(err).Warn("invalid register request body")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request"})
	}
	id, err := h.service.AddUser(h.ctx, req)
	if err != nil {
		logrus.WithError(err).WithField("username", req.Username).Warn("failed to register user")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"id": id})
}

func (h *UserHander) LogIn(c *fiber.Ctx) error {
	req := models.LogInUser{}
	if err := c.BodyParser(&req); err != nil {
		logrus.WithError(err).Warn("invalid login request body")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request"})
	}
	user, err := h.service.LogIn(h.ctx, req)
	if err != nil {
		logrus.WithError(err).WithField("username", req.Username).Warn("login failed")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "user does not exist"})
	}
	return c.Status(fiber.StatusOK).JSON(user)
}
