const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'flipkart_secret_key';

// ── Email transporter (uses Gmail or logs to console as fallback) ──────────
const transporter = process.env.SMTP_USER
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp) {
  if (transporter) {
    await transporter.sendMail({
      from: `"Flipkart Clone" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Flipkart Clone OTP',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
          <h2 style="color:#2874f0">Your OTP Code</h2>
          <p style="font-size:14px;color:#555">Use the code below to verify your identity. It expires in <strong>5 minutes</strong>.</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#212121;text-align:center;padding:20px 0">${otp}</div>
          <p style="font-size:12px;color:#aaa">If you didn't request this, ignore this email.</p>
        </div>`,
    });
  } else {
    // Dev fallback — print to console
    console.log(`\n📧 OTP for ${email}: ${otp}\n`);
  }
}

// ── POST /api/auth/send-otp ────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Invalidate old OTPs for this email
    await db.query('DELETE FROM otps WHERE email = ?', [email]);

    // Store new OTP
    await db.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent successfully', dev: !transporter ? `DEV MODE — check server console` : undefined });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, name, phone } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const result = await db.query(
      'SELECT * FROM otps WHERE email = ? AND used = 0 ORDER BY id DESC LIMIT 1',
      [email]
    );

    if (!result.rows.length)
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });

    const record = result.rows[0];

    if (Date.now() > record.expires_at)
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });

    if (record.otp !== otp.toString())
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });

    // Mark OTP as used
    await db.query('UPDATE otps SET used = 1 WHERE id = ?', [record.id]);

    // Find or create user
    let userRow = (await db.query('SELECT * FROM users WHERE email = ?', [email])).rows[0];
    if (!userRow) {
      const inserted = await db.query(
        'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
        [name || email.split('@')[0], email, phone || '']
      );
      userRow = inserted.rows[0];
    }

    const token = jwt.sign({ id: userRow.id, email: userRow.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: userRow.id, name: userRow.name, email: userRow.email, phone: userRow.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/auth/signup ─────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.rows.length)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
      [name, email, hash, phone || '']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name, email, phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!result.rows.length)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = result.rows[0];
    if (!user.password_hash)
      return res.status(401).json({ error: 'This account uses OTP login. Please use OTP.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
