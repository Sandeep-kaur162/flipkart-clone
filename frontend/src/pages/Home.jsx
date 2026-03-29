import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

const BANNER_IMAGES = [
  'https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/7c7571b8b3e3e6e0.jpg',
  'https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/7c7571b8b3e3e6e0.jpg',
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    fetchProducts();
  }, [search, category, page]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="home">
      {/* Category Bar */}
      <div className="category-bar">
        <div className="category-bar-inner">
          <Link to="/" className={`cat-item ${!category ? 'active' : ''}`}>All</Link>
          {categories.map((c) => (
            <Link key={c.id} to={`/?category=${c.slug}`} className={`cat-item ${category === c.slug ? 'active' : ''}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Banner (only on homepage without filters) */}
      {!search && !category && (
        <div className="banner-wrap">
          <img
            src="https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/7c7571b8b3e3e6e0.jpg"
            alt="Sale Banner"
            className="banner-img"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      <div className="home-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Categories</h3>
          <ul>
            <li><Link to="/" className={!category ? 'active' : ''}>All Products</Link></li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/?category=${c.slug}`} className={category === c.slug ? 'active' : ''}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product Grid */}
        <main className="product-grid-section">
          {search && <h2 className="results-title">Results for "{search}" ({total} items)</h2>}
          {category && !search && <h2 className="results-title">{categories.find(c => c.slug === category)?.name} ({total} items)</h2>}

          {loading ? (
            <div className="loading-grid">
              {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="no-results">
              <img src="https://static-assets-web.flixcart.com/fk-p-flap/images/no-results-found.png" alt="No results" onError={(e) => e.target.style.display='none'} />
              <p>No products found</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                  <span>Page {page} of {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
