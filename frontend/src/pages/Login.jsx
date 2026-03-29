import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import './Login.css';

// ── OTP Input: 6 individual boxes ─────────────────────────────────────────
function OTPInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !e.target.value && i > 0) {
      inputs.current[i - 1].focus();
    }
  };

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = val;
    const next = arr.join('');
    onChange(next);
    if (val && i < 5) inputs.current[i + 1].focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    if (pasted.length >= 6) inputs.current[5].focus();
    e.preventDefault();
  };

  return (
    <div className="otp-boxes">
      {Array(6).fill(0).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="otp-box"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ── Main Login Component ───────────────────────────────────────────────────
export default function Login() {
  const [tab, setTab] = useState('otp');        // 'otp' | 'password'
  const [step, setStep] = useState('email');    // 'email' | 'otp' (for OTP tab)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const { login, signup, loginWithOTP } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Send OTP ──────────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!form.email) return toast.error('Enter your email');
    setSending(true);
    try {
      const { data } = await api.post('/auth/send-otp', { email: form.email });
      if (data.dev) toast.info('DEV MODE: Check server console for OTP', { autoClose: 6000 });
      else toast.success('OTP sent to your email');
      setStep('otp');
      setResendTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);
    try {
      await loginWithOTP(form.email, otp, form.name, form.phone);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Password login / signup ───────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isNewUser) {
        await signup(form.name, form.email, form.password, form.phone);
        toast.success('Account created!');
      } else {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setSending(true);
    try {
      const { data } = await api.post('/auth/send-otp', { email: form.email });
      if (data.dev) toast.info('DEV MODE: Check server console for OTP', { autoClose: 6000 });
      else toast.success('OTP resent');
      setOtp('');
      setResendTimer(30);
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left panel */}
        <div className="login-left">
          <div className="login-logo">
            <div className="login-logo-icon">Z</div>
            <span className="login-logo-name">ShopZen</span>
          </div>
          <h1>Welcome back!</h1>
          <p>Sign in to access your orders, wishlist and personalised recommendations.</p>
        </div>

        {/* Right panel */}
        <div className="login-right">

          {/* Tabs */}
          <div className="login-tabs">
            <button className={tab === 'otp' ? 'active' : ''} onClick={() => { setTab('otp'); setStep('email'); setOtp(''); }}>
              OTP Login
            </button>
            <button className={tab === 'password' ? 'active' : ''} onClick={() => setTab('password')}>
              Password
            </button>
          </div>

          {/* ── OTP Flow ── */}
          {tab === 'otp' && (
            <>
              {step === 'email' && (
                <form onSubmit={handleSendOTP} className="login-form">
                  <p className="form-subtitle">We'll send a 6-digit OTP to your email</p>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required autoFocus />
                  </div>
                  <button type="submit" className="login-btn" disabled={sending}>
                    {sending ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="login-form">
                  <div className="otp-header">
                    <p className="form-subtitle">Enter the OTP sent to</p>
                    <p className="otp-email">
                      {form.email}
                      <button type="button" className="change-email" onClick={() => { setStep('email'); setOtp(''); }}>
                        Change
                      </button>
                    </p>
                  </div>

                  <OTPInput value={otp} onChange={setOtp} />

                  {/* New user — ask for name */}
                  <div className="new-user-toggle">
                    <label>
                      <input type="checkbox" checked={isNewUser} onChange={e => setIsNewUser(e.target.checked)} />
                      &nbsp;I'm a new user
                    </label>
                  </div>

                  {isNewUser && (
                    <>
                      <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" type="text" placeholder="Enter your name" value={form.name} onChange={handleChange} required={isNewUser} />
                      </div>
                      <div className="form-group">
                        <label>Phone (optional)</label>
                        <input name="phone" type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} />
                      </div>
                    </>
                  )}

                  <button type="submit" className="login-btn" disabled={loading || otp.length < 6}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>

                  <div className="resend-row">
                    <span>Didn't receive OTP?</span>
                    <button type="button" className={`resend-btn ${resendTimer > 0 ? 'disabled' : ''}`} onClick={handleResend} disabled={resendTimer > 0 || sending}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── Password Flow ── */}
          {tab === 'password' && (
            <>
              <div className="pw-toggle">
                <button className={!isNewUser ? 'active' : ''} onClick={() => setIsNewUser(false)}>Login</button>
                <button className={isNewUser ? 'active' : ''} onClick={() => setIsNewUser(true)}>Sign Up</button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="login-form">
                {isNewUser && (
                  <>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input name="name" type="text" placeholder="Enter your name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Phone (optional)</label>
                      <input name="phone" type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label>Email Address</label>
                  <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                </div>
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Please wait...' : isNewUser ? 'Create Account' : 'Login'}
                </button>
              </form>
            </>
          )}

          <div className="login-divider"><span>OR</span></div>
          <button className="guest-btn" onClick={() => navigate('/')}>Continue as Guest</button>
        </div>
      </div>
    </div>
  );
}
