const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/addresses
router.get('/', async (req, res) => {
  try {
    // Show addresses for current user; if logged in also include guest (id=1) addresses
    // so addresses saved before auth was enforced still appear
    const ids = req.user.id === 1 ? [1] : [req.user.id, 1];
    const placeholders = ids.map(() => '?').join(',');
    const result = await db.query(
      `SELECT * FROM addresses WHERE user_id IN (${placeholders}) ORDER BY is_default DESC, id DESC`,
      ids
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /addresses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/addresses
router.post('/', async (req, res) => {
  try {
    const { full_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;

    if (is_default) {
      await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const result = await db.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, full_name, phone, address_line1, address_line2 || '', city, state, pincode, is_default ? 1 : 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('POST /addresses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/addresses/:id/default
router.put('/:id/default', async (req, res) => {
  try {
    await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    await db.query('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [parseInt(req.params.id), req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /addresses/:id/default error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/addresses/:id
router.delete('/:id', async (req, res) => {
  const addrId = parseInt(req.params.id);

  try {
    // Nullify any orders referencing this address (bypass FK constraint)
    await db.query('UPDATE orders SET address_id = NULL WHERE address_id = ?', [addrId]);

    // Delete the address — check it exists but don't enforce user_id
    // (addresses may have been created under guest user before auth was added)
    const result = await db.query('DELETE FROM addresses WHERE id = ?', [addrId]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Address not found' });

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /addresses/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
