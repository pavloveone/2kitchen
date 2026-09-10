package orderservices

import (
	"2kitchen/internal/models"
	orderrepositories "2kitchen/internal/repositories/order"
	"context"
	"errors"
	"math/rand"
	"time"
)

type OrderService struct {
	repo *orderrepositories.OrderRepository
}

func NewOrderService(repo *orderrepositories.OrderRepository) *OrderService {
	return &OrderService{repo: repo}
}

func (s *OrderService) RestaurantOrders(ctx context.Context, restId int) ([]models.Order, error) {
	return s.repo.RestaurantOrders(ctx, restId)
}

func (s *OrderService) CreateOrder(ctx context.Context, order models.CreateOrder) (int, error) {
	return s.repo.CreateOrder(ctx, order)
}

var simulatedStatuses = []string{"pending", "completed", "cancelled"}
var simulatedPaymentStatuses = []string{"paid", "unpaid"}

const simulatedOrdersCount = 30
const simulatedOrdersSpreadDays = 30

func (s *OrderService) SimulateOrders(ctx context.Context, restId int, dishes []models.Dish) error {
	if len(dishes) == 0 {
		return errors.New("add at least one dish before generating demo orders")
	}

	for i := 0; i < simulatedOrdersCount; i++ {
		items := randomOrderItems(dishes)
		status := simulatedStatuses[rand.Intn(len(simulatedStatuses))]
		paymentStatus := simulatedPaymentStatuses[rand.Intn(len(simulatedPaymentStatuses))]
		orderTime := randomPastTime(simulatedOrdersSpreadDays)

		if err := s.repo.CreateSimulatedOrder(ctx, restId, items, status, paymentStatus, orderTime); err != nil {
			return err
		}
	}

	return nil
}

func randomOrderItems(dishes []models.Dish) []models.OrderItem {
	itemsCount := rand.Intn(3) + 1
	items := make([]models.OrderItem, 0, itemsCount)
	for i := 0; i < itemsCount; i++ {
		dish := dishes[rand.Intn(len(dishes))]
		items = append(items, models.OrderItem{
			Dish:     dish,
			Quantity: rand.Intn(3) + 1,
		})
	}
	return items
}

func randomPastTime(withinDays int) time.Time {
	offset := time.Duration(rand.Intn(withinDays*24)) * time.Hour
	return time.Now().Add(-offset)
}
