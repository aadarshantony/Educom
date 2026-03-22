# EduCom — Full-Stack E-Commerce Platform

A production-grade e-commerce platform built on the MERN stack with Stripe payments, Cloudinary image uploads, JWT authentication, and transactional email notifications.

**Live Demo →** [educomecommerce.vercel.app](https://educomecommerce.vercel.app)
**API →** [educom-e-commerce-platform.onrender.com](https://educom-e-commerce-platform.onrender.com/api/health)

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Redux Toolkit + redux-persist
- React Router v6
- Tailwind CSS v4
- Framer Motion
- React Hook Form
- Axios

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- Multer (memory storage)
- Stripe SDK
- Resend (email)
- Cloudinary SDK

**Infrastructure**
- Frontend — Vercel
- Backend — Render
- Database — MongoDB Atlas
- Media CDN — Cloudinary
- Email — Resend
- Payments — Stripe

---

## Features

- **Authentication** — JWT login/register with bcrypt password hashing and role-based access (user / admin)
- **Product Catalog** — Search, filter by category, sort, pagination, featured products
- **Cart** — Server-side cart with quantity management, price snapshotting, coupon support
- **Wishlist** — Save/remove products, move to cart
- **Checkout** — Stripe hosted checkout with webhook verification and local dev fallback polling
- **Orders** — Full order history, status tracking timeline, admin order management
- **Reviews** — Star ratings, comments, per-user review limit, rating recalculation
- **Coupon System** — Admin-created discount codes (percentage or fixed), usage caps, expiry dates
- **Image Upload** — Drag-and-drop multi-image upload to Cloudinary, cover image selection, gallery management
- **Email Notifications** — Login alerts, order confirmations, status update emails via Resend
- **Admin Dashboard** — Product CRUD, order management, coupon management, sales analytics with revenue chart

---

## 🔐 Demo Access

Explore the full platform — including the admin dashboard — using the credentials below.

### 👤 Admin Account

| Field    | Value                  |
|----------|------------------------|
| Email    | `n28el30im@mozmail.com`|
| Password | `DtGF8-MQst8N:q?`      |

> **Admin dashboard** is available at [`/admin`](https://educomecommerce.vercel.app/admin) — manage products, orders, coupons, and view sales analytics.

### 🛒 Regular User

You can also register a new account at `/register` to test the customer experience — shopping, checkout, order tracking, and wishlist.

---

> ⚠️ This is a demo environment. Feel free to explore, but please don't delete existing products or orders so other testers have a good experience. Use Stripe's test card `4242 4242 4242 4242` for payments.

---

## Project Structure

```
educom-ecommerce/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── couponController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   ├── uploadController.js
│   │   └── wishlistController.js
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Coupon.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── wishlistRoutes.js
│   ├── services/
│   │   └── stripeService.js
│   ├── utils/
│   │   ├── cloudinary.js
│   │   ├── emailTemplates.js
│   │   ├── generateToken.js
│   │   └── sendEmail.js
│   ├── validators/
│   │   └── authValidator.js
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js
│   │   ├── app/
│   │   │   └── store.js
│   │   ├── components/
│   │   │   ├── CartItem/
│   │   │   ├── Footer/
│   │   │   ├── ImageUploader/
│   │   │   ├── Loader/
│   │   │   ├── Navbar/
│   │   │   ├── ProductCard/
│   │   │   ├── RatingStars/
│   │   │   └── SearchBar/
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── PaymentSuccessPage.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ShopPage.jsx
│   │   │   └── WishlistPage.jsx
│   │   ├── redux/
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── cartSlice.js
│   │   │       ├── orderSlice.js
│   │   │       ├── productSlice.js
│   │   │       └── wishlistSlice.js
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── utils/
│   │   │   └── formatCurrency.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── EduCom_Project_Report.pdf
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Stripe account
- Resend account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/educom-ecommerce.git
cd educom-ecommerce
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=30d
FRONT_END_URL=http://localhost:5173

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RESEND_API_KEY=re_...
EMAIL_FROM_NAME=EduCom Support
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

> Leave `VITE_API_URL` unset in local dev if you want to use the Vite proxy instead.

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register and receive JWT |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/products` | Public | List products with filters |
| GET | `/api/products/:id` | Public | Single product with reviews |
| POST | `/api/cart/add` | Auth | Add item to cart |
| GET | `/api/cart` | Auth | Get current cart |
| POST | `/api/orders` | Auth | Create order from cart |
| GET | `/api/orders/my` | Auth | Order history |
| POST | `/api/payments/create-checkout-session` | Auth | Stripe checkout URL |
| GET | `/api/wishlist` | Auth | Get wishlist |
| POST | `/api/coupons/validate` | Auth | Validate coupon code |
| POST | `/api/upload/multiple` | Admin | Upload images to Cloudinary |
| GET | `/api/orders/admin/analytics` | Admin | Sales analytics |

Full API documentation is in the [project report](./EduCom_Project_Report.pdf).

---

## Deployment

### Frontend — Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com`
5. Deploy

The `vercel.json` in the frontend folder handles React Router client-side routing automatically.

### Backend — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env.example` in the Render dashboard
6. Deploy

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to respond.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret for signing tokens — use a long random string |
| `JWT_EXPIRES_IN` | ✅ | Token lifetime e.g. `30d` |
| `FRONT_END_URL` | ✅ | Vercel URL for CORS and Stripe redirects |
| `STRIPE_SECRET_KEY` | ✅ | From Stripe dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | Required for production webhook verification |
| `CLOUDINARY_CLOUD_NAME` | ✅ | From Cloudinary console |
| `CLOUDINARY_API_KEY` | ✅ | From Cloudinary console |
| `CLOUDINARY_API_SECRET` | ✅ | From Cloudinary console |
| `RESEND_API_KEY` | ✅ | From resend.com → API Keys |
| `EMAIL_FROM_NAME` | ✅ | Display name shown in email inbox |
| `EMAIL_FROM_ADDRESS` | ✅ | `onboarding@resend.dev` or verified custom domain |

---

## Creating an Admin Account

There is no admin registration UI by design. To make a user an admin, update their role directly in MongoDB Atlas:

```js
// In MongoDB Atlas → Collections → users
// Find the user document and update:
{ $set: { role: "admin" } }
```

Admin users get access to the `/admin` dashboard with product management, order management, coupon creation, and sales analytics.

---

## Stripe Testing

Use these test card numbers in Stripe Checkout:

| Card | Number | Use |
|------|--------|-----|
| Visa (success) | `4242 4242 4242 4242` | Successful payment |
| Declined | `4000 0000 0000 0002` | Card declined |
| 3D Secure | `4000 0025 0000 3155` | Requires authentication |

Use any future expiry date, any 3-digit CVC, and any postal code.

---

## Documentation

The full project report (`EduCom_Project_Report.pdf`) covers:

- MERN architecture diagram
- Database schema & ER diagram
- JWT authentication flow
- Redux state management
- Stripe payment integration
- Complete API reference
- Deployment guide
- E-commerce best practices

---

## License

This project is for educational purposes.

---

<p align="center">Built with MongoDB · Express.js · React · Node.js</p>