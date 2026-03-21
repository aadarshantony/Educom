import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Package, Users, Edit2, Trash2,
  Plus, X, Loader2, Tag, CheckCircle, AlertCircle, ChevronDown,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, fetchAllOrders, updateOrderStatus } from '../redux/slices/orderSlice';
import { fetchProducts, deleteProduct, createProduct, updateProduct } from '../redux/slices/productSlice';
import { formatCurrency } from '../utils/formatCurrency';
import { PageLoader } from '../components/Loader/Loader';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader/ImageUploader';
import axiosInstance from '../api/axiosInstance';

const STATUS_COLOR = {
  pending: 'text-amber-400', processing: 'text-blue-400',
  shipped: 'text-purple-400', delivered: 'text-green-400', cancelled: 'text-red-400',
};

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-noir-700 border border-white/5 rounded-xl p-5">
    <div className="inline-flex p-2.5 rounded-lg bg-gold-500/8 mb-3">
      <Icon size={20} className="text-gold-500" />
    </div>
    <p className="eyebrow mb-1">{label}</p>
    <p className="font-display text-3xl text-cream leading-none">{value}</p>
    {sub && <p className="text-[0.72rem] text-muted mt-1">{sub}</p>}
  </div>
);

const RevenueChart = ({ data }) => {
  if (!data?.length) return null;
  const max    = Math.max(...data.map((d) => d.revenue), 1);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div className="bg-noir-700 border border-white/5 rounded-xl p-6">
      <h3 className="font-display text-xl text-cream mb-6">Monthly Revenue</h3>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, (d.revenue / max) * 100)}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="w-full rounded-t bg-gradient-to-t from-gold-600/60 to-gold-500 min-h-[4px]"
            />
            <span className="text-[0.52rem] text-muted uppercase">
              {months[(d._id?.month || 1) - 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


const ProductDialog = ({ open, onClose, product, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [images,   setImages]   = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [imgError, setImgError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({ name: product.name, brand: product.brand, category: product.category, description: product.description, price: product.price, countInStock: product.countInStock, isFeatured: product.isFeatured });
      setImages(product.images || []);
    } else {
      reset({});
      setImages([]);
    }
    setImgError('');
  }, [product, open]);

  if (!open) return null;

  const onSubmit = async (data) => {
    if (images.length === 0) { setImgError('Please upload at least one product image'); return; }
    setSaving(true);
    try {
      await onSave({ ...data, price: Number(data.price), countInStock: Number(data.countInStock), images, isFeatured: data.isFeatured === 'true' || data.isFeatured === true });
      onClose();
    } catch { /* handled by parent */ }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-noir-800 border border-gold-500/15 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/6 sticky top-0 bg-noir-800 z-10">
          <h2 className="font-display text-2xl text-cream">{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="text-muted hover:text-cream transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <ImageUploader value={images} onChange={setImages} maxImages={10} label="Product Images" />
            {imgError && <p className="text-red-400 text-xs mt-2">{imgError}</p>}
            <p className="text-[0.68rem] text-muted mt-2">First image is the cover shown in listings.</p>
          </div>
          <div className="border-t border-white/6 pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'name',         label: 'Product Name', type: 'text',   rules: { required: 'Required' } },
                { name: 'brand',        label: 'Brand',         type: 'text' },
                { name: 'category',     label: 'Category',      type: 'text',  rules: { required: 'Required' } },
                { name: 'price',        label: 'Price (₹)',      type: 'number', rules: { required: 'Required' } },
                { name: 'countInStock', label: 'Stock',         type: 'number', rules: { required: 'Required' } },
              ].map((f) => (
                <div key={f.name}>
                  <label className="label-noir">{f.label}</label>
                  <input type={f.type} step={f.type === 'number' ? 'any' : undefined}
                    {...register(f.name, f.rules || {})} className="input-noir" />
                  {errors[f.name] && <p className="text-red-400 text-xs mt-1">{errors[f.name].message}</p>}
                </div>
              ))}
              <div className="flex items-center gap-3 self-end pb-1">
                <input type="checkbox" id="isFeatured" {...register('isFeatured')} className="w-4 h-4 accent-gold-500 cursor-pointer" />
                <label htmlFor="isFeatured" className="text-sm text-cream cursor-pointer">Mark as Featured</label>
              </div>
            </div>
            <div className="mt-4">
              <label className="label-noir">Description</label>
              <textarea rows={4} {...register('description', { required: 'Required' })}
                placeholder="Describe the product…" className="input-noir resize-none" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-white/6">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold flex-1">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


const CouponDialog = ({ open, onClose, onCreated }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { discountType: 'percentage', minOrderAmount: 0, maxUsage: 100 },
  });
  const [saving, setSaving] = useState(false);
  const discountType = watch('discountType');

  useEffect(() => { if (open) reset({ discountType: 'percentage', minOrderAmount: 0, maxUsage: 100 }); }, [open]);

  if (!open) return null;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await axiosInstance.post('/coupons', {
        ...data,
        discountValue:   Number(data.discountValue),
        minOrderAmount:  Number(data.minOrderAmount),
        maxUsage:        Number(data.maxUsage),
      });
      toast.success('Coupon created!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-noir-800 border border-gold-500/15 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/6">
          <h2 className="font-display text-2xl text-cream">Create Coupon</h2>
          <button onClick={onClose} className="text-muted hover:text-cream"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label className="label-noir">Coupon Code</label>
            <input {...register('code', { required: 'Required' })} className="input-noir uppercase"
              placeholder="e.g. SAVE20" style={{ textTransform: 'uppercase' }} />
            {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>}
          </div>

          {/* Discount type */}
          <div>
            <label className="label-noir">Discount Type</label>
            <div className="relative">
              <select {...register('discountType')}
                className="input-noir appearance-none pr-8 cursor-pointer">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </div>

          {/* Discount value */}
          <div>
            <label className="label-noir">
              Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}
            </label>
            <input type="number" step="any"
              {...register('discountValue', {
                required: 'Required',
                min: { value: 0, message: 'Must be positive' },
                max: discountType === 'percentage' ? { value: 100, message: 'Max 100%' } : undefined,
              })}
              className="input-noir"
              placeholder={discountType === 'percentage' ? '20' : '100'} />
            {errors.discountValue && <p className="text-red-400 text-xs mt-1">{errors.discountValue.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Min order */}
            <div>
              <label className="label-noir">Min Order (₹)</label>
              <input type="number" step="any" {...register('minOrderAmount', { min: 0 })}
                className="input-noir" placeholder="0" />
            </div>
            {/* Max usage */}
            <div>
              <label className="label-noir">Max Uses</label>
              <input type="number" {...register('maxUsage', { required: 'Required', min: 1 })}
                className="input-noir" placeholder="100" />
              {errors.maxUsage && <p className="text-red-400 text-xs mt-1">{errors.maxUsage.message}</p>}
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="label-noir">Expiry Date</label>
            <input type="date"
              {...register('expiresAt', { required: 'Required' })}
              min={new Date().toISOString().split('T')[0]}
              className="input-noir" />
            {errors.expiresAt && <p className="text-red-400 text-xs mt-1">{errors.expiresAt.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold flex-1">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : 'Create Coupon'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


const CouponsTab = () => {
  const [coupons,       setCoupons]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [deletingId,    setDeletingId]    = useState(null);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/coupons');
      setCoupons(data.coupons || []);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCoupons(); }, []);

  const handleToggle = async (coupon) => {
    try {
      await axiosInstance.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      toast.success(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated');
      loadCoupons();
    } catch { toast.error('Failed to update coupon'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch { toast.error('Failed to delete coupon'); }
    finally { setDeletingId(null); }
  };

  const isExpired = (c) => new Date() > new Date(c.expiresAt);
  const isFull    = (c) => c.usageCount >= c.maxUsage;

  const getStatus = (c) => {
    if (!c.isActive)   return { label: 'Inactive',  cls: 'bg-white/8 text-muted border-white/10' };
    if (isExpired(c))  return { label: 'Expired',   cls: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (isFull(c))     return { label: 'Used Up',   cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    return               { label: 'Active',    cls: 'bg-green-500/10 text-green-400 border-green-500/20' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-muted text-sm">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setDialogOpen(true)} className="btn-gold gap-1.5">
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : coupons.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={48} className="text-muted/30 mx-auto mb-4" />
          <p className="font-display text-2xl text-muted mb-2">No coupons yet</p>
          <p className="text-muted/60 text-sm mb-6">Create your first discount code</p>
          <button onClick={() => setDialogOpen(true)} className="btn-gold">Create Coupon</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {coupons.map((c) => {
              const status   = getStatus(c);
              const usagePct = Math.min(100, (c.usageCount / c.maxUsage) * 100);

              return (
                <motion.div key={c._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-noir-700 border border-white/5 rounded-xl p-5 relative overflow-hidden
                             hover:border-gold-500/15 transition-colors"
                >
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gold-500/4 rounded-bl-full" />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag size={13} className="text-gold-500" />
                        <span className="font-mono text-gold-500 font-bold tracking-widest text-sm">
                          {c.code}
                        </span>
                      </div>
                      <span className={`text-[0.62rem] px-2 py-0.5 rounded-full border font-medium tracking-wide ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-cream leading-none">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                      </p>
                      <p className="text-[0.65rem] text-muted mt-0.5">off</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-4">
                    {c.minOrderAmount > 0 && (
                      <div className="flex justify-between text-[0.75rem]">
                        <span className="text-muted">Min order</span>
                        <span className="text-cream">{formatCurrency(c.minOrderAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[0.75rem]">
                      <span className="text-muted">Expires</span>
                      <span className={isExpired(c) ? 'text-red-400' : 'text-cream'}>
                        {new Date(c.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Usage bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[0.68rem] mb-1.5">
                      <span className="text-muted">Usage</span>
                      <span className="text-cream">{c.usageCount} / {c.maxUsage}</span>
                    </div>
                    <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          usagePct >= 100 ? 'bg-red-500' : usagePct >= 75 ? 'bg-amber-500' : 'bg-gold-500'
                        }`}
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-white/6 pt-4">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-[0.68rem]
                                  font-medium tracking-wide uppercase transition-colors border
                                  ${c.isActive
                                    ? 'border-white/10 text-muted hover:border-red-500/30 hover:text-red-400'
                                    : 'border-green-500/25 text-green-400 hover:bg-green-500/6'}`}
                    >
                      {c.isActive
                        ? <><X size={11} /> Deactivate</>
                        : <><CheckCircle size={11} /> Activate</>
                      }
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deletingId === c._id}
                      className="p-2 text-muted hover:text-red-400 border border-white/8
                                 hover:border-red-500/20 rounded transition-colors"
                    >
                      {deletingId === c._id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <CouponDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={loadCoupons}
      />
    </div>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { analytics, allOrders } = useSelector((s) => s.orders);
  const { items: products }      = useSelector((s) => s.products);
  const [tab,    setTab]    = useState(0);
  const [dialog, setDialog] = useState({ open: false, product: null });

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAnalytics());
      dispatch(fetchAllOrders());
      dispatch(fetchProducts({ limit: 100 }));
    }
  }, [isAdmin]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status })).unwrap();
      toast.success('Status updated');
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success('Product deleted');
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleSave = async (data) => {
    try {
      if (dialog.product) {
        await dispatch(updateProduct({ id: dialog.product._id, ...data })).unwrap();
        toast.success('Product updated');
      } else {
        await dispatch(createProduct(data)).unwrap();
        toast.success('Product created');
      }
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err) { toast.error(err || 'Save failed'); throw err; }
  };

  if (!isAdmin) return (
    <div className="pt-40 text-center"><p className="text-red-400 text-xl">Access denied</p></div>
  );

  const TABS = ['Products', 'Orders', 'Coupons'];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="font-display text-4xl md:text-5xl text-cream mb-8">Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: TrendingUp,  label: 'Total Revenue', value: formatCurrency(analytics?.totalRevenue || 0) },
            { icon: ShoppingBag, label: 'Total Orders',  value: analytics?.totalOrders  || 0, sub: `${analytics?.paidOrders || 0} paid` },
            { icon: Package,     label: 'Products',      value: products.length },
            { icon: Users,       label: 'Paid Orders',   value: analytics?.paidOrders   || 0 },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>

        {/* Revenue chart */}
        {analytics?.monthlyRevenue?.length > 0 && (
          <div className="mb-6"><RevenueChart data={analytics.monthlyRevenue} /></div>
        )}

        {/* Top products */}
        {analytics?.topProducts?.length > 0 && (
          <div className="bg-noir-700 border border-white/5 rounded-xl p-6 mb-6">
            <h3 className="font-display text-xl text-cream mb-5">Top Products</h3>
            <div className="space-y-4">
              {analytics.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[0.68rem] text-muted w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[0.85rem] text-cream">{p.name}</span>
                      <span className="text-[0.82rem] text-gold-500">{formatCurrency(p.revenue)}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.totalSold / analytics.topProducts[0].totalSold) * 100}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-gold-500 to-gold-500/40 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-[0.72rem] text-muted w-16 text-right">{p.totalSold} sold</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/6 mb-6 gap-1">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-5 py-2.5 text-[0.72rem] tracking-widest uppercase transition-colors border-b-2 -mb-px
                          ${tab === i ? 'text-gold-500 border-gold-500' : 'text-muted border-transparent hover:text-cream'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Products ── */}
        {tab === 0 && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setDialog({ open: true, product: null })} className="btn-gold gap-1.5">
                <Plus size={14} /> New Product
              </button>
            </div>
            <div className="bg-noir-700 border border-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-noir-600 border-b border-white/5">
                      {['Product','Category','Price','Stock','Rating','Actions'].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 eyebrow text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id} className="border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0] || '/images/placeholder.jpg'} alt={p.name}
                              className="w-10 h-10 object-cover rounded bg-noir-600 flex-shrink-0" />
                            <span className="text-cream text-[0.85rem] max-w-[160px] truncate">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted text-[0.78rem]">{p.category}</td>
                        <td className="px-5 py-4 text-gold-500 text-[0.85rem]">{formatCurrency(p.price)}</td>
                        <td className="px-5 py-4">
                          <span className={`text-[0.7rem] px-2.5 py-1 rounded border font-medium
                                           ${p.countInStock > 0 ? 'badge-delivered' : 'badge-cancelled'}`}>
                            {p.countInStock}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted text-[0.78rem]">★ {p.rating?.toFixed(1)}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <button onClick={() => setDialog({ open: true, product: p })}
                              className="p-1.5 text-muted hover:text-gold-500 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(p._id)}
                              className="p-1.5 text-muted hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Orders ── */}
        {tab === 1 && (
          <div className="bg-noir-700 border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-noir-600 border-b border-white/5">
                    {['Order ID','Customer','Date','Total','Payment','Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 eyebrow text-muted whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map((order) => (
                    <tr key={order._id} className="border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono text-[0.75rem] text-muted">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 text-cream text-[0.85rem]">{order.user?.name || '—'}</td>
                      <td className="px-5 py-4 text-muted text-[0.78rem]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-4 text-gold-500">{formatCurrency(order.totalPrice)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[0.65rem] px-2.5 py-1 rounded border font-medium
                                         ${order.isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`bg-noir-600 border border-white/10 rounded px-2.5 py-1.5
                                       text-[0.75rem] focus:outline-none focus:border-gold-500/40
                                       cursor-pointer appearance-none pr-6 ${STATUS_COLOR[order.status]}`}>
                            {['pending','processing','shipped','delivered','cancelled'].map((s) => (
                              <option key={s} value={s} className="bg-noir-700 text-cream">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Coupons ── */}
        {tab === 2 && <CouponsTab />}
      </div>

      <ProductDialog
        open={dialog.open}
        product={dialog.product}
        onClose={() => setDialog({ open: false, product: null })}
        onSave={handleSave}
      />
    </div>
  );
};

export default AdminDashboard;