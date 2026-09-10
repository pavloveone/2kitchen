package restaurantservices

import (
	"2kitchen/internal/models"
	restaurantrepositories "2kitchen/internal/repositories/restaurant"
	"context"
)

type RestaurantService struct {
	repo *restaurantrepositories.RestaurantRepository
}

func NewRestaurantService(repo *restaurantrepositories.RestaurantRepository) *RestaurantService {
	return &RestaurantService{repo: repo}
}

func (s *RestaurantService) AllRestaurants(ctx context.Context) ([]models.Restaurant, error) {
	return s.repo.AllRestaurants(ctx)
}

func (s *RestaurantService) RestaurantById(ctx context.Context, id int) (models.Restaurant, error) {
	return s.repo.RestaurantById(ctx, id)
}

func (s *RestaurantService) RestaurantByOwner(ctx context.Context, ownerId int) (models.Restaurant, error) {
	return s.repo.RestaurantByOwner(ctx, ownerId)
}

func (s *RestaurantService) CreateRestaurant(ctx context.Context, ownerId int, name, description string) (int, error) {
	return s.repo.CreateRestaurant(ctx, ownerId, name, description)
}

func (s *RestaurantService) UpdateRestaurant(ctx context.Context, id int, name, description string) error {
	return s.repo.UpdateRestaurant(ctx, id, name, description)
}

func (s *RestaurantService) DeleteRestaurant(ctx context.Context, id int) error {
	return s.repo.DeleteRestaurant(ctx, id)
}
