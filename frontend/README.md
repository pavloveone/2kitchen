# 2kitchen

**Live:** [2kitchen.vercel.app](https://2kitchen.vercel.app)

A restaurant ordering app, built as a way to practice a full stack end to end - Go API, React frontend, real JWT auth, an admin panel with actual charts instead of static mockups.

The idea: anyone can register a restaurant and fill it with a menu, and anyone else can browse it and order from it without needing an account. There's a "generate demo orders" button in the admin panel for when you've just set up a restaurant and want to see the analytics tab do something before real orders start coming in.

## What's here

- Browse restaurants, open one, order from its menu - no account needed
- Sign up, then register your own restaurant from the admin panel
- Admin panel: add/remove dishes, see incoming orders, revenue and order-status charts, edit or delete the restaurant
- Ownership is enforced on the backend, not just hidden in the UI - logging in as one restaurant owner and trying to edit another's menu just doesn't work

## Stack

React, TypeScript, MUI, Zustand, Recharts, Axios

## Running locally

```bash
git clone https://github.com/pavloveone/2kitchen.git
cd 2kitchen/frontend
npm install
npm start
```

Needs the backend running on `:8080` (see [../backend](../backend)), or set `REACT_APP_API_URL` if it's running somewhere else.

## Roadmap

- [x] Restaurant registration + JWT auth
- [x] Admin panel: dishes, orders, analytics, restaurant settings
- [x] Demo order generation for empty restaurants
- [ ] Waiter call + bill request
- [ ] E2E tests
- [ ] Custom UI kit instead of stock MUI components

## Author

Aleksandr Pavlov
[LinkedIn](https://linkedin.com/in/pavloveone)
