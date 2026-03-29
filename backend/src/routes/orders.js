const express = require('express');
const router = express.Router();
const db = require('../db');

const DEFAULT_USER_ID = 1;

function parseImages(item) {
  try { item.images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images || []; } catch { item.images = []; }
  return item;
}

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await db.query(
      `SELECT o.*, a.full_name, a.city, a.state, a.pincode
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [DEFAULT_USER_ID]
    );

    const result = await Promise.all(
      orders.rows.map(async (order) => {
        const items = await db.query(
          `SELECT oi.*, p.name, p.images, p.brand
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        return { ...order, items: items.rows.map(parseImages) };
      })
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/:orderId
router.get('/:orderId', async (req, res) => {
  try {
    const orderResult = await db.query(
      `SELECT o.*, a.full_name, a.phone, a.address_line1, a.address_line2, a.city, a.state, a.pincode
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.order_id = ? AND o.user_id = ?`,
      [req.params.orderId, DEFAULT_USER_ID]
    );
    if (!orderResult.rows.length) return res.status(404).json({ error: 'Order not found' });

    const order = orderResult.rows[0];
    const items = await db.query(
      `SELECT oi.*, p.name, p.images, p.brand
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    res.json({ ...order, items: items.rows.map(parseImages) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { address, items, payment_method = 'COD' } = req.body;

    // Save address
    const addrResult = await client.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [DEFAULT_USER_ID, address.full_name, address.phone, address.address_line1,
       address.address_line2 || '', address.city, address.state, address.pincode]
    );
    const addressId = addrResult.rows[0]?.id;

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = 'OD' + Date.now() + Math.floor(Math.random() * 1000);

    const orderResult = await client.query(
      `INSERT INTO orders (order_id, user_id, address_id, total_amount, payment_method)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, DEFAULT_USER_ID, addressId, total, payment_method]
    );
    const orderRowId = orderResult.rows[0]?.id;

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderRowId, item.product_id, item.quantity, item.price]
      );
      await client.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart WHERE user_id = ?', [DEFAULT_USER_ID]);
    await client.query('COMMIT');

    res.json({ order_id: orderId, message: 'Order placed successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    client.release();
  }
});

module.exports = router;
