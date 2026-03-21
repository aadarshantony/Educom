import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, createCheckoutSession } from '../redux/slices/orderSlice';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Review', 'Payment'];

const CheckoutPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { items, totalPrice, coupon } = useSelector((s) => s.cart);
  const { loading } = useSelector((s) => s.orders);
  const [activeStep,    setActiveStep]    = useState(0);
  const [createdOrder,  setCreatedOrder]  = useState(null);
  const [payLoading,    setPayLoading]    = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  const TAX      = parseFloat((totalPrice * 0.18).toFixed(2));
  const SHIPPING = totalPrice > 500 ? 0 : 50;
  const DISCOUNT = coupon?.discount || 0;
  const TOTAL    = Math.max(0, totalPrice + TAX + SHIPPING - DISCOUNT);

  const handleShipping = () => setActiveStep(1);

  const handlePlaceOrder = async () => {
    const d = getValues();
    try {
      const order = await dispatch(createOrder({
        shippingAddress: { address: d.address, city: d.city, postalCode: d.postalCode, country: d.country },
        paymentMethod: 'stripe',
        couponCode: coupon?.code || undefined,
      })).unwrap();
      setCreatedOrder(order);
      setActiveStep(2);
    } catch (err) { toast.error(err || 'Failed to place order'); }
  };

  const handlePay = async () => {
    if (!createdOrder) return;
    setPayLoading(true);
    try {
      const data = await dispatch(createCheckoutSession(createdOrder._id)).unwrap();
      if (data.url) window.location.href = data.url;
    } catch (err) { toast.error(err || 'Payment failed'); setPayLoading(false); }
  };

  if (items.length === 0 && !createdOrder) return (
    <div className="pt-40 text-center">
      <p className="font-display text-3xl text-cream mb-4">Your bag is empty</p>
      <button onClick={() => navigate('/shop')} className="btn-gold">Shop Now</button>
    </div>
  );

  const SummaryPanel = () => (
    <div className="bg-noir-700 border border-gold-500/12 rounded-xl p-6">
      <h3 className="font-display text-lg text-cream mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.product?._id} className="flex items-center gap-3">
            <img src={item.product?.images?.[0]} alt={item.product?.name}
                 className="w-11 h-11 object-cover rounded bg-noir-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[0.82rem] text-cream truncate">{item.product?.name}</p>
              <p className="text-[0.72rem] text-muted">Qty: {item.quantity}</p>
            </div>
            <span className="text-[0.85rem] text-cream flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/8 pt-4 space-y-2.5 text-sm">
        {[
          { label: 'Subtotal', val: formatCurrency(totalPrice) },
          { label: 'GST 18%', val: formatCurrency(TAX) },
          { label: 'Shipping', val: SHIPPING === 0 ? 'Free' : formatCurrency(SHIPPING) },
          ...(DISCOUNT > 0 ? [{ label: 'Discount', val: `-${formatCurrency(DISCOUNT)}`, green: true }] : []),
        ].map((r) => (
          <div key={r.label} className="flex justify-between">
            <span className={r.green ? 'text-green-400' : 'text-muted'}>{r.label}</span>
            <span className={r.green ? 'text-green-400' : 'text-cream'}>{r.val}</span>
          </div>
        ))}
        <div className="border-t border-white/8 pt-3 flex justify-between">
          <span className="font-display text-base text-cream">Total</span>
          <span className="font-display text-xl text-gold-500">{formatCurrency(TOTAL)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="font-display text-4xl md:text-5xl text-cream mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                                transition-all border ${i < activeStep
                                  ? 'bg-gold-500 border-gold-500 text-noir-950'
                                  : i === activeStep
                                  ? 'border-gold-500 text-gold-500'
                                  : 'border-white/15 text-muted'}`}>
                  {i < activeStep ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-[0.62rem] tracking-widest uppercase ${i === activeStep ? 'text-gold-500' : 'text-muted'}`}>
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-4 transition-colors ${i < activeStep ? 'bg-gold-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Main */}
          <div className="md:col-span-3">

            {/* Step 0 — Shipping */}
            {activeStep === 0 && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl text-cream mb-6">Shipping Address</h2>
                <form onSubmit={handleSubmit(handleShipping)} className="space-y-4">
                  <div>
                    <label className="label-noir">Street Address</label>
                    <input {...register('address', { required: 'Required' })} className="input-noir"
                      placeholder="123 Main Street" />
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-noir">City</label>
                      <input {...register('city', { required: 'Required' })} className="input-noir" placeholder="Mumbai" />
                      {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="label-noir">Postal Code</label>
                      <input {...register('postalCode', { required: 'Required' })} className="input-noir" placeholder="400001" />
                      {errors.postalCode && <p className="text-red-400 text-xs mt-1">{errors.postalCode.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label-noir">Country</label>
                    <input {...register('country', { required: 'Required' })} className="input-noir" placeholder="India" />
                    {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country.message}</p>}
                  </div>
                  <button type="submit" className="btn-gold mt-2 px-10">Continue to Review</button>
                </form>
              </motion.div>
            )}

            {/* Step 1 — Review */}
            {activeStep === 1 && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl text-cream mb-6">Review Your Order</h2>
                <div className="p-4 bg-noir-700 border border-white/6 rounded mb-6">
                  <p className="eyebrow text-gold-500 mb-3">Shipping to</p>
                  {['address','city','postalCode','country'].map((f) => (
                    <p key={f} className="text-[0.88rem] text-muted">{getValues(f)}</p>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setActiveStep(0)} className="btn-outline px-6">Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="btn-gold px-8">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Place Order'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2 — Payment */}
            {activeStep === 2 && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl text-cream mb-6">Secure Payment</h2>
                <div className="p-8 bg-noir-700 border border-gold-500/15 rounded-xl text-center mb-6">
                  <Lock size={40} className="text-gold-500 mx-auto mb-4" />
                  <p className="font-display text-xl text-cream mb-2">Order Created Successfully</p>
                  <p className="text-[0.82rem] text-muted mb-1">
                    Order #{createdOrder?._id?.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-[0.8rem] text-muted">Complete payment securely with Stripe</p>
                </div>
                <button onClick={handlePay} disabled={payLoading} className="btn-gold w-full py-4 text-sm">
                  {payLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Redirecting to Stripe…</>
                    : <><Lock size={15} /> Pay {formatCurrency(TOTAL)} with Stripe</>
                  }
                </button>
                <p className="text-center text-[0.68rem] text-muted/50 mt-2">
                  You'll be redirected to Stripe's secure checkout
                </p>
              </motion.div>
            )}
          </div>

          {/* Summary */}
          <div className="md:col-span-2">
            <SummaryPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
