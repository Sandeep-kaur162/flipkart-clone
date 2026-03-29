import { useState, useEffect } from 'react';
import { FiRefreshCw, FiPackage, FiXCircle, FiTruck, FiCheckCircle, FiClock, FiUser, FiSearch } from 'react-icons/fi';
import api from '../api/axios';
import { toast } from 'react-toastify';
import './AdminOrders.css';

const STATUS_OPTIONS = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLOR = { placed:'#2874f0', confirmed:'#388e3c', shipped:'#f59e0b', delivered:'#16a34a', cancelled:'#e53935' };
const STATUS_ICON = { placed:<FiClock size={13}/>, confirmed:<FiCheckCircle size={13}/>, shipped:<FiTruck size={13}/>, delivered:<FiPackage size={13}/>, cancelled:<FiXCircle size={13}/> };
const PLACEHOLDER = 'https://via.placeholder.com/48x48?text=No+Image';

function parseImages(item) {
  try { item.images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images || []; } catch { item.images = []; }
  return item;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/admin/all');
      setOrders(data.map(o => ({ ...o, items: (o.items || []).map(parseImages) })));
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(u => ({ ...u, [orderId]: true }));
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus, note: `Status updated to ${newStatus} by admin` });
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order ${orderId} → ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(u => ({ ...u, [orderId]: false })); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.order_id.toLowerCase().includes(search.toLowerCase()) || (o.user_name || '').toLowerCase().includes(search.toLowerCase()) || (o.user_email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = STATUS_OPTIONS.reduce((acc, s) => { acc[s] = orders.filter(o => o.status === s).length; return acc; }, {});

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>Admin — Orders</h1>
            <p>{orders.length} total orders</p>
          </div>
          <button className="admin-refresh-btn" onClick={fetchOrders} disabled={loading}>
            <FiRefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {STATUS_OPTIONS.map(s => (
            <div key={s} className={`admin-stat-card ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)} style={{ borderColor: filterStatus === s ? STATUS_COLOR[s] : 'var(--border)' }}>
              <span className="admin-stat-icon" style={{ color: STATUS_COLOR[s] }}>{STATUS_ICON[s]}</span>
              <span className="admin-stat-count" style={{ color: STATUS_COLOR[s] }}>{stats[s] || 0}</span>
              <span className="admin-stat-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="admin-toolbar">
          <div className="admin-search">
            <FiSearch size={15} />
            <input placeholder="Search by Order ID, customer name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="admin-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="admin-loading">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">No orders found</div>
        ) : (
          <div className="admin-orders-list">
            {filtered.map(order => (
              <div key={order.id} className={`admin-order-card ${order.status === 'cancelled' ? 'cancelled' : ''}`}>
                {order.status === 'cancelled' && (
                  <div className="admin-cancelled-ribbon">CANCELLED</div>
                )}
                <div className="admin-order-top">
                  <div className="admin-order-meta">
                    <span className="admin-order-id">#{order.order_id}</span>
                    <span className="admin-order-date">{new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="admin-order-customer">
                    <FiUser size={13} />
                    <span>{order.user_name || 'Guest'}</span>
                    {order.user_email && <span className="admin-customer-email">({order.user_email})</span>}
                  </div>
                  <div className="admin-order-right">
                    <span className="admin-order-amount">₹{Number(order.total_amount).toLocaleString()}</span>
                    <span className="admin-status-badge" style={{ background: STATUS_COLOR[order.status] + '20', color: STATUS_COLOR[order.status] }}>
                      {STATUS_ICON[order.status]} {order.status}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="admin-order-items">
                  {order.items?.slice(0, 4).map((item, i) => (
                    <div key={i} className="admin-item-chip">
                      <img src={item.images?.[0] || PLACEHOLDER} alt={item.name} onError={e => e.target.src = PLACEHOLDER} />
                      <span>{item.name?.substring(0, 28)}{item.name?.length > 28 ? '...' : ''}</span>
                      <span className="admin-item-qty">×{item.quantity}</span>
                    </div>
                  ))}
                  {order.items?.length > 4 && <span className="admin-more-items">+{order.items.length - 4} more</span>}
                </div>

                {/* Delivery */}
                {order.full_name && (
                  <div className="admin-order-addr">
                    📍 {order.full_name}, {order.city}, {order.state}
                  </div>
                )}

                {/* Status Update */}
                <div className="admin-status-update">
                  <span className="admin-update-label">Update Status:</span>
                  <div className="admin-status-btns">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        className={`admin-status-btn ${order.status === s ? 'current' : ''} ${s === 'cancelled' ? 'danger' : ''}`}
                        style={order.status === s ? { background: STATUS_COLOR[s], color: '#fff', borderColor: STATUS_COLOR[s] } : {}}
                        onClick={() => order.status !== s && handleStatusChange(order.order_id, s)}
                        disabled={order.status === s || updating[order.order_id]}
                      >
                        {STATUS_ICON[s]} {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
