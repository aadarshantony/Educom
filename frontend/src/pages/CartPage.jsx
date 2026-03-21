import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ShoppingBag, Tag, ArrowRight, Loader2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/slices/cartSlice';
import { applyCoupon, removeCoupon } from '../redux/slices/cartSlice';
import CartItem from '../components/CartItem/CartItem';
import { formatCurrency } from '../utils/formatCurrency';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { isAuthenticated } = useAuth();
  const { items, totalPrice, coupon } = useSelector((s) => s.cart);
  const [couponCode,    setCouponCode]    = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => { if (isAuthenticated) dispatch(fetchCart()); }, [isAuthenticated]);

  const TAX       = parseFloat((totalPrice * 0.18).toFixed(2));
  const SHIPPING  = totalPrice > 500 ? 0 : 50;
  const DISCOUNT  = coupon?.discount || 0;
  const TOTAL     = Math.max(0, totalPrice + TAX + SHIPPING - DISCOUNT);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await axiosInstance.post('/coupons/validate', { code: couponCode, cartTotal: totalPrice });
      dispatch(applyCoupon(data));
      toast.success(`Coupon applied! You save ${formatCurrency(data.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  if (!isAuthenticated) return (
    <div className="pt-40 pb-20 text-center">
      <p className="font-display text-3xl text-cream mb-4">Sign in to view your bag</p>
      <button onClick={() => navigate('/login')} className="btn-gold">Sign In</button>
    </div>
  );

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">
        <p className="eyebrow mb-1">Your</p>
        <h1 className="font-display text-4xl md:text-5xl text-cream mb-10">
          Shopping Bag{' '}
          {items.length > 0 && <span className="text-xl text-muted font-sans">({items.length})</span>}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <ShoppingBag size={72} className="text-muted/30 mx-auto" />
            <p className="font-display text-3xl text-muted">Your bag is empty</p>
            <p className="text-muted/60">Discover something extraordinary</p>
            <button onClick={() => navigate('/shop')} className="btn-gold mt-2">Start Shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map((item) => <CartItem key={item.product?._id} item={item} />)}
              </AnimatePresence>
            </div>

            {/* Order summary */}
            <div>
              <div className="sticky top-24 bg-noir-700 border border-gold-500/12 rounded-xl p-6">
                <h2 className="font-display text-xl text-cream mb-5">Order Summary</h2>

                {/* Price rows */}
                <div className="space-y-3 mb-5">
                  {[
                    { label: 'Subtotal',    value: formatCurrency(totalPrice) },
                    { label: 'GST (18%)',   value: formatCurrency(TAX) },
                    { label: 'Shipping',    value: SHIPPING === 0 ? 'Free' : formatCurrency(SHIPPING) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-muted">{row.label}</span>
                      <span className="text-cream">{row.value}</span>
                    </div>
                  ))}
                  {DISCOUNT > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Discount</span>
                      <span className="text-green-400">-{formatCurrency(DISCOUNT)}</span>
                    </div>
                  )}
                </div>

                {/* Coupon */}
                <div className="mb-5">
                  {coupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-500/8 border
                                    border-green-500/20 rounded text-sm">
                      <div className="flex items-center gap-2 text-green-400">
                        <Tag size={13} /> {coupon.code}
                      </div>
                      <button onClick={() => { dispatch(removeCoupon()); setCouponCode(''); toast.success('Coupon removed'); }}
                        className="text-muted hover:text-red-400 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Coupon code"
                          className="input-noir pl-8 text-sm py-2.5"
                        />
                      </div>
                      <button onClick={handleApplyCoupon} disabled={couponLoading}
                        className="btn-outline px-4 py-2.5 text-[0.68rem] flex-shrink-0">
                        {couponLoading ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/8 pt-5 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="font-display text-lg text-cream">Total</span>
                    <span className="font-display text-2xl text-gold-500">{formatCurrency(TOTAL)}</span>
                  </div>
                </div>

                <button onClick={() => navigate('/checkout')} className="btn-gold w-full py-3.5">
                  Proceed to Checkout <ArrowRight size={15} />
                </button>
                <p className="text-center text-[0.68rem] text-muted/60 mt-3">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
