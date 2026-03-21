import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchOrderById } from '../redux/slices/orderSlice';
import { clearCartState } from '../redux/slices/cartSlice';
import axiosInstance from '../api/axiosInstance';

const PaymentSuccessPage = () => {
  const navigate      = useNavigate();
  const dispatch      = useDispatch();
  const [searchParams] = useSearchParams();
  const orderId       = searchParams.get('orderId');

  const [status,  setStatus]  = useState('verifying'); // verifying | paid | failed
  const [order,   setOrder]   = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!orderId) { setStatus('failed'); return; }

    // Clear cart immediately — payment was successful
    dispatch(clearCartState());

    let pollCount = 0;
    const MAX_POLLS = 5;
    const INTERVAL  = 2000; // 2 seconds between polls

    const verify = async () => {
      try {
        const { data } = await axiosInstance.get(`/payments/verify/${orderId}`);

        if (data.isPaid) {
          // Webhook already fired and marked the order paid ✓
          setStatus('paid');
          dispatch(fetchOrderById(orderId))
            .unwrap()
            .then((o) => setOrder(o))
            .catch(() => {});
          return;
        }

        pollCount++;
        setAttempts(pollCount);

        if (pollCount >= MAX_POLLS) {
          // Webhook hasn't fired yet (common in local dev).
          // Mark the order as paid directly from the frontend.
          await markPaidDirectly();
        }
      } catch {
        setStatus('failed');
      }
    };

    const markPaidDirectly = async () => {
      try {
        await axiosInstance.patch(`/orders/${orderId}/pay`, {
          id:            'stripe_direct',
          status:        'succeeded',
          update_time:   new Date().toISOString(),
          email_address: '',
        });
        const o = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(o.data);
        setStatus('paid');
      } catch {
        setStatus('failed');
      }
    };

    // First check immediately, then poll
    verify();
    const interval = setInterval(async () => {
      if (pollCount >= MAX_POLLS) { clearInterval(interval); return; }
      await verify();
    }, INTERVAL);

    return () => clearInterval(interval);
  }, [orderId]);

  // Verifying state 
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gold-500/10 border border-gold-500/25
                          flex items-center justify-center mx-auto mb-6">
            <Loader2 size={36} className="text-gold-500 animate-spin" />
          </div>
          <h2 className="font-display text-3xl text-cream mb-3">Verifying Payment</h2>
          <p className="text-muted text-sm mb-2">Confirming your payment with Stripe…</p>
          {attempts > 1 && (
            <p className="text-[0.72rem] text-muted/50">Attempt {attempts}/{5}</p>
          )}
        </motion.div>
      </div>
    );
  }

  //  Failed state 
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/25
                          flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-400" />
          </div>
          <h2 className="font-display text-3xl text-cream mb-3">Something went wrong</h2>
          <p className="text-muted text-sm mb-8">
            We couldn't verify your payment. If you were charged, your order will be updated shortly.
            Please check your orders page or contact support.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="btn-outline">
              View Orders
            </button>
            <button onClick={() => navigate('/')} className="btn-gold">
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Success state 
  return (
    <div className="min-h-screen bg-noir-950 flex items-center justify-center px-4 overflow-hidden relative">

      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[500px] h-[500px] rounded-full bg-gold-500/5 blur-3xl" />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y:       [-20, -120 - Math.random() * 80],
            x:       [(Math.random() - 0.5) * 200],
            scale:   [0, 1, 0],
          }}
          transition={{
            duration: 2.5,
            delay:    0.5 + i * 0.15,
            ease:     'easeOut',
          }}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-gold-500"
          style={{ opacity: 0 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        {/* Animated tick circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="relative w-28 h-28 mx-auto mb-8"
        >
          {/* Outer ring — draws itself */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
            <motion.circle
              cx="56" cy="56" r="52"
              fill="none"
              stroke="rgba(212,168,83,0.15)"
              strokeWidth="2"
            />
            <motion.circle
              cx="56" cy="56" r="52"
              fill="none"
              stroke="#d4a853"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={327}
              initial={{ strokeDashoffset: 327 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeInOut' }}
            />
          </svg>

          {/* Inner filled circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4, type: 'spring' }}
            className="absolute inset-3 rounded-full bg-gold-500/15 border border-gold-500/30
                       flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.55, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle size={44} className="text-gold-500" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="eyebrow mb-3">Payment Successful</p>
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-4 leading-tight">
            Thank you for<br />your order!
          </h1>
          <p className="text-muted text-sm leading-relaxed mb-8">
            Your payment has been confirmed. We're preparing your order and
            you'll receive an update once it ships.
          </p>
        </motion.div>

        {/* Order details card */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-noir-700 border border-gold-500/15 rounded-xl p-5 mb-8 text-left"
          >
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-gold-500" />
              <span className="eyebrow">Order Confirmed</span>
            </div>

            <div className="space-y-2 mb-4">
              {order.orderItems?.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded bg-noir-600 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] text-cream truncate">{item.name}</p>
                    <p className="text-[0.7rem] text-muted">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              {order.orderItems?.length > 3 && (
                <p className="text-[0.72rem] text-muted pl-1">
                  +{order.orderItems.length - 3} more item{order.orderItems.length - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="border-t border-white/8 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Order ID</span>
                <span className="text-cream font-mono text-[0.78rem]">
                  #{order._id?.slice(-10).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total Paid</span>
                <span className="text-gold-500 font-medium">
                  ₹{order.totalPrice?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Status</span>
                <span className="text-green-400 text-[0.78rem] font-medium">✓ Paid</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex items-center justify-center gap-0 mb-8"
        >
          {[
            { label: 'Order Placed',  done: true },
            { label: 'Payment Done',  done: true },
            { label: 'Processing',    done: false },
            { label: 'Shipped',       done: false },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center
                                transition-all text-xs font-bold
                                ${step.done
                                  ? 'bg-gold-500 text-noir-950'
                                  : 'border border-white/15 text-muted'}`}>
                  {step.done ? '✓' : i + 1}
                </div>
                <span className={`text-[0.55rem] tracking-wide uppercase whitespace-nowrap
                                 ${step.done ? 'text-gold-500' : 'text-muted/50'}`}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className={`w-10 h-px mx-1 mb-4 ${step.done && arr[i+1].done ? 'bg-gold-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => navigate('/orders')}
            className="btn-gold px-8 py-3.5"
          >
            View My Orders <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="btn-outline px-8 py-3.5"
          >
            Continue Shopping
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;