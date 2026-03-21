import { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { loginUser, clearAuthError } from '../redux/slices/authSlice';
import { fetchCart } from '../redux/slices/cartSlice';
import { fetchWishlist } from '../redux/slices/wishlistSlice';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Logo = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 mx-auto mb-8">
    <div className="w-6 h-6 relative">
      <div className="absolute inset-0 border-[1.5px] border-gold-500 rotate-45" />
      <div className="absolute inset-[4px] bg-gold-500 rotate-45" />
    </div>
    <span className="font-display text-xl tracking-[0.18em] uppercase text-cream">Noir</span>
  </button>
);

const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const { isAuthenticated, loading, error } = useAuth();
  const from = location.state?.from?.pathname || '/';
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
    return () => dispatch(clearAuthError());
  }, [isAuthenticated]);

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      toast.success('Welcome back!');
    } catch (err) { toast.error(err || 'Login failed'); }
  };

  return (
    <div className="min-h-screen bg-noir-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 w-80 h-80 rounded-full
                      bg-gold-500/4 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-sm">

        <div className="text-center">
          <Logo onClick={() => navigate('/')} />
          <h1 className="font-display text-3xl text-cream mb-2">Welcome back</h1>
          <p className="text-muted text-sm mb-8">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-noir">Email</label>
            <input type="email" {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              className="input-noir" placeholder="you@example.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label-noir">Password</label>
            <input type="password" {...register('password', { required: 'Required' })}
              className="input-noir" placeholder="••••••••" />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="p-3 bg-red-500/8 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 mt-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/6" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-noir-950 text-muted text-[0.7rem]">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
