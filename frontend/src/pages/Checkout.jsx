import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiPlus, FiCheck, FiTrash2, FiX, FiCheckCircle, FiSmartphone, FiCreditCard, FiGlobe, FiTruck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import './Checkout.css';

const PLACEHOLDER = 'https://via.placeholder.com/60x60?text=No+Image';
const STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
const EMPTY_ADDR = { full_name:'', phone:'', address_line1:'', address_line2:'', city:'', state:'', pincode:'' };

const BANKS = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Punjab National Bank','Bank of Baroda','Canara Bank','Union Bank of India','Yes Bank'];

// ── UPI Modal ─────────────────────────────────────────────────────────────
function UPIModal({ amount, onSuccess, onClose }) {
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [screen, setScreen] = useState('options'); // options | qr | id | paytm | processing | success

  const handlePay = () => {
    if (screen === 'id' && !upiId.includes('@')) return toast.error('Enter valid UPI ID (e.g. name@upi)');
    setScreen('processing');
    setTimeout(() => { setScreen('success'); setTimeout(onSuccess, 1500); }, 2500);
  };

  return (
    <div className="pg-overlay" onClick={onClose}>
      <div className="pg-modal" onClick={e => e.stopPropagation()}>
        <div className="pg-header">
          <span>📱 UPI Payment</span>
          <button type="button" className="pg-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="pg-amount">Pay ₹{amount.toLocaleString('en-IN')}</div>

        {screen === 'options' && (
          <div className="pg-upi-options">
            <button className="pg-upi-app paytm" onClick={() => setScreen('paytm')}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png" alt="Paytm" />
              <span>Paytm</span>
            </button>
            <button className="pg-upi-app gpay" onClick={() => { setScreen('processing'); setTimeout(() => { setScreen('success'); setTimeout(onSuccess, 1500); }, 2500); }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" />
              <span>Google Pay</span>
            </button>
            <button className="pg-upi-app phonepe" onClick={() => { setScreen('processing'); setTimeout(() => { setScreen('success'); setTimeout(onSuccess, 1500); }, 2500); }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/PhonePe_Logo.svg" alt="PhonePe" />
              <span>PhonePe</span>
            </button>
            <div className="pg-divider">or</div>
            <button className="pg-upi-other" onClick={() => setScreen('qr')}>📷 Scan QR Code</button>
            <button className="pg-upi-other" onClick={() => setScreen('id')}>⌨️ Enter UPI ID</button>
          </div>
        )}

        {screen === 'paytm' && (
          <div className="pg-paytm">
            <div className="paytm-header">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png" alt="Paytm" className="paytm-logo" />
            </div>
            <div className="paytm-body">
              <div className="paytm-balance-card">
                <p className="paytm-label">Paytm Wallet Balance</p>
                <p className="paytm-balance">₹2,450.00</p>
              </div>
              <div className="paytm-bank-card">
                <p className="paytm-label">Linked Bank Account</p>
                <p className="paytm-bank-name">HDFC Bank ••••4521</p>
                <p className="paytm-bank-type">Savings Account</p>
              </div>
              <p className="paytm-pay-amount">Paying <strong>₹{amount.toLocaleString('en-IN')}</strong> to Flipkart Clone</p>
              <input className="paytm-pin-input" type="password" maxLength={6} placeholder="Enter Paytm UPI PIN" />
              <button className="paytm-pay-btn" onClick={handlePay}>Pay ₹{amount.toLocaleString('en-IN')}</button>
            </div>
          </div>
        )}

        {screen === 'qr' && (
          <div className="pg-qr">
            <p className="pg-qr-label">Scan with any UPI app</p>
            <div className="pg-qr-box">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <rect width="160" height="160" fill="white"/>
                {/* QR pattern — decorative */}
                {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
                  const pattern = [[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
                  return pattern[r][c] ? <rect key={`${r}-${c}`} x={10+c*10} y={10+r*10} width={9} height={9} fill="#000"/> : null;
                }))}
                {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
                  const pattern = [[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
                  return pattern[r][c] ? <rect key={`br-${r}-${c}`} x={90+c*10} y={10+r*10} width={9} height={9} fill="#000"/> : null;
                }))}
                {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
                  const pattern = [[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
                  return pattern[r][c] ? <rect key={`bl-${r}-${c}`} x={10+c*10} y={90+r*10} width={9} height={9} fill="#000"/> : null;
                }))}
                {/* center dots */}
                {[0,1,2,3,4,5,6,7,8,9].map(i => <rect key={`d${i}`} x={70+((i*13)%30)} y={70+((i*17)%30)} width={5} height={5} fill="#000"/>)}
              </svg>
            </div>
            <p className="pg-qr-upi">UPI ID: <strong>flipkartclone@upi</strong></p>
            <button className="pg-btn-secondary" onClick={() => setScreen('options')}>← Back</button>
          </div>
        )}

        {screen === 'id' && (
          <div className="pg-upi-id">
            <label>Enter UPI ID</label>
            <input className="pg-input" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
            <p className="pg-hint">e.g. mobilenumber@paytm, name@okaxis</p>
            <button className="pg-pay-btn" onClick={handlePay}>Verify & Pay</button>
            <button className="pg-btn-secondary" onClick={() => setScreen('options')}>← Back</button>
          </div>
        )}

        {screen === 'processing' && (
          <div className="pg-processing">
            <div className="pg-spinner" />
            <p>Processing payment...</p>
            <p className="pg-hint">Please wait, do not close this window</p>
          </div>
        )}

        {screen === 'success' && (
          <div className="pg-success">
            <FiCheckCircle size={56} color="#16a34a" />
            <p>Payment Successful!</p>
            <p className="pg-hint">₹{amount.toLocaleString('en-IN')} paid</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Credit/Debit Card Modal ───────────────────────────────────────────────
function CardModal({ amount, onSuccess, onClose }) {
  const [card, setCard] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [screen, setScreen] = useState('form'); // form | otp | processing | success
  const [otp, setOtp] = useState('');

  const formatCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = v => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d; };

  const handleSubmit = () => {
    if (card.number.replace(/\s/g,'').length < 16) return toast.error('Enter valid 16-digit card number');
    if (!card.name) return toast.error('Enter cardholder name');
    if (card.expiry.length < 5) return toast.error('Enter valid expiry date');
    if (card.cvv.length < 3) return toast.error('Enter valid CVV');
    setScreen('otp');
  };

  const handleOtp = () => {
    if (otp.length < 4) return toast.error('Enter OTP');
    setScreen('processing');
    setTimeout(() => { setScreen('success'); setTimeout(onSuccess, 1500); }, 2000);
  };

  const cardType = card.number.startsWith('4') ? 'VISA' : card.number.startsWith('5') ? 'MASTERCARD' : card.number.startsWith('6') ? 'RUPAY' : '💳';

  return (
    <div className="pg-overlay" onClick={onClose}>
      <div className="pg-modal" onClick={e => e.stopPropagation()}>
        <div className="pg-header">
          <span>💳 Card Payment</span>
          <button type="button" className="pg-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="pg-amount">Pay ₹{amount.toLocaleString('en-IN')}</div>

        {screen === 'form' && (
          <div className="pg-card-form">
            <div className="pg-card-preview">
              <div className="card-chip">▬</div>
              <div className="card-number-display">{card.number || '•••• •••• •••• ••••'}</div>
              <div className="card-bottom">
                <div><p className="card-label">CARD HOLDER</p><p className="card-value">{card.name || 'YOUR NAME'}</p></div>
                <div><p className="card-label">EXPIRES</p><p className="card-value">{card.expiry || 'MM/YY'}</p></div>
                <div className="card-type">{cardType}</div>
              </div>
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input className="pg-input" placeholder="1234 5678 9012 3456" value={card.number} onChange={e => setCard(c => ({...c, number: formatCard(e.target.value)}))} maxLength={19} />
            </div>
            <div className="form-group">
              <label>Cardholder Name</label>
              <input className="pg-input" placeholder="Name on card" value={card.name} onChange={e => setCard(c => ({...c, name: e.target.value.toUpperCase()}))} />
            </div>
            <div className="pg-card-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input className="pg-input" placeholder="MM/YY" value={card.expiry} onChange={e => setCard(c => ({...c, expiry: formatExpiry(e.target.value)}))} maxLength={5} />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input className="pg-input" placeholder="•••" type="password" value={card.cvv} onChange={e => setCard(c => ({...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4)}))} maxLength={4} />
              </div>
            </div>
            <button className="pg-pay-btn" onClick={handleSubmit}>Pay Securely</button>
          </div>
        )}

        {screen === 'otp' && (
          <div className="pg-otp-screen">
            <div className="pg-otp-icon">🔐</div>
            <p className="pg-otp-title">3D Secure Authentication</p>
            <p className="pg-hint">OTP sent to your registered mobile number</p>
            <input className="pg-input pg-otp-input" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6} />
            <p className="pg-hint" style={{color:'#2874f0',cursor:'pointer'}}>Resend OTP</p>
            <button className="pg-pay-btn" onClick={handleOtp}>Verify & Pay</button>
          </div>
        )}

        {screen === 'processing' && (
          <div className="pg-processing"><div className="pg-spinner" /><p>Processing payment...</p></div>
        )}
        {screen === 'success' && (
          <div className="pg-success"><FiCheckCircle size={56} color="#16a34a" /><p>Payment Successful!</p><p className="pg-hint">₹{amount.toLocaleString('en-IN')} paid</p></div>
        )}
      </div>
    </div>
  );
}

// ── Net Banking Modal ─────────────────────────────────────────────────────
function NetBankingModal({ amount, onSuccess, onClose }) {
  const [selectedBank, setSelectedBank] = useState('');
  const [screen, setScreen] = useState('select'); // select | login | otp | processing | success
  const [creds, setCreds] = useState({ userId:'', password:'' });
  const [otp, setOtp] = useState('');

  return (
    <div className="pg-overlay" onClick={onClose}>
      <div className="pg-modal" onClick={e => e.stopPropagation()}>
        <div className="pg-header">
          <span>🌐 Net Banking</span>
          <button type="button" className="pg-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="pg-amount">Pay ₹{amount.toLocaleString('en-IN')}</div>

        {screen === 'select' && (
          <div className="pg-netbanking">
            <p className="pg-nb-label">Select your bank</p>
            <div className="pg-bank-grid">
              {BANKS.map(b => (
                <button key={b} className={`pg-bank-btn ${selectedBank===b?'selected':''}`} onClick={() => setSelectedBank(b)}>
                  <span className="pg-bank-icon">🏦</span>
                  <span>{b}</span>
                </button>
              ))}
            </div>
            <button className="pg-pay-btn" disabled={!selectedBank} onClick={() => setScreen('login')}>
              Proceed to {selectedBank || 'Bank'}
            </button>
          </div>
        )}

        {screen === 'login' && (
          <div className="pg-nb-login">
            <div className="pg-nb-bank-header">
              <span className="pg-nb-bank-icon">🏦</span>
              <span className="pg-nb-bank-name">{selectedBank}</span>
            </div>
            <p className="pg-nb-secure">🔒 Secure Net Banking Login</p>
            <div className="form-group">
              <label>User ID / Customer ID</label>
              <input className="pg-input" placeholder="Enter User ID" value={creds.userId} onChange={e => setCreds(c => ({...c, userId: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="pg-input" type="password" placeholder="Enter Password" value={creds.password} onChange={e => setCreds(c => ({...c, password: e.target.value}))} />
            </div>
            <button className="pg-pay-btn" onClick={() => {
              if (!creds.userId || !creds.password) return toast.error('Enter credentials');
              setScreen('otp');
            }}>Login & Pay</button>
            <button className="pg-btn-secondary" onClick={() => setScreen('select')}>← Change Bank</button>
          </div>
        )}

        {screen === 'otp' && (
          <div className="pg-otp-screen">
            <div className="pg-otp-icon">🔐</div>
            <p className="pg-otp-title">Transaction OTP</p>
            <p className="pg-hint">OTP sent to your registered mobile</p>
            <input className="pg-input pg-otp-input" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6} />
            <button className="pg-pay-btn" onClick={() => {
              if (!otp) return toast.error('Enter OTP');
              setScreen('processing');
              setTimeout(() => { setScreen('success'); setTimeout(onSuccess, 1500); }, 2000);
            }}>Confirm Payment</button>
          </div>
        )}

        {screen === 'processing' && (
          <div className="pg-processing"><div className="pg-spinner" /><p>Processing payment...</p></div>
        )}
        {screen === 'success' && (
          <div className="pg-success"><FiCheckCircle size={56} color="#16a34a" /><p>Payment Successful!</p><p className="pg-hint">₹{amount.toLocaleString('en-IN')} paid</p></div>
        )}
      </div>
    </div>
  );
}

// ── Main Checkout Component ───────────────────────────────────────────────
export default function Checkout() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddr, setNewAddr] = useState(EMPTY_ADDR);
  const [saveAddr, setSaveAddr] = useState(true);

  useEffect(() => {
    api.get('/addresses').then(({ data }) => {
      setSavedAddresses(data);
      if (data.length > 0) { const def = data.find(a => a.is_default) || data[0]; setSelectedAddrId(def.id); setShowNewForm(false); }
      else { setSelectedAddrId('new'); setShowNewForm(true); }
    }).catch(() => { setSelectedAddrId('new'); setShowNewForm(true); });
  }, []);

  const handleNewAddrChange = e => setNewAddr({ ...newAddr, [e.target.name]: e.target.value });
  const handleSelectAddr = id => { setSelectedAddrId(id); setShowNewForm(false); };
  const handleAddNew = () => { setSelectedAddrId('new'); setShowNewForm(true); setNewAddr(EMPTY_ADDR); };

  const handleDeleteAddr = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/addresses/${id}`);
      const updated = savedAddresses.filter(a => a.id !== id);
      setSavedAddresses(updated);
      if (selectedAddrId === id) { if (updated.length > 0) setSelectedAddrId(updated[0].id); else { setSelectedAddrId('new'); setShowNewForm(true); } }
      toast.success('Address removed');
    } catch { toast.error('Failed to remove address'); }
  };

  const getActiveAddress = () => selectedAddrId === 'new' ? newAddr : (savedAddresses.find(a => a.id === selectedAddrId) || newAddr);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (selectedAddrId === 'new' && saveAddr) {
      try {
        const { data } = await api.post('/addresses', { ...newAddr, is_default: savedAddresses.length === 0 });
        setSavedAddresses(prev => [data, ...prev]);
        setSelectedAddrId(data.id);
        setShowNewForm(false);
        toast.success('Address saved');
      } catch {}
    }
    setStep(2);
  };

  const placeOrderInDB = async (method) => {
    const address = getActiveAddress();
    const items = cart.map(item => ({ product_id: item.product_id, quantity: item.quantity, price: item.price }));
    const { data } = await api.post('/orders', { address, items, payment_method: method, coupon_code: coupon?.code });
    return data.order_id;
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'COD') {
      setPlacing(true);
      try { const oid = await placeOrderInDB('COD'); navigate(`/order-confirmation/${oid}`); }
      catch { toast.error('Failed to place order'); }
      finally { setPlacing(false); }
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setPlacing(true);
    try { const oid = await placeOrderInDB(paymentMethod); navigate(`/order-confirmation/${oid}`); }
    catch { toast.error('Failed to place order'); }
    finally { setPlacing(false); }
  };

  if (cart.length === 0) { navigate('/cart'); return null; }

  const activeAddr = getActiveAddress();
  const savings = cart.reduce((s, i) => s + ((i.original_price || i.price) - i.price) * i.quantity, 0);
  const couponDiscount = coupon ? coupon.discount_amount : 0;
  const finalTotal = Math.max(0, cartTotal - couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try { const { data } = await api.post('/coupons/validate', { code: couponCode, order_amount: cartTotal }); setCoupon(data); toast.success(data.message); }
    catch (err) { setCoupon(null); toast.error(err.response?.data?.error || 'Invalid coupon'); }
    finally { setCouponLoading(false); }
  };

  const PAYMENT_METHODS = [
    { val: 'COD',        icon: <FiTruck size={18}/>,      label: 'Cash on Delivery',    desc: 'Pay when your order arrives' },
    { val: 'UPI',        icon: <FiSmartphone size={18}/>, label: 'UPI',                 desc: 'Paytm, GPay, PhonePe, QR Code' },
    { val: 'Card',       icon: <FiCreditCard size={18}/>, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
    { val: 'NetBanking', icon: <FiGlobe size={18}/>,      label: 'Net Banking',         desc: 'All major banks supported' },
  ];

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}><span className="step-num">1</span> Delivery Address</div>
          <div className="step-divider" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}><span className="step-num">2</span> Order Summary</div>
          <div className="step-divider" />
          <div className="step"><span className="step-num">3</span> Payment</div>
        </div>

        <div className="checkout-body">
          <div className="checkout-left">
            {step === 1 && (
              <div className="checkout-card">
                <h2>Select Delivery Address</h2>
                {savedAddresses.length > 0 && (
                  <div className="saved-addresses">
                    {savedAddresses.map(addr => (
                      <div key={addr.id} className={`saved-addr-card ${selectedAddrId === addr.id ? 'selected' : ''}`} onClick={() => handleSelectAddr(addr.id)}>
                        <div className="addr-radio">{selectedAddrId === addr.id ? <FiCheck size={16} color="#2874f0" /> : <span className="radio-circle" />}</div>
                        <div className="addr-details">
                          <p className="addr-name">{addr.full_name}{addr.is_default ? <span className="default-badge">Default</span> : null}</p>
                          <p className="addr-line">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                          <p className="addr-line">{addr.city}, {addr.state} — {addr.pincode}</p>
                          <p className="addr-phone">📞 {addr.phone}</p>
                        </div>
                        <button className="addr-delete-btn" onClick={e => handleDeleteAddr(addr.id, e)}><FiTrash2 size={14} /></button>
                      </div>
                    ))}
                    <div className={`saved-addr-card add-new-card ${selectedAddrId === 'new' ? 'selected' : ''}`} onClick={handleAddNew}>
                      <FiPlus size={18} color="#2874f0" /><span>Add a new address</span>
                    </div>
                  </div>
                )}
                {showNewForm && (
                  <form onSubmit={handleAddressSubmit} className="address-form">
                    <div className="form-row">
                      <div className="form-group"><label>Full Name *</label><input name="full_name" value={newAddr.full_name} onChange={handleNewAddrChange} required placeholder="Enter full name" /></div>
                      <div className="form-group"><label>Phone Number *</label><input name="phone" value={newAddr.phone} onChange={handleNewAddrChange} required placeholder="10-digit mobile number" pattern="[0-9]{10}" /></div>
                    </div>
                    <div className="form-group"><label>Address Line 1 *</label><input name="address_line1" value={newAddr.address_line1} onChange={handleNewAddrChange} required placeholder="House No, Building, Street" /></div>
                    <div className="form-group"><label>Address Line 2</label><input name="address_line2" value={newAddr.address_line2} onChange={handleNewAddrChange} placeholder="Area, Colony (optional)" /></div>
                    <div className="form-row">
                      <div className="form-group"><label>City *</label><input name="city" value={newAddr.city} onChange={handleNewAddrChange} required placeholder="City" /></div>
                      <div className="form-group"><label>State *</label><select name="state" value={newAddr.state} onChange={handleNewAddrChange} required><option value="">Select State</option>{STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                      <div className="form-group"><label>Pincode *</label><input name="pincode" value={newAddr.pincode} onChange={handleNewAddrChange} required placeholder="6-digit pincode" pattern="[0-9]{6}" /></div>
                    </div>
                    <label className="save-addr-check"><input type="checkbox" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)} /> Save this address for future orders</label>
                    <button type="submit" className="continue-btn">Deliver Here</button>
                  </form>
                )}
                {!showNewForm && selectedAddrId !== 'new' && (
                  <button className="continue-btn" style={{ marginTop: 20 }} onClick={() => setStep(2)}>Deliver to this Address</button>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="checkout-card">
                <h2>Order Summary</h2>
                <div className="order-items">
                  {cart.map(item => (
                    <div key={item.id} className="order-item">
                      <img src={item.images?.[0] || PLACEHOLDER} alt={item.name} onError={e => e.target.src = PLACEHOLDER} />
                      <div className="order-item-info"><p className="order-item-name">{item.name}</p><p className="order-item-qty">Qty: {item.quantity}</p></div>
                      <span className="order-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="delivery-address-review">
                  <div className="review-addr-header"><FiMapPin size={14} color="#2874f0" /><h3>Delivering to</h3><button className="change-addr-btn" onClick={() => setStep(1)}>Change</button></div>
                  <p><strong>{activeAddr.full_name}</strong> | {activeAddr.phone}</p>
                  <p>{activeAddr.address_line1}{activeAddr.address_line2 ? `, ${activeAddr.address_line2}` : ''}</p>
                  <p>{activeAddr.city}, {activeAddr.state} — {activeAddr.pincode}</p>
                </div>

                {/* Payment Methods */}
                <div className="payment-method">
                  <h3>Payment Method</h3>
                  <div className="pg-method-list">
                    {PAYMENT_METHODS.map(({ val, icon, label, desc }) => (
                      <label key={val} className={`pg-method-card ${paymentMethod === val ? 'selected' : ''}`}>
                        <input type="radio" name="payment_method" value={val} checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} />
                        <span className="pg-method-icon">{icon}</span>
                        <span className="pg-method-info"><span className="pg-method-label">{label}</span><span className="pg-method-desc">{desc}</span></span>
                        {paymentMethod === val && <FiCheck size={16} color="#2874f0" />}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="checkout-actions">
                  <button className="back-btn" onClick={() => setStep(1)}>Back</button>
                  <button className="place-order-btn" onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? 'Placing Order...' : paymentMethod === 'COD' ? 'Place Order' : `Pay ₹${finalTotal.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price summary */}
          <div className="checkout-summary">
            <h3>Price Details</h3>
            <div className="summary-row"><span>Price ({cart.length} items)</span><span>₹{cart.reduce((s, i) => s + (i.original_price || i.price) * i.quantity, 0).toLocaleString()}</span></div>
            {savings > 0 && <div className="summary-row discount"><span>Discount</span><span>- ₹{savings.toLocaleString()}</span></div>}
            <div className="summary-row"><span>Delivery</span><span className="free">Free</span></div>
            <div className="coupon-section">
              <div className="coupon-input-row">
                <input type="text" placeholder="Enter coupon code" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCoupon(null); }} />
                <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>{couponLoading ? '...' : 'Apply'}</button>
              </div>
              {coupon && <div className="coupon-applied">✅ {coupon.message}<button className="remove-coupon" onClick={() => { setCoupon(null); setCouponCode(''); }}>✕</button></div>}
              <p className="coupon-hint">Try: SAVE10 · FLAT200 · WELCOME20</p>
            </div>
            {couponDiscount > 0 && <div className="summary-row discount"><span>Coupon ({coupon.code})</span><span>- ₹{couponDiscount.toLocaleString()}</span></div>}
            <div className="summary-total"><span>Total Amount</span><span>₹{finalTotal.toLocaleString()}</span></div>
            {(savings > 0 || couponDiscount > 0) && <p className="savings-msg">You save ₹{(savings + couponDiscount).toLocaleString()} on this order</p>}
          </div>
        </div>
      </div>

      {/* Payment Modals */}
      {showPaymentModal && paymentMethod === 'UPI' && <UPIModal amount={finalTotal} onSuccess={handlePaymentSuccess} onClose={() => setShowPaymentModal(false)} />}
      {showPaymentModal && paymentMethod === 'Card' && <CardModal amount={finalTotal} onSuccess={handlePaymentSuccess} onClose={() => setShowPaymentModal(false)} />}
      {showPaymentModal && paymentMethod === 'NetBanking' && <NetBankingModal amount={finalTotal} onSuccess={handlePaymentSuccess} onClose={() => setShowPaymentModal(false)} />}
    </div>
  );
}
