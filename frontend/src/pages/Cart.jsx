import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './Cart.css';

const PLACEHOLDER = 'https://via.placeholder.com/80x80?text=No+Image';

export default function Cart() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <img src="https://rukminim2.flixcart.com/web/320/320/assetsv3/ui/images/empty-state/cart.png" alt="Empty cart" onError={(e) => e.target.style.display='none'} />
        <h2>Your cart is empty</h2>
        <p>Add items to it now.</p>
        <Link to="/" className="shop-btn">Shop Now</Link>
      </div>
    );
  }

  const savings = cart.reduce((sum, item) => {
    const orig = item.original_price || item.price;
    return sum + (orig - item.price) * item.quantity;
  }, 0);

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items">
          <h2 className="cart-title">My Cart ({cart.length} items)</h2>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <Link to={`/product/${item.product_id}`}>
                <img
                  src={item.images?.[0] || PLACEHOLDER}
                  alt={item.name}
                  className="cart-item-img"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
              </Link>
              <div className="cart-item-details">
                <Link to={`/product/${item.product_id}`} className="cart-item-name">{item.name}</Link>
                <p className="cart-item-brand">{item.brand}</p>
                <div className="cart-item-price-row">
                  <span className="cart-item-price">₹{Number(item.price).toLocaleString()}</span>
                  {item.original_price && (
                    <span className="cart-item-original">₹{Number(item.original_price).toLocaleString()}</span>
                  )}
                  {item.discount_percent > 0 && (
                    <span className="cart-item-discount">{item.discount_percent}% off</span>
                  )}
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">
                      <FiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="cart-summary">
          <h3>Price Details</h3>
          <div className="summary-row">
            <span>Price ({cart.length} items)</span>
            <span>₹{cart.reduce((s, i) => s + (i.original_price || i.price) * i.quantity, 0).toLocaleString()}</span>
          </div>
          {savings > 0 && (
            <div className="summary-row discount">
              <span>Discount</span>
              <span>- ₹{savings.toLocaleString()}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery Charges</span>
            <span className="free">Free</span>
          </div>
          <div className="summary-total">
            <span>Total Amount</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          {savings > 0 && (
            <p className="savings-msg">You will save ₹{savings.toLocaleString()} on this order</p>
          )}
          <button className="checkout-btn" onClick={() => navigate('/checkout')}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
