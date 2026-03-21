import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ChevronRight, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, addProductReview, clearSelectedProduct } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import RatingStars from '../components/RatingStars/RatingStars';
import { formatCurrency } from '../utils/formatCurrency';
import { PageLoader } from '../components/Loader/Loader';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)}
        className={`text-xl leading-none transition-colors ${n <= value ? 'text-gold-500' : 'text-gold-500/20'}`}>
        ★
      </button>
    ))}
  </div>
);

const ProductPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const { isAuthenticated } = useAuth();
  const { selectedProduct: product, detailLoading } = useSelector((s) => s.products);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const isWishlisted  = wishlistItems.some((i) => (i._id || i) === id);

  const [selectedImg,     setSelectedImg]     = useState(0);
  const [qty,             setQty]             = useState(1);
  const [reviewRating,    setReviewRating]    = useState(5);
  const [reviewComment,   setReviewComment]   = useState('');
  const [reviewLoading,   setReviewLoading]   = useState(false);
  const [addingToCart,    setAddingToCart]    = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearSelectedProduct());
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAddingToCart(true);
    try { await dispatch(addToCart({ productId: id, quantity: qty })).unwrap(); toast.success('Added to bag'); }
    catch (err) { toast.error(err || 'Failed'); }
    finally { setAddingToCart(false); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await dispatch(toggleWishlist(id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
    setReviewLoading(true);
    try {
      await dispatch(addProductReview({ productId: id, rating: reviewRating, comment: reviewComment })).unwrap();
      toast.success('Review added!');
      setReviewComment('');
      dispatch(fetchProductById(id));
    } catch (err) { toast.error(err || 'Failed'); }
    finally { setReviewLoading(false); }
  };

  if (detailLoading || !product) return <div className="pt-24"><PageLoader /></div>;

  const images = product.images?.length ? product.images : ['/images/placeholder.jpg'];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[0.7rem] text-muted mb-8 flex-wrap">
          {['Home', product.category, product.name].map((crumb, i, arr) => (
            <span key={i} className="flex items-center gap-1.5">
              <button
                onClick={() => i === 0 ? navigate('/') : i === 1 ? navigate(`/shop?category=${product.category}`) : null}
                className={`transition-colors truncate max-w-[180px] ${i < arr.length - 1 ? 'hover:text-gold-500 cursor-pointer' : 'text-cream cursor-default'}`}>
                {crumb}
              </button>
              {i < arr.length - 1 && <ChevronRight size={11} className="flex-shrink-0" />}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative bg-noir-700 border border-white/6 rounded-xl overflow-hidden mb-4 aspect-[4/5]">
              <img src={images[selectedImg]} alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300" />
              {product.isFeatured && (
                <span className="absolute top-4 left-4 bg-gold-500 text-noir-950 text-[0.62rem]
                                 font-bold tracking-widest uppercase px-2.5 py-1 rounded">
                  Featured
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-all
                                ${i === selectedImg ? 'border-gold-500' : 'border-white/8 opacity-60 hover:opacity-90'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow mb-1.5">{product.brand || product.category}</p>
            <h1 className="font-display text-4xl lg:text-5xl text-cream leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-5">
              <RatingStars rating={product.rating} size={17} showCount count={product.numReviews} />
              {product.countInStock > 0
                ? <span className="text-[0.68rem] px-2.5 py-1 rounded border badge-delivered">
                    {product.countInStock} in stock
                  </span>
                : <span className="text-[0.68rem] px-2.5 py-1 rounded border badge-cancelled">Out of Stock</span>
              }
            </div>

            <p className="text-3xl text-gold-500 font-medium mb-5">{formatCurrency(product.price)}</p>

            <p className="text-muted leading-relaxed text-[0.92rem] mb-7">{product.description}</p>

            <div className="border-t border-white/8 pt-6 mb-6">
              {/* Qty */}
              <div className="flex items-center gap-4 mb-5">
                <span className="label-noir w-14">Qty</span>
                <div className="flex items-center border border-white/10 rounded">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 text-muted hover:text-cream transition-colors text-lg leading-none">−</button>
                  <span className="px-4 text-sm text-cream min-w-[2.5rem] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                    className="px-3 py-2 text-muted hover:text-cream transition-colors text-lg leading-none">+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={handleAddToCart}
                  disabled={!product.countInStock || addingToCart}
                  className="btn-gold flex-1 min-w-[180px] py-3.5">
                  {addingToCart ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                  {addingToCart ? 'Adding…' : 'Add to Bag'}
                </button>
                <button onClick={handleWishlist} className={`btn-outline px-4 py-3.5 ${isWishlisted ? 'border-gold-500 text-gold-500' : ''}`}>
                  <Heart size={16} className={isWishlisted ? 'fill-gold-500' : ''} />
                  {isWishlisted ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <div className="flex gap-8">
              {[{ label: 'Category', value: product.category }, { label: 'Brand', value: product.brand || '—' }].map((info) => (
                <div key={info.label}>
                  <span className="label-noir">{info.label}</span>
                  <p className="text-[0.88rem] text-cream">{info.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-20 border-t border-white/8 pt-12">
          <h2 className="font-display text-3xl text-cream mb-10">Reviews ({product.numReviews})</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

            {/* List */}
            <div className="md:col-span-3 space-y-4">
              {product.reviews?.length === 0 ? (
                <p className="text-muted italic">No reviews yet. Be the first to review this product.</p>
              ) : product.reviews?.map((review) => (
                <div key={review._id} className="p-4 bg-noir-700 border border-white/5 rounded">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20
                                    flex items-center justify-center text-gold-500 text-sm font-medium flex-shrink-0">
                      {review.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.85rem] font-medium text-cream">{review.name}</p>
                      <p className="text-[0.7rem] text-muted">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <RatingStars rating={review.rating} size={13} />
                  </div>
                  <p className="text-[0.88rem] text-muted leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>

            {/* Write review */}
            <div className="md:col-span-2">
              <div className="p-6 bg-noir-700 border border-gold-500/12 rounded-xl">
                <h3 className="font-display text-xl text-cream mb-5">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="label-noir">Your Rating</label>
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div>
                    <label className="label-noir">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience…"
                      rows={4}
                      className="input-noir resize-none"
                    />
                  </div>
                  <button type="submit" disabled={reviewLoading || !isAuthenticated} className="btn-gold w-full">
                    {!isAuthenticated ? 'Sign In to Review' : reviewLoading ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
