# 2kitchen backend

[![Backend](https://img.shields.io/badge/backend-Render-46E3B7?logo=render&logoColor=white)](https://twokitchen-backend.onrender.com/restaurants)
[![Go](https://img.shields.io/badge/go-1.23-00ADD8?logo=go&logoColor=white)](go.mod)

**Live:** [twokitchen-backend.onrender.com](https://twokitchen-backend.onrender.com/restaurants)

Backend for 2kitchen, a small multi-tenant restaurant ordering app. Anyone can sign up, register their own restaurant, fill it with dishes, and get an admin panel with order stats. Customers browse restaurants and place orders without needing an account.

Frontend: [../frontend](../frontend)

## Stack

Go, Fiber, PostgreSQL (pgx), JWT, Docker

## How it's structured

A restaurant belongs to exactly one account. Dishes and orders belong to a restaurant and get deleted along with it. Browsing a menu and placing an order doesn't require logging in - auth is only needed for managing your own restaurant (adding dishes, checking orders, editing or deleting the restaurant). The backend resolves "which restaurant is this request for" from the JWT itself rather than trusting whatever id the client sends, so one account can't touch another account's data by fiddling with request bodies.

There's also a `POST /orders/simulate` endpoint that fills a restaurant with a batch of randomized orders spread over the last month, mostly so the analytics tab has something to show before real customers show up.

## API

**Auth** (`/users`)
- `POST /users` – register
- `POST /users/login` – log in, returns access + refresh tokens

**Restaurants** (`/restaurants`)
- `GET /restaurants` – list all (public)
- `GET /restaurants/:id` – get one (public)
- `POST /restaurants` – create your restaurant (auth, one per account)
- `GET /restaurants/me` – your restaurant
- `PUT /restaurants/me` – update name/description
- `DELETE /restaurants/me` – delete it, along with its dishes and orders

**Dishes** (`/dishes`)
- `GET /dishes/:restId` – menu for a restaurant (public)
- `GET /dishes/:restId/:id` – single dish (public)
- `POST /dishes` – add a dish to your restaurant
- `DELETE /dishes` – remove a dish from your restaurant

**Orders** (`/orders`)
- `POST /orders` – place an order (public, no account needed)
- `GET /orders` – your restaurant's orders
- `POST /orders/simulate` – generate demo orders for your restaurant

Anything above marked without "(public)" requires a `Bearer` token from `/users/login`.

## Running locally

```bash
docker compose up --build
```

This starts the API on `:8080` plus a Postgres container. You'll need a `.env` with:

```env
JWT_SECRET=some-random-string
DATABASE_URL=postgres://kitchen_user:kitchen_pass@db:5432/kitchen_db
```

`docker-compose.yml` passes `.env` into the container itself, so it never gets baked into the built image.

## Tests

```bash
TEST_DATABASE_URL=postgres://kitchen_user:kitchen_pass@localhost:5432/kitchen_test?sslmode=disable JWT_SECRET=... go test ./...
```

## Deployment

Set up for Render (`render.yaml` at the repo root, free tier) with Postgres hosted on Neon rather than Render's own database. `DATABASE_URL` and `JWT_SECRET` are set as environment variables directly in Render - they're intentionally left out of `render.yaml` so nothing sensitive ends up committed.

## Roadmap

- [x] PostgreSQL + Docker
- [x] JWT auth wired into the routes that actually need it
- [x] Multi-restaurant support with ownership checks
- [x] Order analytics + demo data generation
- [ ] Swagger docs
- [ ] Integration tests beyond the current handler tests

## Author

Aleksandr Pavlov
[LinkedIn](https://linkedin.com/in/pavloveone)
