const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/coupons/validate
router.post('/validate', async (req, res) => {
  try {
    const { code, order_amount } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const result = await db.query(
      `SELECT * FROM coupons WHERE code = ? AND active = 1`,
      [code.toUpperCase().trim()]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: 'Invalid coupon code' });

    const coupon = result.rows[0];

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
      return res.status(400).json({ error: 'This coupon has expired' });

    if (coupon.used_count >= coupon.max_uses)
      return res.status(400).json({ error: 'This coupon has reached its usage limit' });

    if (order_amount < coupon.min_order_amount)
      return res.status(400).json({
        error: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon`
      });

    const discount = coupon.discount_type === 'percent'
      ? Math.round((order_amount * coupon.discount_value) / 100)
      : coupon.discount_value;

    res.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: Math.min(discount, order_amount),
      message: coupon.discount_type === 'percent'
        ? `${coupon.discount_value}% off applied!`
        : `₹${coupon.discount_value} off applied!`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
