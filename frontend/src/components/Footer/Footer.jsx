import { useNavigate } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 relative flex-shrink-0">
      <div className="absolute inset-0 border-[1.5px] border-gold-500 rotate-45" />
      <div className="absolute inset-[3.5px] bg-gold-500 rotate-45" />
    </div>
    <span className="font-display text-base tracking-[0.18em] uppercase text-cream">EduCom</span>
  </div>
);

const COLS = [
  { title: 'Shop',    links: [{ label: 'All Products', path: '/shop' }, { label: 'New Arrivals', path: '/shop?sort=newest' }, { label: 'Featured', path: '/shop?featured=true' }] },
  { title: 'Account', links: [{ label: 'Sign In', path: '/login' }, { label: 'Register', path: '/register' }, { label: 'My Orders', path: '/orders' }, { label: 'Wishlist', path: '/wishlist' }] },
  { title: 'Support', links: [{ label: 'FAQ', path: '/' }, { label: 'Shipping Policy', path: '/' }, { label: 'Returns', path: '/' }, { label: 'Contact', path: '/' }] },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-noir-900 border-t border-gold-500/10 pt-14 pb-8 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="text-muted text-[0.83rem] leading-relaxed mt-4 mb-5 max-w-[260px]">
              Curated luxury for the discerning individual. Premium products, delivered with elegance.
            </p>
            <div className="flex gap-2">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <button key={i}
                  className="p-2 text-muted border border-white/8 rounded hover:text-gold-500
                             hover:border-gold-500/30 transition-all duration-200">
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-gold-500 mb-4">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button onClick={() => navigate(link.path)}
                      className="text-[0.82rem] text-muted hover:text-cream transition-colors">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[0.7rem] text-muted/60 tracking-wide">
            © {new Date().getFullYear()} EduCom. All rights reserved.
          </p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((t) => (
              <button key={t} className="text-[0.7rem] text-muted/50 hover:text-muted transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
