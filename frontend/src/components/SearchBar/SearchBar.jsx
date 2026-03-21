import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setFilters, fetchProducts } from '../../redux/slices/productSlice';
import { useNavigate } from 'react-router-dom';

function useDebounce(value, delay) {
  const [deb, setDeb] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDeb(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return deb;
}

const SearchBar = ({ onSearch, placeholder = 'Search products…', autoFocus = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const debounced = useDebounce(query, 400);

  useEffect(() => {
    if (debounced !== undefined) {
      if (onSearch) onSearch(debounced);
      else { dispatch(setFilters({ keyword: debounced })); dispatch(fetchProducts({ keyword: debounced })); }
    }
  }, [debounced]);

  const handleSubmit = (e) => { e.preventDefault(); navigate(`/shop?keyword=${encodeURIComponent(query)}`); };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 px-3.5 py-2.5 rounded border transition-all duration-200 ${focused ? 'bg-gold-500/5 border-gold-500/40' : 'bg-white/[0.03] border-white/8'}`}>
      <Search size={15} className={`flex-shrink-0 transition-colors ${focused ? 'text-gold-500' : 'text-muted/60'}`} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-sm text-cream placeholder:text-muted/50 focus:outline-none"
      />
      {query && (
        <button type="button" onClick={() => { setQuery(''); onSearch?.(''); }} className="text-muted/50 hover:text-muted transition-colors">
          <X size={12} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
