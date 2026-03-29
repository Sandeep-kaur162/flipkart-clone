import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiHeart, FiPackage, FiUser, FiLogOut, FiLogIn, FiChevronDown } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img
            src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg"
            alt="Flipkart"
            className="flipkart-logo-img"
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="logo-fallback" style={{display:'none'}}>
            <div className="logo-icon">F</div>
            <div className="logo-words">
              <span className="logo-name">Flipkart</span>
              <span className="logo-sub">Explore <em>Plus</em></span>
            </div>
          </div>
        </Link>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <FiSearch className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {/* Actions */}
        <div className="navbar-actions">
          <Link to="/wishlist" className="nav-action">
            <div className="nav-icon-wrap">
              <FiHeart size={19} />
              {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
            </div>
            <span>Wishlist</span>
          </Link>

          <Link to="/orders" className="nav-action">
            <div className="nav-icon-wrap">
              <FiPackage size={19} />
            </div>
            <span>Orders</span>
          </Link>

          <Link to="/cart" className="nav-action">
            <div className="nav-icon-wrap">
              <FiShoppingCart size={19} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </div>
            <span>Cart</span>
          </Link>

          {/* User */}
          <div className="nav-action user-menu" ref={dropdownRef} onClick={() => setDropdownOpen(o => !o)}>
            <div className="nav-icon-wrap">
              {user
                ? <div className="user-avatar">{user.name[0].toUpperCase()}</div>
                : <FiUser size={19} />}
            </div>
            <span>{user ? user.name.split(' ')[0] : 'Login'}</span>
            <FiChevronDown size={12} style={{ marginLeft: 2, opacity: 0.7 }} />

            {dropdownOpen && (
              <div className="user-dropdown">
                {user ? (
                  <>
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">{user.name[0].toUpperCase()}</div>
                      <div>
                        <p className="dropdown-name">{user.name}</p>
                        <p className="dropdown-email">{user.email}</p>
                      </div>
                    </div>
                    <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiPackage size={14} /> My Orders
                    </Link>
                    <Link to="/track-order" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiSearch size={14} /> Track Order
                    </Link>
                    <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiHeart size={14} /> Wishlist
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <FiLogOut size={14} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="dropdown-guest">
                      <p>Welcome to Flipkart Clone</p>
                      <span>Sign in for the best experience</span>
                    </div>
                    <Link to="/login" className="dropdown-login-btn" onClick={() => setDropdownOpen(false)}>
                      <FiLogIn size={14} /> Login / Sign Up
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiPackage size={14} /> My Orders
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
