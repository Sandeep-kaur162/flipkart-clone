import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin, FiClock } from 'react-icons/fi';
import api from '../api/axios';
import './OrderConfirmation.css';

const PLACEHOLDER = 'https://via.placeholder.com/60x60?text=No+Image';

const STATUS_ICONS = {
  placed:    <FiClock size={16} />,
  confirmed: <FiCheckCircle size={16} />,
  shipped:   <FiTruck size={16} />,
  delivered: <FiPackage size={16} />,
  cancelled: <FiCheckCircle size={16} />,
};

function OrderTimeline({ timeline, status }) {
  const STEPS = status === 'cancelled'
    ? ['placed', 'cancelled']
    : ['placed', 'confirmed', 'shipped', 'delivered'];

  const doneStatuses = new Set(timeline.map(t => t.status));

  return (
    <div className="order-timeline">
      {STEPS.map((step, i) => {
        const entry = timeline.find(t => t.status === step);
        const done = doneStatuses.has(step);
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step} className={`timeline-step ${done ? 'done' : ''}`}>
            <div className="timeline-left">
              <div className={`timeline-dot ${done ? 'done' : ''} ${step === 'cancelled' ? 'cancelled' : ''}`}>
                {STATUS_ICONS[step]}
              </div>
              {!isLast && <div className={`timeline-line ${done ? 'done' : ''}`} />}
            </div>
            <div className="timeline-content">
              <p className="timeline-status">{step.charAt(0).toUpperCase() + step.slice(1)}</p>
              {entry && <p className="timeline-note">{entry.note}</p>}
              {entry && <p className="timeline-time">{new Date(entry.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
          <div className="oc-check"><FiCheckCircle size={36} color="#fff" /></div>
          <h1>Order Placed Successfully!</h1>
          <p>Your order has been confirmed and will be delivered soon.</p>
          <div className="oc-order-id">
            <FiPackage /> Order ID: <strong>{orderId}</strong>
          </div>
        </div>

        {order && (
          <>
            {/* Timeline */}
            {order.timeline && (
              <div className="oc-timeline-wrap">
                <h2>Order Status</h2>
                <OrderTimeline timeline={order.timeline} status={order.status} />
              </div>
            )}

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
