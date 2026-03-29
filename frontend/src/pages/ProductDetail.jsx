import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart } from 'react-icons/fa';
import { FiHeart, FiShoppingCart, FiZap } from 'react-icons/fi';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductDetail.css';

const PLACEHOLDER = 'https://via.placeholder.com/400x400?text=No+Image';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(({ data }) => { setProduct(data); setActiveImg(0); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pd-loading">Loading...</div>;
  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const images = product.images?.length ? product.images : [PLACEHOLDER];
  const specs = product.specifications || {};

  const handleAddToCart = async () => {
    await addToCart(product.id);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id);
    navigate('/cart');
  };

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* Left: Images */}
        <div className="pd-images">
          <div className="pd-thumbnails">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${product.name} ${i + 1}`}
                className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                onClick={() => setActiveImg(i)}
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            ))}
          </div>
          <div className="pd-main-image">
            <img
              src={images[activeImg]}
              alt={product.name}
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
          </div>
          <div className="pd-action-buttons">
            <button className="btn-cart" onClick={handleAddToCart}>
              <FiShoppingCart /> Add to Cart
            </button>
            <button className="btn-buy" onClick={handleBuyNow}>
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
              <span className="rating-badge">
                {product.rating} <FaStar size={12} />
              </span>
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
            <div className="pd-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {Object.keys(specs).length > 0 && (
            <div className="pd-specs">
              <h3>Specifications</h3>
              <table>
                <tbody>
                  {Object.entries(specs).map(([key, val]) => (
                    <tr key={key}>
                      <td className="spec-key">{key}</td>
                      <td className="spec-val">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
}
