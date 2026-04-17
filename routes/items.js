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
  const { location_id, collection_id, item_category, item_size, item_description, item_version, item_condition, show_id } = req.body;
  try {
    await db.query(
      'INSERT INTO item (collection_id, location_id, item_category, item_size, item_description, item_version, item_condition) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [collection_id, location_id, item_category, item_size, item_description, item_version, item_condition]
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
  const { item_id, show_id } = req.body;
  try {
    await db.query('DELETE FROM item WHERE item_id = ?', [item_id]);
    req.flash('success', 'Item deleted.');
    res.redirect(`/item${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete item.');
    res.redirect('/itemdelete');
  }
});

module.exports = router;
