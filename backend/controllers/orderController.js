import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { orderPlacedEmailTemplate, orderStatusEmailTemplate } from '../utils/emailTemplates.js';

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Build order items + check stock
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      if (product.countInStock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for "${product.name}"` });
      }
      orderItems.push({
        product:  product._id,
        name:     product.name,
        image:    product.images[0],
        price:    item.price,
        quantity: item.quantity,
      });
    }

    // Price calculations
    const itemsPrice   = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const taxPrice     = parseFloat((itemsPrice * 0.18).toFixed(2));
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    let totalPrice     = itemsPrice + taxPrice + shippingPrice;

    // Coupon validation
    let couponApplied = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon || !coupon.isActive || coupon.usageCount >= coupon.maxUsage) {
        return res.status(400).json({ message: 'Invalid or expired coupon' });
      }
      if (new Date() > coupon.expiresAt) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }
      if (itemsPrice < coupon.minOrderAmount) {
        return res.status(400).json({ message: `Minimum order of ₹${coupon.minOrderAmount} required` });
      }

      const discount = coupon.discountType === 'percentage'
        ? parseFloat(((itemsPrice * coupon.discountValue) / 100).toFixed(2))
        : coupon.discountValue;

      totalPrice    = Math.max(0, totalPrice - discount);
      couponApplied = { code: coupon.code, discount };
      coupon.usageCount += 1;
      await coupon.save();
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      couponApplied,
    });

    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { countInStock: -item.quantity } });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    sendEmail({
      to:      req.user.email,
      subject: `Order Confirmed — #${order._id.toString().slice(-10).toUpperCase()}`,
      html:    orderPlacedEmailTemplate({ name: req.user.name, order }),
    }).catch((err) => console.error('Order email failed:', err.message));

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderItems.product', 'name images');
    res.status(200).json({ count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    const totalRevenue = orders.filter((o) => o.isPaid).reduce((s, o) => s + o.totalPrice, 0);
    res.status(200).json({ count: orders.length, totalRevenue, orders });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (status === 'delivered') {
      order.isDelivered  = true;
      order.deliveredAt  = new Date();
    }

    const updated = await order.save();

    if (order.user?.email) {
      sendEmail({
        to:      order.user.email,
        subject: `Your EduCom order has been ${status}`,
        html:    orderStatusEmailTemplate({ name: order.user.name, order: updated, status }),
      }).catch((err) => console.error('Status email failed:', err.message));
    }

    res.status(200).json({ message: 'Order status updated', order: updated });
  } catch (err) {
    next(err);
  }
};

export const markOrderAsPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid   = true;
    order.paidAt   = new Date();
    order.status   = 'processing';
    order.paymentResult = {
      id:            req.body.id,
      status:        req.body.status,
      update_time:   req.body.update_time,
      email_address: req.body.email_address,
    };

    const updated = await order.save();
    res.status(200).json({ message: 'Order marked as paid', order: updated });
  } catch (err) {
    next(err);
  }
};

export const getSalesAnalytics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders  = await Order.countDocuments({ isPaid: true });

    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.product', name: { $first: '$orderItems.name' }, totalSold: { $sum: '$orderItems.quantity' }, revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({ totalOrders, paidOrders, totalRevenue, monthlyRevenue, topProducts });
  } catch (err) {
    next(err);
  }
};