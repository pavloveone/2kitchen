package models

import "time"

type OrderItem struct {
	Dish     `json:"dish"`
	Quantity int `json:"quantity"`
}

type Order struct {
	ID            int       `json:"id"`
	Restaurant    int       `json:"restaurant"`
	Items         string    `json:"items"`
	Status        string    `json:"status"`
	OrderTime     time.Time `json:"order_time"`
	PaymentStatus string    `json:"payment_status"`
}

type CreateOrder struct {
	Restaurant int         `json:"restaurant"`
	Items      []OrderItem `json:"items"`
}
