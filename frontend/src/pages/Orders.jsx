import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiXCircle, FiAlertTriangle, FiChevronDown, FiChevronUp, FiClock, FiTruck, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import { toast } from 'react-toastify';
import './Orders.css';

const PLACEHOLDER = 'https://via.placeholder.com/60x60?text=No+Image';

const STATUS_COLOR = {
  placed:    '#2874f0',
  confirmed: '#388e3c',
  shipped:   '#ff9f00',
  delivered: '#388e3c',
  cancelled: '#ff6161',
};

const CANCELLABLE = ['placed', 'confirmed'];

const STATUS_ICONS = { placed: <FiClock size={14}/>, confirmed: <FiCheckCircle size={14}/>, shipped: <FiTruck size={14}/>, delivered: <FiPackage size={14}/>, cancelled: <FiXCircle size={14}/> };

function MiniTimeline({ timeline, status }) {
  const STEPS = status === 'cancelled' ? ['placed', 'cancelled'] : ['placed', 'confirmed', 'shipped', 'delivered'];
  const doneSet = new Set(timeline.map(t => t.status));
  return (
    <div className="mini-timeline">
      {STEPS.map((step, i) => (
        <div key={step} className="mini-step">
          <div className={`mini-dot ${doneSet.has(step) ? 'done' : ''} ${step === 'cancelled' ? 'cancelled' : ''}`}>
            {STATUS_ICONS[step]}
          </div>
          {i < STEPS.length - 1 && <div className={`mini-connector ${doneSet.has(step) ? 'done' : ''}`} />}
          <span className={`mini-label ${doneSet.has(step) ? 'done' : ''}`}>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────
function CancelModal({ order, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <FiAlertTriangle size={40} color="#ff9f00" />
        <h2>Cancel Order?</h2>
        <p>Are you sure you want to cancel order <strong>#{order.order_id}</strong>?</p>
        <p className="modal-sub">This action cannot be undone. Stock will be restored.</p>
        <div className="modal-actions">
          <button className="modal-btn secondary" onClick={onClose}>Keep Order</button>
          <button className="modal-btn danger" onClick={onConfirm}>Yes, Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [expandedTimeline, setExpandedTimeline] = useState({});
  const [timelines, setTimelines] = useState({});

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const toggleTimeline = async (order) => {
    const oid = order.order_id;
    if (expandedTimeline[oid]) {
      setExpandedTimeline(p => ({ ...p, [oid]: false }));
      return;
    }
    if (!timelines[oid]) {
      try {
        const { data } = await api.get(`/orders/${oid}`);
        setTimelines(p => ({ ...p, [oid]: data.timeline || [] }));
      } catch { return; }
    }
    setExpandedTimeline(p => ({ ...p, [oid]: true }));
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${cancelTarget.order_id}/cancel`);
      toast.success('Order cancelled successfully');
      setOrders(prev =>
        prev.map(o => o.order_id === cancelTarget.order_id ? { ...o, status: 'cancelled' } : o)
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

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
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="order-status" style={{ color: STATUS_COLOR[order.status] || '#212121' }}>
                    {order.status?.toUpperCase()}
                  </span>
                </div>

                <div className="order-items-preview">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="order-item-row">
                      <img src={item.images?.[0] || PLACEHOLDER} alt={item.name} onError={e => e.target.src = PLACEHOLDER} />
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
                  <div className="order-footer-actions">
                    <button className="track-btn" onClick={() => toggleTimeline(order)}>
                      {expandedTimeline[order.order_id] ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/>}
                      Track
                    </button>
                    {CANCELLABLE.includes(order.status) && (
                      <button className="cancel-order-btn" onClick={() => setCancelTarget(order)}>
                        <FiXCircle size={14} /> Cancel Order
                      </button>
                    )}
                    <Link to={`/order-confirmation/${order.order_id}`} className="view-order-btn">
                      View Details
                    </Link>
                  </div>
                </div>

                {expandedTimeline[order.order_id] && timelines[order.order_id] && (
                  <div className="order-timeline-expand">
                    <MiniTimeline timeline={timelines[order.order_id]} status={order.status} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {cancelTarget && (
        <CancelModal
          order={cancelTarget}
          onConfirm={handleCancel}
          onClose={() => !cancelling && setCancelTarget(null)}
        />
      )}
    </div>
  );
}
