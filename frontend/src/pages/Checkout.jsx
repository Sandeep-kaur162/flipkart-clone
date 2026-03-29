import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import './Checkout.css';

const PLACEHOLDER = 'https://via.placeholder.com/60x60?text=No+Image';

export default function Checkout() {
  const { cart, cartTotal } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: address, 2: review
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', pincode: '', payment_method: 'COD',
  });

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const items = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));
      const { data } = await api.post('/orders', {
        address,
        items,
        payment_method: address.payment_method,
      });
      navigate(`/order-confirmation/${data.order_id}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Steps */}
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-num">1</span> Delivery Address
          </div>
          <div className="step-divider" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span> Order Summary
          </div>
          <div className="step-divider" />
          <div className="step">
            <span className="step-num">3</span> Payment
          </div>
        </div>

        <div className="checkout-body">
          {/* Left */}
          <div className="checkout-left">
            {step === 1 && (
              <div className="checkout-card">
                <h2>Delivery Address</h2>
                <form onSubmit={handleAddressSubmit} className="address-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input name="full_name" value={address.full_name} onChange={handleChange} required placeholder="Enter full name" />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input name="phone" value={address.phone} onChange={handleChange} required placeholder="10-digit mobile number" pattern="[0-9]{10}" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address Line 1 *</label>
                    <input name="address_line1" value={address.address_line1} onChange={handleChange} required placeholder="House No, Building, Street" />
                  </div>
                  <div className="form-group">
                    <label>Address Line 2</label>
                    <input name="address_line2" value={address.address_line2} onChange={handleChange} placeholder="Area, Colony (optional)" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input name="city" value={address.city} onChange={handleChange} required placeholder="City" />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <select name="state" value={address.state} onChange={handleChange} required>
                        <option value="">Select State</option>
                        {['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh',
                          'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
                          'Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
                          'Tripura','Uttar Pradesh','Uttarakhand','West Bengal'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pincode *</label>
                      <input name="pincode" value={address.pincode} onChange={handleChange} required placeholder="6-digit pincode" pattern="[0-9]{6}" />
                    </div>
                  </div>
                  <button type="submit" className="continue-btn">Continue</button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-card">
                <h2>Order Summary</h2>
                <div className="order-items">
                  {cart.map((item) => (
                    <div key={item.id} className="order-item">
                      <img src={item.images?.[0] || PLACEHOLDER} alt={item.name} onError={(e) => { e.target.src = PLACEHOLDER; }} />
                      <div className="order-item-info">
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <span className="order-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="delivery-address-review">
                  <h3>Delivering to:</h3>
                  <p><strong>{address.full_name}</strong> | {address.phone}</p>
                  <p>{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}</p>
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                </div>

                <div className="payment-method">
                  <h3>Payment Method</h3>
                  <label className="radio-label">
                    <input type="radio" name="payment_method" value="COD" checked={address.payment_method === 'COD'} onChange={handleChange} />
                    Cash on Delivery
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="payment_method" value="UPI" checked={address.payment_method === 'UPI'} onChange={handleChange} />
                    UPI
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="payment_method" value="Card" checked={address.payment_method === 'Card'} onChange={handleChange} />
                    Credit / Debit Card
                  </label>
                </div>

                <div className="checkout-actions">
                  <button className="back-btn" onClick={() => setStep(1)}>Back</button>
                  <button className="place-order-btn" onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Price Summary */}
          <div className="checkout-summary">
            <h3>Price Details</h3>
            <div className="summary-row">
              <span>Price ({cart.length} items)</span>
              <span>₹{cart.reduce((s, i) => s + (i.original_price || i.price) * i.quantity, 0).toLocaleString()}</span>
            </div>
            <div className="summary-row discount">
              <span>Discount</span>
              <span>- ₹{cart.reduce((s, i) => s + ((i.original_price || i.price) - i.price) * i.quantity, 0).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span className="free">Free</span>
            </div>
            <div className="summary-total">
              <span>Total Amount</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
