import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart } from '../../redux/slices/cartSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const product  = item.product;

  const handleQty = async (qty) => {
    if (qty < 1) return;
    try { await dispatch(updateCartItem({ productId: product._id, quantity: qty })).unwrap(); }
    catch (err) { toast.error(err || 'Update failed'); }
  };

  const handleRemove = async () => {
    try { await dispatch(removeFromCart(product._id)).unwrap(); toast.success('Item removed'); }
    catch (err) { toast.error(err || 'Remove failed'); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-4 p-4 bg-noir-700 border border-white/5 rounded
                 hover:border-gold-500/15 transition-colors"
    >
      {/* Thumbnail */}
      <img
        src={product?.images?.[0] || '/images/placeholder.jpg'}
        alt={product?.name}
        className="w-20 h-20 object-cover rounded bg-noir-600 flex-shrink-0"
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="eyebrow mb-0.5">{product?.brand || product?.category}</p>
        <h4 className="font-display text-base text-cream truncate">{product?.name}</h4>
        <p className="text-gold-500 font-medium text-sm mt-0.5">{formatCurrency(item.price)}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center border border-white/10 rounded">
        <button onClick={() => handleQty(item.quantity - 1)}
          className="p-1.5 text-muted hover:text-cream transition-colors">
          <Minus size={12} />
        </button>
        <span className="px-3 text-sm text-cream min-w-[2rem] text-center">{item.quantity}</span>
        <button onClick={() => handleQty(item.quantity + 1)}
          className="p-1.5 text-muted hover:text-cream transition-colors">
          <Plus size={12} />
        </button>
      </div>

      {/* Subtotal */}
      <span className="text-sm font-medium text-cream min-w-[5rem] text-right hidden sm:block">
        {formatCurrency(item.price * item.quantity)}
      </span>

      {/* Remove */}
      <button onClick={handleRemove}
        className="text-muted/50 hover:text-red-400 transition-colors flex-shrink-0 p-1">
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
};

export default CartItem;
