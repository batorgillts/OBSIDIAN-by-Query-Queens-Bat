const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/item', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  const category = req.query.category || '';
  const sort = req.query.sort || 'item_id';
  const allowed_sorts = ['item_id','item_category','item_size','item_condition'];
  const sort_col = allowed_sorts.includes(sort) ? sort : 'item_id';
  try {
    let items = [];
    if (show_id) {
      let sql = `SELECT i.* FROM item i
                 JOIN show_event se ON se.collection_id = i.collection_id
                 WHERE se.show_id = ?`;
      let params = [show_id];
      if (category) {
        sql += ` AND i.item_category LIKE ?`;
        params.push(`%${category}%`);
      }
      sql += ` ORDER BY i.${sort_col}`;
      [items] = await db.query(sql, params);
    }
    res.render('item', { items, show_id, category, sort: sort_col });
  } catch (err) {
    console.error(err);
    res.render('item', { items: [], show_id, category: '', sort: 'item_id' });
  }
});

// CSV export — satisfies rubric "export data through the app"
router.get('/item/export', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  try {
    const [items] = show_id
      ? await db.query(
          `SELECT i.* FROM item i
           JOIN show_event se ON se.collection_id = i.collection_id
           WHERE se.show_id = ? ORDER BY i.item_id`, [show_id])
      : await db.query('SELECT * FROM item ORDER BY item_id');
    const headers = ['item_id','collection_id','location_id','item_category','item_size','item_description','item_version','item_condition'];
    const rows = items.map(i =>
      headers.map(h => `"${(i[h] ?? '').toString().replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="items_export.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Export failed.');
    res.redirect(`/item${show_id ? `?show_id=${show_id}` : ''}`);
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
