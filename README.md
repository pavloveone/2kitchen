# 2kitchen

[![Frontend](https://img.shields.io/website?url=https%3A%2F%2F2kitchen.vercel.app&label=frontend)](https://2kitchen.vercel.app)
[![Backend](https://img.shields.io/badge/backend-Render-46E3B7?logo=render&logoColor=white)](https://twokitchen-backend.onrender.com/restaurants)

**Live:** [2kitchen.vercel.app](https://2kitchen.vercel.app)

A restaurant ordering app built to practice a full stack end to end: a Go API, a React frontend, real JWT auth, and an admin panel with actual charts instead of static mockups.

Anyone can register a restaurant and fill it with a menu. Anyone else can browse it and order from it without needing an account. Ownership is enforced on the backend - logging in as one restaurant owner and trying to touch another restaurant's dishes or orders just doesn't work, it's not just hidden in the UI.

```
backend/    Go API (Fiber, PostgreSQL, JWT)
frontend/   React app (TypeScript, MUI, Zustand)
```

Each has its own README with setup instructions, the API surface, and what's actually implemented vs. still on the roadmap:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)

## Running it locally

```bash
cd backend && docker compose up --build
```

then in another terminal:

```bash
cd frontend && npm install && npm start
```

The frontend expects the API on `:8080` by default.

## Author

Alexander Pavlov
[LinkedIn](https://linkedin.com/in/pavloveone)
