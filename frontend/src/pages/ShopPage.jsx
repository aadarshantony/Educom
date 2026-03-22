import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setFilters, clearFilters } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard/ProductCard';
import { ProductGridSkeleton } from '../components/Loader/Loader';
import SearchBar from '../components/SearchBar/SearchBar';

const CATEGORIES = ['', 'Men', 'Women', 'Accessories', 'Footwear', 'Electronics', 'Home'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated' },
];

const ShopPage = () => {
  const dispatch       = useDispatch();
  const [searchParams] = useSearchParams();
  const { items, loading, total, pages } = useSelector((s) => s.products);
  const filters        = useSelector((s) => s.products.filters);
  const products       = Array.isArray(items) ? items : [];

  const [page,       setPage]       = useState(1);
  const [maxPrice,   setMaxPrice]   = useState(50000);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Store the last seen search string so we can detect when the user
  // navigates between /shop, /shop?sort=newest, /shop?featured=true etc.
  const lastSearch = useRef(null);

  // ── Effect: re-runs whenever URL search params OR user-driven filters change ─
  useEffect(() => {
    const currentSearch = searchParams.toString();

    // If the URL changed (user clicked a navbar link), re-read params and reset filters
    if (lastSearch.current !== currentSearch) {
      lastSearch.current = currentSearch;

      const keyword    = searchParams.get('keyword')   || '';
      const category   = searchParams.get('category')  || '';
      const sort       = searchParams.get('sort')      || 'newest';
      const isFeatured = searchParams.get('featured') === 'true' ? 'true' : '';

      // Reset page and maxPrice when URL params change
      setPage(1);
      setMaxPrice(50000);

      // Sync Redux filters and fetch immediately with URL-derived params
      dispatch(setFilters({ keyword, category, sort, isFeatured }));

      const params = { keyword, category, sort, isFeatured, page: 1, limit: 12 };
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === undefined) delete params[k];
      });
      dispatch(fetchProducts(params));
      return; // don't double-fetch below
    }

    // URL hasn't changed — user adjusted a sidebar filter, page, or price range
    const params = { ...filters, page, limit: 12, maxPrice: maxPrice < 50000 ? maxPrice : '' };
    Object.keys(params).forEach((k) => {
      if (params[k] === '' || params[k] === undefined) delete params[k];
    });
    dispatch(fetchProducts(params));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, filters, page, maxPrice]);

  const set = (key, val) => { dispatch(setFilters({ [key]: val })); setPage(1); };
  const clear = () => { dispatch(clearFilters()); setMaxPrice(50000); setPage(1); };

  const FilterContent = () => (
    <div className="space-y-7">
      <div>
        <p className="eyebrow text-gold-500 mb-3">Category</p>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <button key={cat || 'all'}
              onClick={() => set('category', cat)}
              className={`flex items-center gap-2.5 w-full text-left text-[0.82rem] py-1
                          transition-colors ${filters.category === cat ? 'text-cream' : 'text-muted hover:text-cream'}`}>
              <span className={`w-1.5 h-1.5 rounded-full border flex-shrink-0 transition-all
                                ${filters.category === cat ? 'bg-gold-500 border-gold-500' : 'border-white/20'}`} />
              {cat || 'All Categories'}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/8 pt-6">
        <p className="eyebrow text-gold-500 mb-3">Max Price</p>
        <input type="range" min={0} max={50000} step={500}
          value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-gold-500 cursor-pointer" />
        <div className="flex justify-between mt-2">
          <span className="text-[0.72rem] text-muted">₹0</span>
          <span className="text-[0.72rem] text-gold-500">
            {maxPrice >= 50000 ? 'Any' : `₹${maxPrice.toLocaleString()}`}
          </span>
        </div>
      </div>

      <button onClick={clear} className="btn-outline w-full text-[0.68rem]">Clear Filters</button>
    </div>
  );

  const isFeaturedPage = filters.isFeatured === 'true';

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="eyebrow mb-1">{isFeaturedPage ? 'Hand-picked' : 'Discover'}</p>
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-6">
            {isFeaturedPage ? 'Featured Products' : 'All Products'}
          </h1>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[220px] max-w-sm">
              <SearchBar placeholder="Search products…" onSearch={(q) => set('keyword', q)} />
            </div>
            <div className="relative">
              <select value={filters.sort} onChange={(e) => set('sort', e.target.value)}
                className="appearance-none bg-noir-700 border border-white/8 rounded px-4 py-2.5
                           text-cream text-[0.8rem] pr-8 focus:outline-none focus:border-gold-500/40 cursor-pointer">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
            <button onClick={() => setDrawerOpen(true)}
              className="md:hidden btn-ghost border border-white/8 gap-1.5">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>

          {/* Active filter chips */}
          {(filters.keyword || filters.category || isFeaturedPage) && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {filters.keyword && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/25 text-gold-500 text-[0.72rem] rounded-full">
                  "{filters.keyword}" <button onClick={() => set('keyword', '')}><X size={10} /></button>
                </span>
              )}
              {filters.category && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/25 text-gold-500 text-[0.72rem] rounded-full">
                  {filters.category} <button onClick={() => set('category', '')}><X size={10} /></button>
                </span>
              )}
              {isFeaturedPage && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/25 text-gold-500 text-[0.72rem] rounded-full">
                  Featured only <button onClick={() => set('isFeatured', '')}><X size={10} /></button>
                </span>
              )}
            </div>
          )}
        </motion.div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-52 flex-shrink-0">
            <div className="sticky top-24"><FilterContent /></div>
          </aside>

          <div className="flex-1 min-w-0">
            <p className="text-[0.72rem] text-muted mb-5">
              {total} product{total !== 1 ? 's' : ''} found
            </p>

            {loading ? <ProductGridSkeleton count={12} /> : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-3xl text-muted mb-4">No products found</p>
                <button onClick={clear} className="btn-outline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product, i) => (
                  <motion.div key={product._id}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map((pg) => (
                  <button key={pg}
                    onClick={() => { setPage(pg); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                    className={`w-9 h-9 text-sm rounded border transition-all
                                ${page === pg
                                  ? 'bg-gold-500/15 border-gold-500 text-gold-500'
                                  : 'border-white/10 text-muted hover:border-gold-500/30 hover:text-cream'}`}>
                    {pg}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-noir-800 border-r border-white/6
                          z-50 p-6 overflow-y-auto md:hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl text-cream">Filters</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-muted hover:text-cream">
                <X size={20} />
              </button>
            </div>
            <FilterContent />
          </div>
        </>
      )}
    </div>
  );
};

export default ShopPage;