const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/look', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  try {
    const [looks] = await db.query('SELECT * FROM fashion_look ORDER BY look_id');
    res.render('look', { looks, show_id });
  } catch (err) {
    console.error(err);
    res.render('look', { looks: [], show_id });
  }
});

router.get('/lookadd', requireLogin, (req, res) =>
  res.render('lookadd', { show_id: req.query.show_id })
);

router.post('/lookadd', requireLogin, async (req, res) => {
  const { collection_id, model_id, item_name, category, description, show_id } = req.body;
  try {
    await db.query(
      'INSERT INTO fashion_look (collection_id, model_id, item_name, category, description) VALUES (?, ?, ?, ?, ?)',
      [collection_id, model_id, item_name, category, description]
    );
    req.flash('success', 'Look added.');
    res.redirect(`/look${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add look.');
    res.redirect('/lookadd');
  }
});

router.get('/lookdelete', requireLogin, (req, res) =>
  res.render('lookdelete', { show_id: req.query.show_id })
);

router.post('/lookdelete', requireLogin, async (req, res) => {
  const { look_id, collection_id, model_id, show_id } = req.body;
  try {
    await db.query(
      'DELETE FROM fashion_look WHERE look_id = ? AND collection_id = ? AND model_id = ?',
      [look_id, collection_id, model_id]
    );
    req.flash('success', 'Look deleted.');
    res.redirect(`/look${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete look.');
    res.redirect('/lookdelete');
  }
});

module.exports = router;
