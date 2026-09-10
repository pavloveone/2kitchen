package auth

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey []byte

func init() {
	_ = godotenv.Load()

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET is not set")
	}
	jwtKey = []byte(secret)
}

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func CheckPasswordHash(password, hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func GenerateTokens(userId int) (string, string, error) {
	accesTokenClaims := jwt.MapClaims{
		"user_id": fmt.Sprintf("%d", userId),
		"exp":     time.Now().Add(15 * time.Minute).Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accesTokenClaims)
	accessTokenStr, err := accessToken.SignedString(jwtKey)
	if err != nil {
		return "", "", err
	}
	refreshTokenClaims := jwt.MapClaims{
		"user_id": fmt.Sprintf("%d", userId),
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshTokenClaims)
	refreshTokenStr, err := refreshToken.SignedString(jwtKey)
	if err != nil {
		return "", "", err
	}
	return accessTokenStr, refreshTokenStr, nil
}

func AuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		logrus.WithField("path", c.Path()).Warn("request missing Authorization header")
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

	claims, err := validateToken(tokenStr)

	if err != nil {
		logrus.WithError(err).WithField("path", c.Path()).Warn("invalid or expired token")
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	userId, ok := (*claims)["user_id"].(string)
	if !ok {
		logrus.WithField("path", c.Path()).Warn("token missing user_id claim")
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	c.Locals("user", userId)

	return c.Next()
}

func UserIDFromContext(c *fiber.Ctx) (int, error) {
	userIdStr, ok := c.Locals("user").(string)
	if !ok {
		return 0, fmt.Errorf("missing authenticated user")
	}
	return strconv.Atoi(userIdStr)
}

func validateToken(tokenStr string) (*jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		return jwtKey, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid claims")
	}
	return &claims, nil
}
