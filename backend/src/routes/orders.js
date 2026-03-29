const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendOrderConfirmationEmail } = require('../utils/mailer');

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
      [req.user.id]
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
      [req.params.orderId, req.user.id]
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

    const timeline = await db.query(
      `SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC`,
      [order.id]
    );

    res.json({ ...order, items: items.rows.map(parseImages), timeline: timeline.rows });
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

    const { address, items, payment_method = 'COD', coupon_code } = req.body;
    const userId = req.user.id;

    const addrResult = await client.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, address.full_name, address.phone, address.address_line1,
       address.address_line2 || '', address.city, address.state, address.pincode]
    );
    const addressId = addrResult.rows[0]?.id;

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount_amount = 0;

    if (coupon_code) {
      const coupon = (await client.query(
        `SELECT * FROM coupons WHERE code = ? AND active = 1`,
        [coupon_code.toUpperCase().trim()]
      )).rows[0];
      if (coupon && coupon.used_count < coupon.max_uses) {
        discount_amount = coupon.discount_type === 'percent'
          ? Math.round((subtotal * coupon.discount_value) / 100)
          : coupon.discount_value;
        await client.query(
          'UPDATE coupons SET used_count = used_count + 1 WHERE code = ?',
          [coupon_code.toUpperCase().trim()]
        );
      }
    }

    const total = Math.max(0, subtotal - discount_amount);
    const orderId = 'OD' + Date.now() + Math.floor(Math.random() * 1000);

    const orderResult = await client.query(
      `INSERT INTO orders (order_id, user_id, address_id, total_amount, payment_method)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, userId, addressId, total, payment_method]
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

    await client.query(
      `INSERT INTO order_timeline (order_id, status, note) VALUES (?, ?, ?)`,
      [orderRowId, 'placed', 'Order placed successfully']
    );

    await client.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    await client.query('COMMIT');

    // Send order confirmation email (non-blocking — don't fail order if email fails)
    try {
      const user = (await db.query('SELECT name, email FROM users WHERE id = ?', [userId])).rows[0];
      if (user?.email) {
        const orderItems = (await db.query(
          `SELECT oi.quantity, oi.price, p.name, p.brand
           FROM order_items oi JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`, [orderRowId]
        )).rows;
        sendOrderConfirmationEmail({
          to: user.email,
          name: user.name,
          orderId,
          items: orderItems,
          total,
          address,
          paymentMethod: payment_method,
        }).catch(e => console.error('Email error:', e.message));
      }
    } catch (e) {
      console.error('Email setup error:', e.message);
    }

    res.json({ order_id: orderId, message: 'Order placed successfully', discount_amount });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    client.release();
  }
});

// GET /api/orders/track/:orderId — public tracking (no auth needed)
router.get('/track/:orderId', async (req, res) => {
  try {
    const orderResult = await db.query(
      `SELECT o.order_id, o.status, o.total_amount, o.payment_method, o.created_at,
              a.full_name, a.city, a.state, a.pincode
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.order_id = ?`,
      [req.params.orderId]
    );
    if (!orderResult.rows.length) return res.status(404).json({ error: 'Order not found' });

    const order = orderResult.rows[0];
    const items = await db.query(
      `SELECT oi.quantity, oi.price, p.name, p.images, p.brand
       FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = (SELECT id FROM orders WHERE order_id = ?)`,
      [req.params.orderId]
    );
    const timeline = await db.query(
      `SELECT status, note, created_at FROM order_timeline
       WHERE order_id = (SELECT id FROM orders WHERE order_id = ?)
       ORDER BY created_at ASC`,
      [req.params.orderId]
    );

    res.json({ ...order, items: items.rows.map(parseImages), timeline: timeline.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/admin/all — admin: all orders
router.get('/admin/all', async (req, res) => {
  try {
    const orders = await db.query(
      `SELECT o.*, a.full_name, a.city, a.state, u.name as user_name, u.email as user_email
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    const result = await Promise.all(orders.rows.map(async order => {
      const items = await db.query(
        `SELECT oi.*, p.name, p.images FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
        [order.id]
      );
      return { ...order, items: items.rows.map(parseImages) };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/orders/admin/:orderId/status — admin: update order status
router.put('/admin/:orderId/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const VALID = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!VALID.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const order = (await db.query('SELECT * FROM orders WHERE order_id = ?', [req.params.orderId])).rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, req.params.orderId]);
    await db.query(
      'INSERT INTO order_timeline (order_id, status, note) VALUES (?, ?, ?)',
      [order.id, status, note || `Status updated to ${status}`]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.put('/:orderId/cancel', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
      [req.params.orderId, req.user.id]
    );
    if (!orderResult.rows.length)
      return res.status(404).json({ error: 'Order not found' });

    const order = orderResult.rows[0];
    if (order.status === 'cancelled')
      return res.status(400).json({ error: 'Order is already cancelled' });
    if (['shipped', 'delivered'].includes(order.status))
      return res.status(400).json({ error: `Cannot cancel an order that is already ${order.status}` });

    const items = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [order.id]
    );
    for (const item of items.rows) {
      await client.query(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await client.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [order.id]);
    await client.query(
      `INSERT INTO order_timeline (order_id, status, note) VALUES (?, ?, ?)`,
      [order.id, 'cancelled', 'Order cancelled by customer']
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel order' });
  } finally {
    client.release();
  }
});

module.exports = router;
