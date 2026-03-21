# NOIR — E-Commerce Frontend

Modern, production-quality React frontend for the NOIR E-Commerce platform.

## Tech Stack
- **React 18** + **Vite**
- **Redux Toolkit** + **redux-persist** (auth & cart persist across page reloads)
- **React Router v6** (lazy-loaded pages + protected routes)
- **Material UI v5** with custom dark luxury theme
- **Framer Motion** for page transitions and animations
- **React Hook Form** for all forms
- **Axios** with JWT interceptors
- **React Hot Toast** for notifications
- **Stripe** redirect checkout

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (proxy → backend at localhost:5000)
npm run dev

# 3. Build for production
npm run build
```

The Vite proxy forwards all `/api/*` requests to `http://localhost:5000`,
so make sure the backend is running first.

## Folder Structure

```
src/
├── api/          axiosInstance with JWT + 401 auto-redirect
├── app/          Redux store with persist config
├── components/   Shared UI components (Navbar, Footer, Cards, etc.)
├── pages/        Route-level page components (lazy-loaded)
├── redux/slices/ Feature slices: auth, products, cart, wishlist, orders
├── routes/       ProtectedRoute + AdminRoute wrappers
├── hooks/        useAuth() convenience hook
└── utils/        formatCurrency (INR)
```

## Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Homepage, hero, categories, new arrivals |
| `/shop` | Public | All products with filters, search, pagination |
| `/product/:id` | Public | Product detail, gallery, reviews |
| `/login` | Public | JWT login |
| `/register` | Public | Account creation |
| `/cart` | Auth | Cart with coupon support |
| `/wishlist` | Auth | Saved products |
| `/checkout` | Auth | Address → Review → Stripe payment |
| `/orders` | Auth | Order history with status timeline |
| `/admin` | Admin | Dashboard: analytics, products CRUD, orders |

## Key Notes

- **Cart & auth** are persisted to `localStorage` via redux-persist.
- **Stripe** checkout redirects to Stripe's hosted page. On success/cancel,
  Stripe redirects back to `/order/:id?success=true`.
- **Admin dashboard** charts use pure CSS/Framer Motion (no chart library needed).
- All prices display in **INR** (`formatCurrency`). Change the locale in
  `utils/formatCurrency.js` to switch currency.
