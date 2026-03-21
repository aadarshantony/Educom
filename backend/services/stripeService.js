import Stripe from 'stripe';
import Order from '../models/Order.js';

let _stripe = null;
const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const stripe = getStripe();
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('orderItems.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (order.isPaid) return res.status(400).json({ message: 'Order is already paid' });

    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: { name: item.name, images: item.image ? [item.image] : [] },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (order.taxPrice > 0) lineItems.push({ price_data: { currency: 'inr', product_data: { name: 'GST (18%)' }, unit_amount: Math.round(order.taxPrice * 100) }, quantity: 1 });
    if (order.shippingPrice > 0) lineItems.push({ price_data: { currency: 'inr', product_data: { name: 'Shipping' }, unit_amount: Math.round(order.shippingPrice * 100) }, quantity: 1 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONT_END_URL}/payment-success?orderId=${order._id}`,
      cancel_url: `${process.env.FRONT_END_URL}/checkout?cancelled=true`,
      metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
      customer_email: req.user.email,
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) { next(err); }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(200).json({ received: true });

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const order = await Order.findById(session.metadata.orderId);
      if (order && !order.isPaid) {
        order.isPaid = true; order.paidAt = new Date(); order.status = 'processing';
        order.paymentResult = { id: session.id, status: session.payment_status, update_time: new Date().toISOString(), email_address: session.customer_email };
        await order.save();
      }
    } catch (err) { console.error('Webhook order update failed:', err.message); }
  }
  res.status(200).json({ received: true });
};

export const verifyPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    res.status(200).json({ isPaid: order.isPaid, paidAt: order.paidAt, paymentResult: order.paymentResult });
  } catch (err) { next(err); }
};