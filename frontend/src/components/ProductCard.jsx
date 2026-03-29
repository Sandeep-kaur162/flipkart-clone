import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const PLACEHOLDER = 'https://via.placeholder.com/200x200?text=No+Image';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id || product.product_id);
  const pid = product.id || product.product_id;

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    inWishlist ? removeFromWishlist(pid) : addToWishlist(pid);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(pid);
  };

  const image = product.images?.[0] || PLACEHOLDER;
  const discount = product.discount_percent;

  return (
    <Link to={`/product/${pid}`} className="product-card">
      <div className="product-card-image-wrap">
        <img src={image} alt={product.name} loading="lazy" onError={(e) => { e.target.src = PLACEHOLDER; }} />
        <button className={`wishlist-btn ${inWishlist ? 'active' : ''}`} onClick={toggleWishlist} aria-label="Wishlist">
          {inWishlist ? <FaHeart color="#ff6161" /> : <FiHeart />}
        </button>
      </div>
      <div className="product-card-info">
        <p className="product-name">{product.name}</p>
        {product.rating > 0 && (
          <div className="product-rating">
            <span className="rating-badge">
              {product.rating} <FaStar size={10} />
            </span>
            <span className="rating-count">({(product.rating_count || 0).toLocaleString()})</span>
          </div>
        )}
        <div className="product-price-row">
          <span className="product-price">₹{Number(product.price).toLocaleString()}</span>
          {product.original_price && (
            <span className="product-original-price">₹{Number(product.original_price).toLocaleString()}</span>
          )}
          {discount > 0 && <span className="product-discount">{discount}% off</span>}
        </div>
        {product.brand && <p className="product-brand">{product.brand}</p>}
      </div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
    </Link>
  );
}
