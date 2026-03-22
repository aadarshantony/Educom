import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, LayoutDashboard, LogOut, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { label: 'Shop',         path: '/shop' },
  { label: 'New Arrivals', path: '/shop?sort=newest' },
  { label: 'Featured',     path: '/shop?featured=true' },
];

const Logo = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2.5 group">
    <div className="w-6 h-6 relative flex-shrink-0">
      <div className="absolute inset-0 border-[1.5px] border-gold-500 rotate-45 transition-transform group-hover:rotate-[55deg] duration-300" />
      <div className="absolute inset-[4px] bg-gold-500 rotate-45 transition-transform group-hover:rotate-[55deg] duration-300" />
    </div>
    <span className="font-display text-xl tracking-[0.18em] uppercase text-cream">EduCom</span>
  </button>
);

const Navbar = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const cartItems  = useSelector((s) => s.cart.items);
  const wishlist   = useSelector((s) => s.wishlist.items);
  const cartCount  = cartItems.reduce((s, i) => s + (i.quantity || 0), 0);

  const [scrolled,     setScrolled]     = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const fn = () => setUserMenuOpen(false);
    document.addEventListener('click', fn);
    return () => document.removeEventListener('click', fn);
  }, [userMenuOpen]);

  const handleLogout = () => {
    setDrawerOpen(false);
    setUserMenuOpen(false);
    logout();
    toast.success('Signed out');
    navigate('/');
  };

  const BadgeIcon = ({ icon: Icon, count, onClick, label }) => (
    <button onClick={onClick} aria-label={label}
      className="relative p-2 text-muted hover:text-gold-500 transition-colors">
      <Icon size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-gold-500 text-noir-950
                         text-[0.55rem] font-bold rounded-full flex items-center justify-center px-0.5">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-noir-950/92 backdrop-blur-xl border-b border-gold-500/10 shadow-lg shadow-black/30'
          : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-[72px] flex items-center gap-8">

          {/* Logo */}
          <Logo onClick={() => navigate('/')} />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8 flex-1">
            {NAV_LINKS.map((link) => {
              const active = (location.pathname + location.search) === link.path || (link.path === "/shop" && location.pathname === "/shop" && !location.search);
              return (
                <button key={link.label} onClick={() => navigate(link.path)}
                  className={`text-[0.68rem] font-medium tracking-[0.12em] uppercase transition-colors relative
                              ${active ? 'text-gold-500' : 'text-muted hover:text-cream'}`}>
                  {link.label}
                  {active && (
                    <motion.span layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-gold-500" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <BadgeIcon icon={Heart}       count={wishlist.length} onClick={() => navigate('/wishlist')} label="Wishlist" />
            <BadgeIcon icon={ShoppingBag} count={cartCount}       onClick={() => navigate('/cart')}     label="Cart" />

            {isAuthenticated ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center justify-center w-8 h-8 rounded-full
                             bg-gold-500/10 border border-gold-500/25 text-gold-500
                             hover:bg-gold-500/20 transition-colors text-sm font-medium ml-1">
                  {user?.name?.[0]?.toUpperCase()}
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-noir-800 border border-gold-500/15
                                 rounded shadow-2xl shadow-black/60 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/6">
                        <p className="text-sm text-cream font-medium">{user?.name}</p>
                        <p className="text-[0.7rem] text-muted truncate">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <button onClick={() => { setUserMenuOpen(false); navigate('/admin'); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.78rem]
                                     text-gold-500 hover:bg-gold-500/6 transition-colors text-left">
                          <LayoutDashboard size={14} /> Admin Dashboard
                        </button>
                      )}
                      <button onClick={() => { setUserMenuOpen(false); navigate('/orders'); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.78rem]
                                   text-muted hover:text-cream hover:bg-white/4 transition-colors text-left">
                        <Package size={14} /> My Orders
                      </button>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.78rem]
                                   text-red-400 hover:bg-red-500/8 transition-colors text-left">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => navigate('/login')}
                className="p-2 text-muted hover:text-gold-500 transition-colors ml-1">
                <User size={20} />
              </button>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 text-muted hover:text-cream transition-colors ml-1">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-noir-800 border-l border-gold-500/10
                         z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/6">
                <Logo onClick={() => { navigate('/'); setDrawerOpen(false); }} />
                <button onClick={() => setDrawerOpen(false)} className="text-muted hover:text-cream">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-5 space-y-1">
                {NAV_LINKS.map((link) => (
                  <button key={link.label}
                    onClick={() => { navigate(link.path); setDrawerOpen(false); }}
                    className="w-full text-left px-3 py-3 text-[0.72rem] tracking-[0.12em] uppercase
                               text-muted hover:text-cream hover:bg-white/4 rounded transition-colors">
                    {link.label}
                  </button>
                ))}

                <div className="border-t border-white/6 pt-3 mt-3 space-y-1">
                  {isAuthenticated ? (
                    <>
                      <button onClick={() => { navigate('/orders'); setDrawerOpen(false); }}
                        className="w-full text-left px-3 py-3 text-[0.72rem] tracking-[0.1em] uppercase text-muted hover:text-cream hover:bg-white/4 rounded transition-colors">
                        My Orders
                      </button>
                      {isAdmin && (
                        <button onClick={() => { navigate('/admin'); setDrawerOpen(false); }}
                          className="w-full text-left px-3 py-3 text-[0.72rem] tracking-[0.1em] uppercase text-gold-500 hover:bg-gold-500/6 rounded transition-colors">
                          Admin
                        </button>
                      )}
                      <button onClick={handleLogout}
                        className="w-full text-left px-3 py-3 text-[0.72rem] tracking-[0.1em] uppercase text-red-400 hover:bg-red-500/8 rounded transition-colors">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { navigate('/login'); setDrawerOpen(false); }}
                      className="w-full text-left px-3 py-3 text-[0.72rem] tracking-[0.1em] uppercase text-gold-500 hover:bg-gold-500/6 rounded transition-colors">
                      Sign In
                    </button>
                  )}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;