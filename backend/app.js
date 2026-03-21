import express from 'express';
import cors from 'cors';

import authRoutes    from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes    from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes   from './routes/orderRoutes.js';
import reviewRoutes  from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes  from './routes/couponRoutes.js';
import uploadRoutes  from './routes/uploadRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors({
  origin: process.env.FRONT_END_URL,
  credentials: true,
}));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth',     authRoutes);
app.use('/api/users',    authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons',  couponRoutes);
app.use('/api/upload',   uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
