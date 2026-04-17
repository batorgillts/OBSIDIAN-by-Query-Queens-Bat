const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/item', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  try {
    const [items] = await db.query('SELECT * FROM item ORDER BY item_id');
    res.render('item', { items, show_id });
  } catch (err) {
    console.error(err);
    res.render('item', { items: [], show_id });
  }
});

router.get('/itemadd', requireLogin, (req, res) =>
  res.render('itemadd', { show_id: req.query.show_id })
);

router.post('/itemadd', requireLogin, async (req, res) => {
  const { location_id, collection_id, category, description, item_version, size, condition, show_id } = req.body;
  try {
    await db.query(
      'INSERT INTO item (location_id, collection_id, category, description, item_version, size, item_condition) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [location_id, collection_id, category, description, item_version, size, condition]
    );
    req.flash('success', 'Item added.');
    res.redirect(`/item${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add item.');
    res.redirect('/itemadd');
  }
});

router.get('/itemdelete', requireLogin, (req, res) =>
  res.render('itemdelete', { show_id: req.query.show_id })
);

router.post('/itemdelete', requireLogin, async (req, res) => {
  const { item_id, location_id, collection_id, show_id } = req.body;
  try {
    await db.query(
      'DELETE FROM item WHERE item_id = ? AND location_id = ? AND collection_id = ?',
      [item_id, location_id, collection_id]
    );
    req.flash('success', 'Item deleted.');
    res.redirect(`/item${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete item.');
    res.redirect('/itemdelete');
  }
});

module.exports = router;
