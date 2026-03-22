import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard/ProductCard';
import { ProductGridSkeleton } from '../components/Loader/Loader';
import SearchBar from '../components/SearchBar/SearchBar';
import axiosInstance from '../api/axiosInstance';

const CATEGORIES = ['Men', 'Women', 'Accessories', 'Footwear', 'Electronics', 'Home'];

const VALUE_PROPS = [
  { icon: '◈', title: 'Premium Quality',  desc: 'Every product curated for excellence' },
  { icon: '◉', title: 'Free Shipping',     desc: 'On all orders above ₹500' },
  { icon: '◎', title: 'Secure Payment',    desc: 'Stripe-powered checkout' },
  { icon: '◍', title: 'Easy Returns',      desc: '30-day hassle-free returns' },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' },
  }),
};


const SLIDES = [
  {
    url:   'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop',
    label: 'Accessories',
  },
  {
    url:   'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=900&auto=format&fit=crop',
    label: 'Women',
  },
  {
    url:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop',
    label: 'Men',
  },
  {
    url:   'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&auto=format&fit=crop',
    label: 'Footwear',
  },
  {
    url:   'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop',
    label: 'Electronics',
  },
  {
    url:   'https://images.unsplash.com/photo-1602178506248-74fbe91c4fce?w=900&auto=format&fit=crop',
    label: 'Home',
  },
];

const HERO_IMAGES = [
  {
    src:   'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop',
    label: 'Women\'s Collection',
  },
  {
    src:   'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&auto=format&fit=crop',
    label: 'Footwear',
  },
  {
    src:   'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop',
    label: 'Accessories',
  },
  {
    src:   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop',
    label: 'Electronics',
  },
  {
    src:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop',
    label: 'Men\'s Collection',
  },
];

const HeroSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);
  const timerRef = useRef(null);

  const goTo = (idx) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 400); // fade-out duration
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % HERO_IMAGES.length;
        setFading(true);
        setTimeout(() => setFading(false), 400);
        return next;
      });
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="absolute top-0 right-0 w-[82%] h-[88%] rounded-xl overflow-hidden border border-gold-500/20">
      {/* Images — only current is visible, others are hidden */}
      {HERO_IMAGES.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.label}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500
                      ${i === current ? (fading ? 'opacity-0' : 'opacity-100') : 'opacity-0'}`}
        />
      ))}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-noir-950/70 via-transparent to-transparent" />

      {/* Label */}
      <div className="absolute bottom-5 left-9 right-5 flex items-center justify-between">
        <span
          className={`text-[0.65rem] tracking-[0.18em] uppercase font-medium text-cream/90
                      transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}
        >
          {HERO_IMAGES[current].label}
        </span>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300
                          ${i === current
                            ? 'w-5 h-1.5 bg-gold-500'
                            : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  // ── Local state — completely independent of the shop page Redux state ──────
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/products?limit=4&sort=newest');
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        console.error('Failed to load new arrivals:', err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden
                          bg-gradient-to-br from-noir-950 via-noir-800 to-noir-950">
        <div className="pointer-events-none absolute top-1/4 right-[8%] w-96 h-96 rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute bottom-[10%] left-[4%] w-72 h-72
                        border border-gold-500/6 rotate-45" />
        <div className="pointer-events-none absolute left-[3%] top-1/3 w-px h-48 bg-gold-500/15" />

        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-12 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0}
                className="eyebrow flex items-center gap-3 mb-5">
                <span className="gold-line" /> New Collection 2026
              </motion.p>
              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                className="font-display font-light leading-[0.92] mb-6
                           text-[clamp(3rem,8vw,7rem)] text-cream">
                Wear the
                <span className="block italic"
                  style={{ color: 'transparent', WebkitTextStroke: '1px rgba(212,168,83,0.55)' }}>
                  Extraordinary
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                className="text-muted text-base leading-relaxed max-w-md mb-8">
                Discover curated luxury pieces crafted for those who appreciate the finer things.
                Timeless elegance, delivered.
              </motion.p>
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
                className="flex flex-wrap gap-3 mb-10">
                <button onClick={() => navigate('/shop')} className="btn-gold">
                  Shop Now <ArrowRight size={14} />
                </button>
                <button onClick={() => navigate('/shop?featured=true')} className="btn-outline">
                  View Featured
                </button>
              </motion.div>
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
                className="max-w-[440px]">
                <SearchBar placeholder="Search for products, brands…" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="hidden md:block relative h-[520px]"
            >
              {/* ── Auto-fading image slideshow ── */}
              <HeroSlideshow />
              {[
                { pos: 'top-[8%] left-[-6%]',  label: 'Products',      value: '500+' },
                { pos: 'bottom-[4%] left-[2%]', label: 'Happy Clients', value: '12k+' },
              ].map((card) => (
                <div key={card.label}
                  className={`absolute ${card.pos} bg-noir-800 border border-gold-500/20 rounded-xl p-4`}>
                  <p className="font-display text-3xl text-gold-500 leading-none">{card.value}</p>
                  <p className="eyebrow mt-1">{card.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────── */}
      <section className="bg-noir-900 py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="eyebrow mb-1">Browse by</p>
            <h2 className="font-display text-3xl md:text-4xl text-cream mb-8">Categories</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.button key={cat}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                onClick={() => navigate(`/shop?category=${cat}`)}
                className="p-4 bg-noir-700 border border-white/5 rounded text-center
                           hover:bg-gold-500/6 hover:border-gold-500/25 hover:-translate-y-1
                           transition-all duration-300">
                <span className="font-display text-lg text-cream">{cat}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12">
          <div className="flex items-end justify-between mb-10">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="eyebrow mb-1">Just dropped</p>
              <h2 className="font-display text-3xl md:text-4xl text-cream">New Arrivals</h2>
            </motion.div>
            <button onClick={() => navigate('/shop')}
              className="hidden sm:flex items-center gap-1.5 text-gold-500 text-[0.72rem]
                         tracking-widest uppercase hover:gap-2.5 transition-all">
              View All <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-2xl text-muted mb-2">No products yet</p>
              <p className="text-muted/60 text-sm">Check back soon for new arrivals</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {products.map((product, i) => (
                <motion.div key={product._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <button onClick={() => navigate('/shop')} className="btn-outline px-12">
              Explore All Products
            </button>
          </div>
        </div>
      </section>

      {/* ── Value props ───────────────────────────────────────────────── */}
      <section className="bg-noir-900 border-y border-gold-500/8 py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {VALUE_PROPS.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4">
                <span className="text-3xl text-gold-500 leading-none block mb-3">{item.icon}</span>
                <p className="font-display text-base text-cream mb-1">{item.title}</p>
                <p className="text-[0.78rem] text-muted">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;