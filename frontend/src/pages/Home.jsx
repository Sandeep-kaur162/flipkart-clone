import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiTrendingUp, FiZap, FiGrid } from 'react-icons/fi';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import './Home.css';
const BANNERS = [
  { bg: 'linear-gradient(135deg,#6c3fc5 0%,#00c9a7 100%)', title: 'Mega Electronics Sale', sub: 'Up to 60% off on top brands', cta: 'Shop Electronics', cat: 'electronics', emoji: '⚡' },
  { bg: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)', title: 'Fashion Week Deals', sub: 'Trending styles at unbeatable prices', cta: 'Explore Fashion', cat: 'fashion', emoji: '👗' },
  { bg: 'linear-gradient(135deg,#0ea5e9 0%,#6c3fc5 100%)', title: 'Mobile Mania', sub: 'Latest smartphones, best prices', cta: 'Browse Mobiles', cat: 'mobiles', emoji: '📱' },
  { bg: 'linear-gradient(135deg,#16a34a 0%,#0ea5e9 100%)', title: 'Home & Living', sub: 'Transform your space today', cta: 'Shop Now', cat: 'home-furniture', emoji: '🏠' },
];

const CAT_ICONS = { electronics:'⚡', mobiles:'📱', fashion:'👗', 'home-furniture':'🏠', appliances:'🔌', books:'📚', toys:'🧸', sports:'⚽' };

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerAnim, setBannerAnim] = useState(true);
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [appliedPrice, setAppliedPrice] = useState({ min: '', max: '' });
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const timerRef = useRef(null);
  const catBarRef = useRef(null);

  const scrollCats = (dir) => {
    if (catBarRef.current) catBarRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  // Auto-slide banner
  useEffect(() => {
    if (search || category) return;
    timerRef.current = setInterval(() => {
      setBannerAnim(false);
      setTimeout(() => { setBannerIdx(i => (i + 1) % BANNERS.length); setBannerAnim(true); }, 100);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [search, category]);

  useEffect(() => { setPage(1); }, [search, category]);
  useEffect(() => { fetchProducts(); }, [search, category, page, sort, appliedPrice]);
  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data)); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, sort });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (appliedPrice.min) params.set('min_price', appliedPrice.min);
      if (appliedPrice.max) params.set('max_price', appliedPrice.max);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const applyPriceFilter = () => { setPage(1); setAppliedPrice({ ...priceRange }); };
  const clearPriceFilter = () => { setPriceRange({ min: '', max: '' }); setAppliedPrice({ min: '', max: '' }); };

  const goBanner = (dir) => {
    clearInterval(timerRef.current);
    setBannerAnim(false);
    setTimeout(() => {
      setBannerIdx(i => (i + dir + BANNERS.length) % BANNERS.length);
      setBannerAnim(true);
    }, 100);
  };

  const totalPages = Math.ceil(total / 20);
  const banner = BANNERS[bannerIdx];

  return (
    <div className="home">
      {/* Category pill bar */}
      <div className="category-bar">
        <button type="button" className="cat-scroll-btn left" onClick={() => scrollCats(-1)}><FiChevronLeft size={14}/></button>
        <div className="category-bar-inner" ref={catBarRef}>
          <Link to="/" className={`cat-pill ${!category ? 'active' : ''}`}>
            <span className="cat-pill-icon"><FiGrid size={13}/></span> All
          </Link>
          {categories.map(c => (
            <Link key={c.id} to={`/?category=${c.slug}`} className={`cat-pill ${category === c.slug ? 'active' : ''}`}>
              <span className="cat-pill-icon">{CAT_ICONS[c.slug] || '🛍️'}</span> {c.name}
            </Link>
          ))}
        </div>
        <button type="button" className="cat-scroll-btn right" onClick={() => scrollCats(1)}><FiChevronRight size={14}/></button>
      </div>

      {/* Hero Banner */}
      {!search && !category && (
        <div className="hero-wrap">
          <div className={`hero-banner ${bannerAnim ? 'anim-in' : 'anim-out'}`} style={{ background: banner.bg }}>
            <div className="hero-content">
              <span className="hero-emoji">{banner.emoji}</span>
              <h1 className="hero-title">{banner.title}</h1>
              <p className="hero-sub">{banner.sub}</p>
              <Link to={`/?category=${banner.cat}`} className="hero-cta">{banner.cta} →</Link>
            </div>
            <div className="hero-decoration">
              <div className="hero-circle c1" />
              <div className="hero-circle c2" />
              <div className="hero-circle c3" />
            </div>
          </div>
          <button className="banner-nav prev" onClick={() => goBanner(-1)}><FiChevronLeft size={20}/></button>
          <button className="banner-nav next" onClick={() => goBanner(1)}><FiChevronRight size={20}/></button>
          <div className="banner-dots">
            {BANNERS.map((_, i) => <span key={i} className={`dot ${i === bannerIdx ? 'active' : ''}`} onClick={() => { clearInterval(timerRef.current); setBannerIdx(i); }} />)}
          </div>
        </div>
      )}

      {/* Category cards (homepage only) */}
      {!search && !category && (
        <div className="cat-cards-wrap">
          <div className="cat-cards">
            {categories.map(c => (
              <Link key={c.id} to={`/?category=${c.slug}`} className="cat-card">
                <span className="cat-card-icon">{CAT_ICONS[c.slug] || '🛍️'}</span>
                <span className="cat-card-name">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="home-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <FiGrid size={14} /> Categories
          </div>
          <ul>
            <li><Link to="/" className={!category ? 'active' : ''}><span>🛍️</span> All Products</Link></li>
            {categories.map(c => (
              <li key={c.id}>
                <Link to={`/?category=${c.slug}`} className={category === c.slug ? 'active' : ''}>
                  <span>{CAT_ICONS[c.slug] || '🛍️'}</span> {c.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Sort */}
          <div className="sidebar-header" style={{ marginTop: 20 }}>
            <FiTrendingUp size={14} /> Sort By
          </div>
          <ul className="sort-list">
            {[['newest','Newest First'],['price_asc','Price: Low to High'],['price_desc','Price: High to Low'],['rating','Top Rated'],['discount','Best Discount']].map(([val, label]) => (
              <li key={val}>
                <button className={`sort-btn ${sort === val ? 'active' : ''}`} onClick={() => { setSort(val); setPage(1); }}>
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Price Filter */}
          <div className="sidebar-header" style={{ marginTop: 20 }}>
            <FiZap size={14} /> Price Range
          </div>
          <div className="price-filter">
            <input type="number" placeholder="Min ₹" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))} />
            <input type="number" placeholder="Max ₹" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))} />
            <button className="price-apply-btn" onClick={applyPriceFilter}>Apply</button>
            {(appliedPrice.min || appliedPrice.max) && (
              <button className="price-clear-btn" onClick={clearPriceFilter}>Clear</button>
            )}
          </div>
        </aside>

        {/* Products */}
        <main className="product-grid-section">
          {(search || category) && (
            <div className="results-bar">
              {search
                ? <><FiTrendingUp size={16}/> Results for "<strong>{search}</strong>" <span className="results-count">{total} items</span></>
                : <><FiZap size={16}/> <strong>{categories.find(c=>c.slug===category)?.name}</strong> <span className="results-count">{total} items</span></>
              }
            </div>
          )}

          {!search && !category && (
            <div className="section-heading">
              <FiZap size={16} color="#6c3fc5"/> All Products <span className="results-count">{total} items</span>
            </div>
          )}

          {loading ? (
            <div className="loading-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-line w70" />
                  <div className="skeleton-line w50" />
                  <div className="skeleton-line w40" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="no-results">
              <div className="no-results-emoji">🔍</div>
              <h3>No products found</h3>
              <p>Try a different search or browse categories</p>
              <Link to="/" className="no-results-btn">Browse All</Link>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <FiChevronLeft size={16}/> Prev
                  </button>
                  <div className="page-numbers">
                    {Array.from({length: totalPages}, (_, i) => i + 1).map(n => (
                      <button key={n} className={n === page ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
                    ))}
                  </div>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    Next <FiChevronRight size={16}/>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
