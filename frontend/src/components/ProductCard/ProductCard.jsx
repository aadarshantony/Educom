import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import RatingStars from '../RatingStars/RatingStars';
import { formatCurrency } from '../../utils/formatCurrency';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { isAuthenticated } = useAuth();
  const [imgLoaded, setImgLoaded] = useState(false);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const isWishlisted  = wishlistItems.some((i) => (i._id || i) === product._id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      toast.success('Added to bag');
    } catch (err) { toast.error(err || 'Failed to add'); }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await dispatch(toggleWishlist(product._id)).unwrap();
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch (err) { toast.error(err || 'Failed'); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => navigate(`/product/${product._id}`)}
      className="group bg-noir-700 border border-white/5 rounded overflow-hidden cursor-pointer
                 hover:border-gold-500/25 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-noir-600 h-64">
        {!imgLoaded && <div className="absolute inset-0 bg-white/[0.02] animate-pulse" />}

        <img
          src={product.images?.[0] || '/images/placeholder.jpg'}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500
                      group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {product.isFeatured && (
          <span className="absolute top-3 left-3 bg-gold-500 text-noir-950 text-[0.6rem]
                           font-semibold tracking-widest uppercase px-2 py-0.5 rounded">
            Featured
          </span>
        )}

        {product.countInStock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-cream text-[0.65rem] tracking-[0.18em] uppercase font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover action bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3
                        bg-gradient-to-t from-black/90 to-transparent
                        opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                        transition-all duration-300 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.countInStock}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gold-500 hover:bg-gold-400
                       text-noir-950 text-[0.65rem] font-semibold tracking-widest uppercase
                       py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={12} />
            Add to Bag
          </button>
          <button
            onClick={handleWishlist}
            className={`p-2 rounded transition-colors
                        ${isWishlisted
                          ? 'bg-gold-500/20 text-gold-500'
                          : 'bg-white/10 text-cream hover:bg-white/20'}`}
          >
            <Heart size={14} className={isWishlisted ? 'fill-gold-500' : ''} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="eyebrow mb-1">{product.brand || product.category}</p>
        <h3 className="font-display text-base text-cream leading-snug mb-2
                       line-clamp-2 group-hover:text-gold-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-gold-500 font-medium">{formatCurrency(product.price)}</span>
          <RatingStars rating={product.rating} size={13} showCount count={product.numReviews} />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
