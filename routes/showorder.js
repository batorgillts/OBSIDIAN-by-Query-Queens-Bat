const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/showorder', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  try {
    const query = show_id
      ? 'SELECT * FROM show_order WHERE show_id = ? ORDER BY sequence_number'
      : 'SELECT * FROM show_order ORDER BY show_id, sequence_number';
    const params = show_id ? [show_id] : [];
    const [orders] = await db.query(query, params);
    res.render('showorder', { orders, show_id });
  } catch (err) {
    console.error(err);
    res.render('showorder', { orders: [], show_id });
  }
});

router.get('/showorderadd', requireLogin, (req, res) =>
  res.render('showorderadd', { show_id: req.query.show_id })
);

router.post('/showorderadd', requireLogin, async (req, res) => {
  const { show_id, look_id, sequence_number } = req.body;
  try {
    await db.query(
      'INSERT INTO show_order (show_id, look_id, sequence_number) VALUES (?, ?, ?)',
      [show_id, look_id, sequence_number]
    );
    req.flash('success', 'Show order entry added.');
    res.redirect(`/showorder?show_id=${show_id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add. Sequence number may be duplicate.');
    res.redirect(`/showorderadd?show_id=${show_id}`);
  }
});

router.get('/showorderdelete', requireLogin, (req, res) =>
  res.render('showorderdelete', { show_id: req.query.show_id })
);

router.post('/showorderdelete', requireLogin, async (req, res) => {
  const { show_order_id, show_id, look_id } = req.body;
  try {
    await db.query(
      'DELETE FROM show_order WHERE show_order_id = ? AND show_id = ? AND look_id = ?',
      [show_order_id, show_id, look_id]
    );
    req.flash('success', 'Show order entry deleted.');
    res.redirect(`/showorder?show_id=${show_id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete show order entry.');
    res.redirect('/showorderdelete');
  }
});

module.exports = router;
