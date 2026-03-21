import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import RatingStars from '../components/RatingStars/RatingStars';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { isAuthenticated } = useAuth();
  const { items } = useSelector((s) => s.wishlist);

  useEffect(() => { if (isAuthenticated) dispatch(fetchWishlist()); }, [isAuthenticated]);

  const handleMoveToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      await dispatch(removeFromWishlist(productId));
      toast.success('Moved to bag');
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleRemove = async (productId) => {
    await dispatch(removeFromWishlist(productId));
    toast.success('Removed from wishlist');
  };

  if (!isAuthenticated) return (
    <div className="pt-40 pb-20 text-center">
      <p className="font-display text-3xl text-cream mb-4">Sign in to view your wishlist</p>
      <button onClick={() => navigate('/login')} className="btn-gold">Sign In</button>
    </div>
  );

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">
        <div className="flex items-center gap-2 mb-1">
          <Heart size={16} className="text-gold-500 fill-gold-500" />
          <p className="eyebrow">Saved</p>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-cream mb-10">
          Wishlist{' '}
          {items.length > 0 && <span className="text-xl text-muted font-sans">({items.length})</span>}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <Heart size={72} className="text-muted/30 mx-auto" />
            <p className="font-display text-3xl text-muted">Nothing saved yet</p>
            <p className="text-muted/60">Browse our collection and save items you love</p>
            <button onClick={() => navigate('/shop')} className="btn-gold mt-2">Browse Collection</button>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {items.map((product, i) => {
                const p = product._id ? product : product;
                return (
                  <motion.div key={p._id || i} layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-noir-700 border border-white/5 rounded overflow-hidden
                               hover:border-gold-500/20 hover:-translate-y-1 hover:shadow-2xl
                               hover:shadow-black/50 transition-all duration-300"
                  >
                    <div className="relative h-56 bg-noir-600 cursor-pointer"
                         onClick={() => navigate(`/product/${p._id}`)}>
                      <img src={p.images?.[0] || '/images/placeholder.jpg'} alt={p.name}
                           className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(p._id); }}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 backdrop-blur-sm rounded
                                   text-muted hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="p-4">
                      <p className="eyebrow mb-0.5">{p.brand || p.category}</p>
                      <h3 onClick={() => navigate(`/product/${p._id}`)}
                        className="font-display text-base text-cream mb-2 line-clamp-2
                                   cursor-pointer hover:text-gold-500 transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gold-500 font-medium">{formatCurrency(p.price)}</span>
                        <RatingStars rating={p.rating} size={12} />
                      </div>
                      <button onClick={() => handleMoveToCart(p._id)}
                        disabled={!p.countInStock}
                        className="btn-outline w-full text-[0.68rem] py-2.5 gap-1.5">
                        <ShoppingBag size={12} />
                        {p.countInStock ? 'Move to Bag' : 'Out of Stock'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
