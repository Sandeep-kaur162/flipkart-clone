import { useState } from 'react';
import { FiSearch, FiPackage, FiCheckCircle, FiTruck, FiClock, FiXCircle, FiMapPin } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import api from '../api/axios';
import './TrackOrder.css';

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];

const STATUS_META = {
  placed:    { icon: <FiClock size={20}/>,       color: '#2874f0', label: 'Order Placed',    bg: '#e8f0fe' },
  confirmed: { icon: <FiCheckCircle size={20}/>, color: '#388e3c', label: 'Confirmed',        bg: '#e8f5e9' },
  shipped:   { icon: <FiTruck size={20}/>,       color: '#f59e0b', label: 'Shipped',          bg: '#fff8e1' },
  delivered: { icon: <FiPackage size={20}/>,     color: '#16a34a', label: 'Delivered',        bg: '#dcfce7' },
  cancelled: { icon: <FiXCircle size={20}/>,     color: '#e53935', label: 'Cancelled',        bg: '#fee2e2' },
};

const PLACEHOLDER = 'https://via.placeholder.com/60x60?text=No+Image';

function parseImages(item) {
  try { item.images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images || []; } catch { item.images = []; }
  return item;
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await api.get(`/orders/track/${orderId.trim()}`);
      setOrder({ ...data, items: (data.items || []).map(parseImages) });
    } catch (err) {
      setError(err.response?.data?.error || 'Order not found. Please check the Order ID.');
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = order?.status === 'cancelled';
  const steps = isCancelled ? ['placed', 'cancelled'] : STATUS_STEPS;
  const currentIdx = order ? steps.indexOf(order.status) : -1;

  return (
    <div className="track-page">
      <div className="track-container">
        <div className="track-header">
          <FiPackage size={32} color="#2874f0" />
          <h1>Track Your Order</h1>
          <p>Enter your Order ID to get real-time tracking updates</p>
        </div>

        <form className="track-search" onSubmit={handleTrack}>
          <input
            type="text"
            placeholder="Enter Order ID (e.g. OD1234567890)"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            <FiSearch size={16} /> {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="track-error">
            <FiXCircle size={20} color="#e53935" /> {error}
          </div>
        )}

        {order && (
          <div className="track-result">
            {/* Order Header */}
            <div className="track-order-header">
              <div>
                <p className="track-order-id">Order ID: <strong>{order.order_id}</strong></p>
                <p className="track-order-date">Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="track-status-badge" style={{ background: STATUS_META[order.status]?.bg, color: STATUS_META[order.status]?.color }}>
                {STATUS_META[order.status]?.icon}
                <span>{STATUS_META[order.status]?.label}</span>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="track-stepper">
              {steps.map((step, i) => {
                const done = i <= currentIdx;
                const meta = STATUS_META[step];
                return (
                  <div key={step} className="track-step-wrap">
                    <div className={`track-step ${done ? 'done' : ''} ${step === 'cancelled' ? 'cancelled' : ''}`}>
                      <div className="track-step-dot" style={done ? { background: meta.color, borderColor: meta.color } : {}}>
                        {done ? <span style={{ color: '#fff' }}>{meta.icon}</span> : <span className="track-step-num">{i + 1}</span>}
                      </div>
                      <p className="track-step-label" style={done ? { color: meta.color, fontWeight: 700 } : {}}>{meta.label}</p>
                      {order.timeline?.find(t => t.status === step) && (
                        <p className="track-step-time">
                          {new Date(order.timeline.find(t => t.status === step).created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`track-connector ${i < currentIdx ? 'done' : ''}`} style={i < currentIdx ? { background: STATUS_META[steps[i]].color } : {}} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cancelled Banner */}
            {isCancelled && (
              <div className="track-cancelled-banner">
                <FiXCircle size={20} /> This order has been cancelled.
                {order.timeline?.find(t => t.status === 'cancelled')?.note && (
                  <span> Reason: {order.timeline.find(t => t.status === 'cancelled').note}</span>
                )}
              </div>
            )}

            {/* Timeline */}
            {order.timeline?.length > 0 && (
              <div className="track-timeline">
                <h3>Order Timeline</h3>
                {[...order.timeline].reverse().map((t, i) => (
                  <div key={i} className="track-timeline-item">
                    <div className="track-tl-dot" style={{ background: STATUS_META[t.status]?.color || '#ccc' }} />
                    <div className="track-tl-content">
                      <p className="track-tl-status">{STATUS_META[t.status]?.label || t.status}</p>
                      <p className="track-tl-note">{t.note}</p>
                      <p className="track-tl-time">{new Date(t.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Items */}
            <div className="track-items">
              <h3>Items in this Order</h3>
              {order.items?.map((item, i) => (
                <div key={i} className="track-item">
                  <img src={item.images?.[0] || PLACEHOLDER} alt={item.name} onError={e => e.target.src = PLACEHOLDER} />
                  <div className="track-item-info">
                    <p className="track-item-name">{item.name}</p>
                    <p className="track-item-meta">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
                  </div>
                  <span className="track-item-total">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="track-delivery">
              <div className="track-delivery-row">
                <FiMapPin size={16} color="#2874f0" />
                <div>
                  <p className="track-delivery-label">Delivering to</p>
                  <p className="track-delivery-addr">{order.full_name} — {order.city}, {order.state} {order.pincode}</p>
                </div>
              </div>
              <div className="track-delivery-row">
                <span style={{ fontSize: 16 }}>💳</span>
                <div>
                  <p className="track-delivery-label">Payment</p>
                  <p className="track-delivery-addr">{order.payment_method} · ₹{Number(order.total_amount).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
