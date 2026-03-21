import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import Navbar   from './components/Navbar/Navbar';
import Footer   from './components/Footer/Footer';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';
import { fetchProfile }  from './redux/slices/authSlice';
import { fetchCart }     from './redux/slices/cartSlice';
import { fetchWishlist } from './redux/slices/wishlistSlice';
import useAuth    from './hooks/useAuth';
import PageLoader from './components/Loader/Loader';

const HomePage          = lazy(() => import('./pages/HomePage'));
const ShopPage          = lazy(() => import('./pages/ShopPage'));
const ProductPage       = lazy(() => import('./pages/ProductPage'));
const CartPage          = lazy(() => import('./pages/CartPage'));
const WishlistPage      = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage'));
const OrdersPage        = lazy(() => import('./pages/OrdersPage'));
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));  // ← NEW

const Transition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Pages that should have no Navbar/Footer
  const isAuthPage    = ['/login', '/register'].includes(location.pathname);
  const isFullscreen  = location.pathname === '/payment-success';   // ← full-screen success page
  const hideChrome    = isAuthPage || isFullscreen;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col min-h-screen bg-noir-950 text-cream font-sans">
      {!hideChrome && <Navbar />}

      <main className="flex-1">
        <Suspense fallback={<div className="pt-24"><PageLoader /></div>}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public */}
              <Route path="/"          element={<Transition><HomePage /></Transition>} />
              <Route path="/shop"      element={<Transition><ShopPage /></Transition>} />
              <Route path="/product/:id" element={<Transition><ProductPage /></Transition>} />
              <Route path="/login"     element={<Transition><LoginPage /></Transition>} />
              <Route path="/register"  element={<Transition><RegisterPage /></Transition>} />

              {/* Payment success — no Navbar/Footer, handles its own full layout */}
              <Route path="/payment-success" element={<Transition><PaymentSuccessPage /></Transition>} />

              {/* Protected */}
              <Route path="/cart"      element={<ProtectedRoute><Transition><CartPage /></Transition></ProtectedRoute>} />
              <Route path="/wishlist"  element={<ProtectedRoute><Transition><WishlistPage /></Transition></ProtectedRoute>} />
              <Route path="/checkout"  element={<ProtectedRoute><Transition><CheckoutPage /></Transition></ProtectedRoute>} />
              <Route path="/orders"    element={<ProtectedRoute><Transition><OrdersPage /></Transition></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin"     element={<AdminRoute><Transition><AdminDashboard /></Transition></AdminRoute>} />

              {/* 404 */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                  <p className="font-display text-[8rem] leading-none text-gold-500/10 mb-2">404</p>
                  <p className="font-display text-2xl text-muted mb-6">Page not found</p>
                  <button onClick={() => window.location.href = '/'} className="btn-gold">
                    Back to Home
                  </button>
                </div>
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1c1c1c',
          color:      '#f0ece4',
          border:     '1px solid rgba(212,168,83,0.2)',
          fontSize:   '0.82rem',
          fontFamily: '"DM Sans", sans-serif',
        },
        success: { iconTheme: { primary: '#d4a853', secondary: '#0a0a0a' } },
        error:   { iconTheme: { primary: '#ef5350', secondary: '#fff'    } },
      }}
    />
  </BrowserRouter>
);

export default App;