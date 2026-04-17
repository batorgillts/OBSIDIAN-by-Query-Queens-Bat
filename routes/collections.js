const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/collection', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  try {
    const [collections] = await db.query('SELECT * FROM fit_collection ORDER BY collection_id');
    res.render('collection', { collections, show_id });
  } catch (err) {
    console.error(err);
    res.render('collection', { collections: [], show_id });
  }
});

router.get('/collectionadd', requireLogin, (req, res) =>
  res.render('collectionadd', { show_id: req.query.show_id })
);

router.post('/collectionadd', requireLogin, async (req, res) => {
  const { collection_name, brand, season, collection_year, collection_status, show_id } = req.body;
  try {
    await db.query(
      'INSERT INTO fit_collection (collection_name, brand, season, collection_year, collection_status) VALUES (?, ?, ?, ?, ?)',
      [collection_name, brand, season, collection_year, collection_status]
    );
    req.flash('success', 'Collection added.');
    res.redirect(`/collection${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add collection.');
    res.redirect('/collectionadd');
  }
});

router.get('/collectiondelete', requireLogin, (req, res) =>
  res.render('collectiondelete', { show_id: req.query.show_id })
);

router.post('/collectiondelete', requireLogin, async (req, res) => {
  const { collection_id, show_id } = req.body;
  try {
    await db.query('DELETE FROM fit_collection WHERE collection_id = ?', [collection_id]);
    req.flash('success', 'Collection deleted.');
    res.redirect(`/collection${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete. Collection may have dependent records.');
    res.redirect('/collectiondelete');
  }
});

router.get('/collectionstatus', requireLogin, (req, res) =>
  res.render('collectionstatus', { show_id: req.query.show_id })
);

router.post('/collectionstatus', requireLogin, async (req, res) => {
  const { collection_id, new_status, show_id } = req.body;
  try {
    await db.query(
      'UPDATE fit_collection SET collection_status = ? WHERE collection_id = ?',
      [new_status, collection_id]
    );
    req.flash('success', 'Status updated.');
    res.redirect(`/collection${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update status.');
    res.redirect('/collectionstatus');
  }
});

module.exports = router;
