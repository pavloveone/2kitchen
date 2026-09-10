package models

import "time"

type Restaurant struct {
	ID          int       `json:"id"`
	OwnerID     int       `json:"ownerId"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedOn   time.Time `json:"createdOn"`
}

type CreateRestaurantRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}
