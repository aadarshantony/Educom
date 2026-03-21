import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../redux/slices/orderSlice';
import { formatCurrency } from '../utils/formatCurrency';
import { PageLoader } from '../components/Loader/Loader';
import useAuth from '../hooks/useAuth';

const STATUS_STYLE = {
  pending:    'badge-pending',
  processing: 'badge-processing',
  shipped:    'badge-shipped',
  delivered:  'badge-delivered',
  cancelled:  'badge-cancelled',
};

const TIMELINE = ['pending', 'processing', 'shipped', 'delivered'];

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const idx = TIMELINE.indexOf(order.status);

  return (
    <div className="bg-noir-700 border border-white/5 rounded-xl overflow-hidden
                    hover:border-gold-500/15 transition-colors">

      {/* Header row */}
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap items-center gap-4 p-5 text-left">
        <div className="min-w-0">
          <p className="eyebrow mb-0.5">Order</p>
          <p className="font-display text-base text-cream tracking-wider">
            #{order._id.slice(-10).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-6 ml-auto flex-wrap">
          <div className="text-right">
            <p className="eyebrow mb-0.5">Date</p>
            <p className="text-[0.82rem] text-muted">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="eyebrow mb-0.5">Total</p>
            <p className="text-[0.95rem] text-gold-500 font-medium">{formatCurrency(order.totalPrice)}</p>
          </div>
          <span className={`text-[0.65rem] tracking-wider uppercase px-3 py-1 rounded-full font-medium ${STATUS_STYLE[order.status]}`}>
            {order.status}
          </span>
          {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
        </div>
      </button>

      {/* Status timeline */}
      {order.status !== 'cancelled' && (
        <div className="px-5 pb-4 flex items-center">
          {TIMELINE.map((step, i) => {
            const done   = i <= idx;
            const active = i === idx;
            return (
              <div key={step} className={`flex items-center ${i < TIMELINE.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-full border transition-all
                                  ${done ? 'bg-gold-500 border-gold-500' : 'border-white/15'}
                                  ${active ? 'shadow-[0_0_8px_rgba(212,168,83,0.5)]' : ''}`} />
                  <span className={`text-[0.52rem] tracking-wider uppercase whitespace-nowrap
                                   ${done ? 'text-gold-500' : 'text-muted/50'}`}>
                    {step}
                  </span>
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-3.5 transition-colors ${i < idx ? 'bg-gold-500' : 'bg-white/8'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded details */}
      {open && (
        <div className="border-t border-white/6 p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="eyebrow text-gold-500 mb-3">Items</p>
            <div className="space-y-3">
              {order.orderItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name}
                       className="w-12 h-12 object-cover rounded bg-noir-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.85rem] text-cream truncate">{item.name}</p>
                    <p className="text-[0.72rem] text-muted">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <span className="text-[0.85rem] text-cream flex-shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow text-gold-500 mb-3">Details</p>
            {[
              { label: 'Payment',  value: order.isPaid ? `Paid ${new Date(order.paidAt).toLocaleDateString('en-IN')}` : 'Unpaid' },
              { label: 'Shipping', value: `${order.shippingAddress?.city}, ${order.shippingAddress?.country}` },
              { label: 'Items',    value: formatCurrency(order.itemsPrice) },
              { label: 'Tax',      value: formatCurrency(order.taxPrice) },
              { label: 'Total',    value: formatCurrency(order.totalPrice) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-1.5 border-b border-white/4 last:border-0">
                <span className="text-[0.8rem] text-muted">{row.label}</span>
                <span className="text-[0.8rem] text-cream">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { isAuthenticated } = useAuth();
  const { myOrders, loading } = useSelector((s) => s.orders);

  useEffect(() => { if (isAuthenticated) dispatch(fetchMyOrders()); }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="pt-40 text-center">
      <p className="font-display text-3xl text-cream mb-4">Sign in to view your orders</p>
      <button onClick={() => navigate('/login')} className="btn-gold">Sign In</button>
    </div>
  );

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <p className="eyebrow mb-1">Your</p>
        <h1 className="font-display text-4xl md:text-5xl text-cream mb-10">
          Orders{' '}
          {myOrders.length > 0 && <span className="text-xl text-muted font-sans">({myOrders.length})</span>}
        </h1>

        {loading ? <PageLoader /> : myOrders.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <Package size={72} className="text-muted/30 mx-auto" />
            <p className="font-display text-3xl text-muted">No orders yet</p>
            <p className="text-muted/60">Start shopping to see your orders here</p>
            <button onClick={() => navigate('/shop')} className="btn-gold mt-2">Browse Collection</button>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order, i) => (
              <motion.div key={order._id}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
