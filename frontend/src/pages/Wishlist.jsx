import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Wishlist.css';

const PLACEHOLDER = 'https://via.placeholder.com/160x160?text=No+Image';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        <FiHeart size={64} color="#e0e0e0" />
        <h2>Your wishlist is empty</h2>
        <p>Save items you like to your wishlist.</p>
        <Link to="/" className="shop-btn">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1 className="wishlist-title">My Wishlist ({wishlist.length} items)</h1>
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div key={item.id} className="wishlist-card">
              <button className="wl-remove" onClick={() => removeFromWishlist(item.product_id)} aria-label="Remove from wishlist">×</button>
              <Link to={`/product/${item.product_id}`}>
                <img
                  src={item.images?.[0] || PLACEHOLDER}
                  alt={item.name}
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
              </Link>
              <div className="wl-info">
                <Link to={`/product/${item.product_id}`} className="wl-name">{item.name}</Link>
                <div className="wl-price-row">
                  <span className="wl-price">₹{Number(item.price).toLocaleString()}</span>
                  {item.original_price && (
                    <span className="wl-original">₹{Number(item.original_price).toLocaleString()}</span>
                  )}
                  {item.discount_percent > 0 && (
                    <span className="wl-discount">{item.discount_percent}% off</span>
                  )}
                </div>
              </div>
              <button
                className="wl-cart-btn"
                onClick={() => addToCart(item.product_id)}
                disabled={item.stock === 0}
              >
                <FiShoppingCart /> {item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
