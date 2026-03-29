import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaHeart } from 'react-icons/fa';
import { FiHeart, FiShoppingCart, FiZap, FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';
import './ProductDetail.css';

const PLACEHOLDER = 'https://via.placeholder.com/400x400?text=No+Image';

// ── Star Rating Input ─────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-input">
      {[1,2,3,4,5].map(n => (
        <FaStar
          key={n}
          size={24}
          color={(hovered || value) >= n ? '#ff9f00' : '#ddd'}
          style={{ cursor: 'pointer', transition: 'color 0.1s' }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        />
      ))}
    </div>
  );
}

// ── Rating Bar ────────────────────────────────────────────────────────────
function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rating-bar-row">
      <span className="rating-bar-label">{label} <FaStar size={10} color="#ff9f00" /></span>
      <div className="rating-bar-track"><div className="rating-bar-fill" style={{ width: `${pct}%` }} /></div>
      <span className="rating-bar-count">{count}</span>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomedImg, setZoomedImg] = useState(null); // lightbox
  const [related, setRelated] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', body: '', user_name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null); // review object being edited

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setRelated([]);
    setReviews([]);
    setReviewStats(null);
    setZoomedImg(null);
    setActiveImg(0);
    setEditingReview(null);
    setShowReviewForm(false);

    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/reviews/${id}`),
      api.get(`/products/${id}/related`),
    ])
      .then(([{ data: prod }, { data: rev }, { data: rel }]) => {
        setProduct(prod);
        setActiveImg(0);
        setReviews(rev.reviews);
        setReviewStats(rev.stats);
        setRelated(rel);

        // Track recently viewed in localStorage
        const key = 'sz_recently_viewed';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = existing.filter(p => p.id !== prod.id);
        const updated = [{ id: prod.id, name: prod.name, price: prod.price, original_price: prod.original_price, discount_percent: prod.discount_percent, images: prod.images, rating: prod.rating, rating_count: prod.rating_count, brand: prod.brand }, ...filtered].slice(0, 6);
        localStorage.setItem(key, JSON.stringify(updated));
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));

    // Load recently viewed (excluding current)
    const key = 'sz_recently_viewed';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    setRecentlyViewed(existing.filter(p => p.id !== parseInt(id)));
  }, [id]);

  const fetchReviews = async () => {
    const { data } = await api.get(`/reviews/${id}`);
    setReviews(data.reviews);
    setReviewStats(data.stats);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewForm({ rating: 0, title: '', body: '', user_name: '' });
      await fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview({ ...review });
    setShowReviewForm(false);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editingReview.rating) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await api.put(`/reviews/${editingReview.id}`, {
        rating: editingReview.rating,
        title: editingReview.title,
        body: editingReview.body,
      });
      toast.success('Review updated!');
      setEditingReview(null);
      await fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      await fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete review');
    }
  };

  if (loading) return <div className="pd-loading">Loading...</div>;
  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const images = product.images?.length ? product.images : [PLACEHOLDER];
  const specs = product.specifications || {};

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* Left: Images */}
        <div className="pd-images">
          <div className="pd-image-viewer">
            <div className="pd-thumbnails">
              {images.map((img, i) => (
                <img key={i} src={img} alt={`${product.name} ${i + 1}`}
                  className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  onError={(e) => { e.target.src = PLACEHOLDER; }} />
              ))}
            </div>
            <div className="pd-main-image" onClick={() => setZoomedImg(images[activeImg])}>
              <img src={images[activeImg]} alt={product.name} onError={(e) => { e.target.src = PLACEHOLDER; }} />
              <span className="zoom-hint">🔍 Click to zoom</span>
            </div>
          </div>
          <div className="pd-action-buttons">
            <button className="btn-cart" onClick={() => addToCart(product.id)}>
              <FiShoppingCart /> Add to Cart
            </button>
            <button className="btn-buy" onClick={async () => { await addToCart(product.id); navigate('/cart'); }}>
              <FiZap /> Buy Now
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="pd-info">
          <p className="pd-brand">{product.brand}</p>
          <h1 className="pd-name">{product.name}</h1>

          {product.rating > 0 && (
            <div className="pd-rating">
              <span className="rating-badge">{product.rating} <FaStar size={12} /></span>
              <span className="rating-count">{(product.rating_count || 0).toLocaleString()} ratings</span>
            </div>
          )}

          <div className="pd-price-section">
            <span className="pd-price">₹{Number(product.price).toLocaleString()}</span>
            {product.original_price && (
              <>
                <span className="pd-original">₹{Number(product.original_price).toLocaleString()}</span>
                <span className="pd-discount">{product.discount_percent}% off</span>
              </>
            )}
          </div>

          <div className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>

          {product.description && (
            <div className="pd-description"><h3>Description</h3><p>{product.description}</p></div>
          )}

          {Object.keys(specs).length > 0 && (
            <div className="pd-specs">
              <h3>Specifications</h3>
              <table><tbody>
                {Object.entries(specs).map(([key, val]) => (
                  <tr key={key}><td className="spec-key">{key}</td><td className="spec-val">{val}</td></tr>
                ))}
              </tbody></table>
            </div>
          )}

          <button
            className={`wishlist-toggle ${inWishlist ? 'active' : ''}`}
            onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
          >
            {inWishlist ? <FaHeart color="#ff6161" /> : <FiHeart />}
            {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
          </button>
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <div className="pd-reviews-section">
        <div className="pd-reviews-inner">
          <div className="reviews-header">
            <h2>Ratings & Reviews</h2>
            <button className="write-review-btn" onClick={() => setShowReviewForm(v => !v)}>
              <FiStar /> Write a Review
            </button>
          </div>

          {reviewStats && reviewStats.total > 0 && (
            <div className="reviews-summary">
              <div className="reviews-avg">
                <span className="avg-number">{reviewStats.avg_rating || 0}</span>
                <div className="avg-stars">
                  {[1,2,3,4,5].map(n => <FaStar key={n} size={16} color={n <= Math.round(reviewStats.avg_rating) ? '#ff9f00' : '#ddd'} />)}
                </div>
                <span className="avg-total">{reviewStats.total} reviews</span>
              </div>
              <div className="reviews-bars">
                {[5,4,3,2,1].map(n => (
                  <RatingBar key={n} label={n} count={reviewStats[`r${n}`] || 0} total={reviewStats.total} />
                ))}
              </div>
            </div>
          )}

          {showReviewForm && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h3>Your Review</h3>
              <div className="form-group">
                <label>Your Name</label>
                <input value={reviewForm.user_name} onChange={e => setReviewForm(f => ({ ...f, user_name: e.target.value }))} placeholder="Enter your name" />
              </div>
              <div className="form-group">
                <label>Rating *</label>
                <StarInput value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} placeholder="Summarize your review" />
              </div>
              <div className="form-group">
                <label>Review</label>
                <textarea value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))} placeholder="Share your experience..." rows={4} />
              </div>
              <div className="review-form-actions">
                <button type="button" className="cancel-review-btn" onClick={() => setShowReviewForm(false)}>Cancel</button>
                <button type="submit" className="submit-review-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : reviews.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-top">
                  <div className="reviewer-avatar">{(r.user_name || 'A')[0].toUpperCase()}</div>
                  <div>
                    <p className="reviewer-name">{r.user_name}</p>
                    <div className="review-stars">
                      {[1,2,3,4,5].map(n => <FaStar key={n} size={12} color={n <= r.rating ? '#ff9f00' : '#ddd'} />)}
                    </div>
                  </div>
                  <span className="review-date">{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>

                  {/* Edit / Delete — only for own reviews */}
                  {user && r.user_id === user.id && (
                    <div className="review-actions">
                      <button type="button" className="review-action-btn edit" onClick={() => handleEditReview(r)} title="Edit">
                        <FiEdit2 size={13} />
                      </button>
                      <button type="button" className="review-action-btn delete" onClick={() => handleDeleteReview(r.id)} title="Delete">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline edit form */}
                {editingReview?.id === r.id ? (
                  <form className="review-edit-form" onSubmit={handleUpdateReview}>
                    <div className="form-group">
                      <label>Rating *</label>
                      <StarInput value={editingReview.rating} onChange={v => setEditingReview(f => ({ ...f, rating: v }))} />
                    </div>
                    <div className="form-group">
                      <label>Title</label>
                      <input value={editingReview.title || ''} onChange={e => setEditingReview(f => ({ ...f, title: e.target.value }))} placeholder="Summarize your review" />
                    </div>
                    <div className="form-group">
                      <label>Review</label>
                      <textarea value={editingReview.body || ''} onChange={e => setEditingReview(f => ({ ...f, body: e.target.value }))} rows={3} />
                    </div>
                    <div className="review-form-actions">
                      <button type="button" className="cancel-review-btn" onClick={() => setEditingReview(null)}>Cancel</button>
                      <button type="submit" className="submit-review-btn" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {r.title && <p className="review-title">{r.title}</p>}
                    {r.body && <p className="review-body">{r.body}</p>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div className="pd-related">
          <div className="pd-related-inner">
            <h2>Similar Products</h2>
            <div className="related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <div className="pd-related">
          <div className="pd-related-inner">
            <h2>Recently Viewed</h2>
            <div className="related-grid">
              {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Image Lightbox ── */}
      {zoomedImg && (
        <div className="img-lightbox" onClick={() => setZoomedImg(null)}>
          <button type="button" className="lightbox-close" onClick={() => setZoomedImg(null)}>✕</button>
          <img
            src={zoomedImg}
            alt="Zoomed"
            onClick={e => e.stopPropagation()}
            onError={e => { e.target.src = PLACEHOLDER; }}
          />
          <div className="lightbox-thumbs" onClick={e => e.stopPropagation()}>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`thumb ${i}`}
                className={zoomedImg === img ? 'active' : ''}
                onClick={() => setZoomedImg(img)}
                onError={e => { e.target.src = PLACEHOLDER; }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
