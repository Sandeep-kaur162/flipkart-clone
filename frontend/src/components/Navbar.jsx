import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiHeart, FiPackage, FiUser } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Navbar.css';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Flipkart</span>
          <span className="logo-tagline">
            <em>Explore</em> <span>Plus</span>
          </span>
        </Link>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <FiSearch size={18} />
          </button>
        </form>

        {/* Nav Actions */}
        <div className="navbar-actions">
          <Link to="/wishlist" className="nav-action">
            <FiHeart size={20} />
            <span>Wishlist</span>
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </Link>
          <Link to="/orders" className="nav-action">
            <FiPackage size={20} />
            <span>Orders</span>
          </Link>
          <Link to="/cart" className="nav-action cart-action">
            <FiShoppingCart size={20} />
            <span>Cart</span>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>
          <div className="nav-action">
            <FiUser size={20} />
            <span>Guest</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
