package restaurantrepositories

import (
	"2kitchen/internal/models"
	"context"
	"errors"

	"github.com/jackc/pgx"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RestaurantRepository struct {
	db *pgxpool.Pool
}

func NewRestaurantRepository(ctx context.Context, db *pgxpool.Pool) (*RestaurantRepository, error) {
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS restaurants (
		id SERIAL PRIMARY KEY,
		owner_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
		name TEXT NOT NULL,
		description TEXT NOT NULL DEFAULT '',
		created_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(ctx, createTableQuery)
	if err != nil {
		return nil, err
	}

	return &RestaurantRepository{db: db}, nil
}

func (r *RestaurantRepository) AllRestaurants(ctx context.Context) ([]models.Restaurant, error) {
	query := `SELECT id, owner_id, name, description, created_on FROM restaurants ORDER BY id`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	restaurants := make([]models.Restaurant, 0)
	for rows.Next() {
		var restaurant models.Restaurant
		if err := rows.Scan(&restaurant.ID, &restaurant.OwnerID, &restaurant.Name, &restaurant.Description, &restaurant.CreatedOn); err != nil {
			return nil, err
		}
		restaurants = append(restaurants, restaurant)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return restaurants, nil
}

func (r *RestaurantRepository) RestaurantById(ctx context.Context, id int) (models.Restaurant, error) {
	query := `SELECT id, owner_id, name, description, created_on FROM restaurants WHERE id = $1`
	row := r.db.QueryRow(ctx, query, id)

	var restaurant models.Restaurant
	err := row.Scan(&restaurant.ID, &restaurant.OwnerID, &restaurant.Name, &restaurant.Description, &restaurant.CreatedOn)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Restaurant{}, errors.New("restaurant not found")
		}
		return models.Restaurant{}, err
	}

	return restaurant, nil
}

func (r *RestaurantRepository) RestaurantByOwner(ctx context.Context, ownerId int) (models.Restaurant, error) {
	query := `SELECT id, owner_id, name, description, created_on FROM restaurants WHERE owner_id = $1`
	row := r.db.QueryRow(ctx, query, ownerId)

	var restaurant models.Restaurant
	err := row.Scan(&restaurant.ID, &restaurant.OwnerID, &restaurant.Name, &restaurant.Description, &restaurant.CreatedOn)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Restaurant{}, errors.New("this account has not registered a restaurant yet")
		}
		return models.Restaurant{}, err
	}

	return restaurant, nil
}

func (r *RestaurantRepository) CreateRestaurant(ctx context.Context, ownerId int, name, description string) (int, error) {
	query := `
		INSERT INTO restaurants (owner_id, name, description)
		VALUES ($1, $2, $3)
		RETURNING id
	`
	var id int
	err := r.db.QueryRow(ctx, query, ownerId, name, description).Scan(&id)
	if err != nil {
		if isUniqueViolation(err) {
			return 0, errors.New("this account already has a registered restaurant")
		}
		return 0, err
	}

	return id, nil
}

func (r *RestaurantRepository) UpdateRestaurant(ctx context.Context, id int, name, description string) error {
	query := `UPDATE restaurants SET name = $1, description = $2 WHERE id = $3`
	_, err := r.db.Exec(ctx, query, name, description, id)
	return err
}

func (r *RestaurantRepository) DeleteRestaurant(ctx context.Context, id int) error {
	query := `DELETE FROM restaurants WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
