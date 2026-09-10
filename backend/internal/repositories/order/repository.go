package orderrepositories

import (
	"2kitchen/internal/models"
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type OrderRepository struct {
	db *pgxpool.Pool
}

func NewOrderRepository(ctx context.Context, db *pgxpool.Pool) (*OrderRepository, error) {
	createTableQuery := `
		CREATE TABLE IF NOT EXISTS orders (
		id SERIAL PRIMARY KEY,
		restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
		items JSONB NOT NULL,
		order_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		status TEXT DEFAULT 'pending',
		payment_status TEXT DEFAULT 'unpaid'
		);
	`
	_, err := db.Exec(ctx, createTableQuery)
	if err != nil {
		return nil, err
	}

	return &OrderRepository{db: db}, nil
}

func (r *OrderRepository) RestaurantOrders(ctx context.Context, restId int) ([]models.Order, error) {
	query := `SELECT id, restaurant_id, items, status, order_time, payment_status FROM orders WHERE restaurant_id = $1 ORDER BY order_time DESC`
	rows, err := r.db.Query(ctx, query, restId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := make([]models.Order, 0)
	for rows.Next() {
		var order models.Order
		err := rows.Scan(&order.ID, &order.Restaurant, &order.Items, &order.Status, &order.OrderTime, &order.PaymentStatus)
		if err != nil {
			return nil, err
		}

		orders = append(orders, order)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *OrderRepository) CreateOrder(ctx context.Context, order models.CreateOrder) (int, error) {
	itemsJSON, err := json.Marshal(order.Items)
	if err != nil {
		log.Fatal(err)
	}
	query := `
		INSERT INTO orders (restaurant_id, items)
		VALUES ($1, $2)
		RETURNING id
	`
	var id int
	err = r.db.QueryRow(ctx, query, order.Restaurant, string(itemsJSON)).Scan(&id)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (r *OrderRepository) CreateSimulatedOrder(ctx context.Context, restId int, items []models.OrderItem, status, paymentStatus string, orderTime time.Time) error {
	itemsJSON, err := json.Marshal(items)
	if err != nil {
		return err
	}
	query := `
		INSERT INTO orders (restaurant_id, items, status, payment_status, order_time)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err = r.db.Exec(ctx, query, restId, string(itemsJSON), status, paymentStatus, orderTime)
	return err
}
