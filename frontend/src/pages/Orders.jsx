import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import api from '../api/axios';
import './Orders.css';

const PLACEHOLDER = 'https://via.placeholder.com/60x60?text=No+Image';

const STATUS_COLOR = {
  placed: '#2874f0',
  confirmed: '#388e3c',
  shipped: '#ff9f00',
  delivered: '#388e3c',
  cancelled: '#ff6161',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="orders-loading">Loading orders...</div>;

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1 className="orders-title">My Orders</h1>
        {orders.length === 0 ? (
          <div className="orders-empty">
            <FiPackage size={64} color="#e0e0e0" />
            <h2>No orders yet</h2>
            <p>You haven't placed any orders.</p>
            <Link to="/" className="shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Order #{order.order_id}</span>
                    <span className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <span className="order-status" style={{ color: STATUS_COLOR[order.status] || '#212121' }}>
                    {order.status?.toUpperCase()}
                  </span>
                </div>
                <div className="order-items-preview">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="order-item-row">
                      <img src={item.images?.[0] || PLACEHOLDER} alt={item.name} onError={(e) => { e.target.src = PLACEHOLDER; }} />
                      <div>
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-meta">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="more-items">+{order.items.length - 3} more items</p>
                  )}
                </div>
                <div className="order-card-footer">
                  <span className="order-total">Total: ₹{Number(order.total_amount).toLocaleString()}</span>
                  <Link to={`/order-confirmation/${order.order_id}`} className="view-order-btn">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
