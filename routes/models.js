const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/model', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  try {
    const [models] = show_id
      ? await db.query(
          `SELECT DISTINCT m.* FROM model m
           JOIN fashion_look l ON l.model_id = m.model_id
           JOIN show_event se ON se.collection_id = l.collection_id
           WHERE se.show_id = ? ORDER BY m.model_id`, [show_id])
      : req.session.user.role === 'developer'
        ? await db.query(`SELECT * FROM model ORDER BY model_id`)
        : [[]];
    res.render('model', { models, show_id });
  } catch (err) {
    console.error(err);
    res.render('model', { models: [], show_id });
  }
});

router.get('/modeladd', requireLogin, (req, res) =>
  res.render('modeladd', { show_id: req.query.show_id })
);

router.post('/modeladd', requireLogin, async (req, res) => {
  const { first_name, last_name, agency, email, phone_number, show_id } = req.body;
  try {
    await db.query(
      'INSERT INTO model (first_name, last_name, agency, email, phone_number) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, agency, email, phone_number]
    );
    req.flash('success', 'Model added.');
    res.redirect(`/model${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add model.');
    res.redirect('/modeladd');
  }
});

router.get('/modeldelete', requireLogin, (req, res) =>
  res.render('modeldelete', { show_id: req.query.show_id })
);

router.post('/modeldelete', requireLogin, async (req, res) => {
  const { model_id, show_id } = req.body;
  try {
    await db.query('DELETE FROM model WHERE model_id = ?', [model_id]);
    req.flash('success', 'Model deleted.');
    res.redirect(`/model${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete model.');
    res.redirect('/modeldelete');
  }
});

module.exports = router;
