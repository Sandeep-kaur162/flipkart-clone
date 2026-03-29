import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import api from '../api/axios';
import './OrderConfirmation.css';

const PLACEHOLDER = 'https://via.placeholder.com/60x60?text=No+Image';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="oc-loading">Loading...</div>;

  return (
    <div className="oc-page">
      <div className="oc-container">
        <div className="oc-header">
          <FiCheckCircle size={48} color="#388e3c" />
          <h1>Order Placed Successfully!</h1>
          <p>Your order has been confirmed and will be delivered soon.</p>
          <div className="oc-order-id">
            <FiPackage /> Order ID: <strong>{orderId}</strong>
          </div>
        </div>

        {order && (
          <>
            <div className="oc-items">
              <h2>Items Ordered</h2>
              {order.items?.map((item, i) => (
                <div key={i} className="oc-item">
                  <img src={item.images?.[0] || PLACEHOLDER} alt={item.name} onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  <div className="oc-item-info">
                    <p className="oc-item-name">{item.name}</p>
                    <p className="oc-item-meta">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
                  </div>
                  <span className="oc-item-total">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="oc-details">
              <div className="oc-address">
                <h3>Delivery Address</h3>
                <p><strong>{order.full_name}</strong></p>
                <p>{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}</p>
                <p>{order.city}, {order.state} - {order.pincode}</p>
                <p>Phone: {order.phone}</p>
              </div>
              <div className="oc-payment">
                <h3>Payment</h3>
                <p>{order.payment_method}</p>
                <h3 style={{ marginTop: 16 }}>Total Amount</h3>
                <p className="oc-total">₹{Number(order.total_amount).toLocaleString()}</p>
              </div>
            </div>
          </>
        )}

        <div className="oc-actions">
          <Link to="/orders" className="oc-btn secondary">View All Orders</Link>
          <Link to="/" className="oc-btn primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
