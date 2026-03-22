import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { registerUser, clearAuthError } from '../redux/slices/authSlice';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Logo = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 mx-auto mb-8">
    <div className="w-6 h-6 relative">
      <div className="absolute inset-0 border-[1.5px] border-gold-500 rotate-45" />
      <div className="absolute inset-[4px] bg-gold-500 rotate-45" />
    </div>
    <span className="font-display text-xl tracking-[0.18em] uppercase text-cream">EduCom</span>
  </button>
);

const RegisterPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { isAuthenticated, loading, error } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => dispatch(clearAuthError());
  }, [isAuthenticated]);

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser({ name: data.name, email: data.email, password: data.password })).unwrap();
      toast.success('Account created!');
    } catch (err) { toast.error(err || 'Registration failed'); }
  };

  return (
    <div className="min-h-screen bg-noir-950 flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="pointer-events-none absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-gold-500/3 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-sm">

        <div className="text-center">
          <Logo onClick={() => navigate('/')} />
          <h1 className="font-display text-3xl text-cream mb-2">Create account</h1>
          <p className="text-muted text-sm mb-8">Join the EduCom community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name',            label: 'Full Name',        type: 'text',     placeholder: 'John Doe',         rules: { required: 'Required', minLength: { value: 2, message: 'Min 2 characters' } } },
            { name: 'email',           label: 'Email',            type: 'email',    placeholder: 'you@example.com',  rules: { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } } },
            { name: 'password',        label: 'Password',         type: 'password', placeholder: '••••••••',         rules: { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' }, pattern: { value: /\d/, message: 'Must contain a number' } } },
            { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••',         rules: { required: 'Required', validate: (v) => v === password || 'Passwords do not match' } },
          ].map((f) => (
            <div key={f.name}>
              <label className="label-noir">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                {...register(f.name, f.rules)} className="input-noir" />
              {errors[f.name] && <p className="text-red-400 text-xs mt-1">{errors[f.name].message}</p>}
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-500/8 border border-red-500/20 rounded text-red-400 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 mt-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Account'}
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
          Already have an account?{' '}
          <Link to="/login" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
