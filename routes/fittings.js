const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/fitting', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  try {
    const [fittings] = await db.query('SELECT * FROM fitting ORDER BY fitting_id');
    res.render('fitting', { fittings, show_id });
  } catch (err) {
    console.error(err);
    res.render('fitting', { fittings: [], show_id });
  }
});

router.get('/fittingadd', requireLogin, (req, res) =>
  res.render('fittingadd', { show_id: req.query.show_id })
);

router.post('/fittingadd', requireLogin, async (req, res) => {
  const { look_id, model_id, fitting_date, status, show_id } = req.body;
  try {
    await db.query(
      'INSERT INTO fitting (look_id, model_id, fitting_date, status) VALUES (?, ?, ?, ?)',
      [look_id, model_id, fitting_date, status]
    );
    req.flash('success', 'Fitting added.');
    res.redirect(`/fitting${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add fitting. Check that Look ID and Model ID exist.');
    res.redirect('/fittingadd');
  }
});

router.get('/fittingdelete', requireLogin, (req, res) =>
  res.render('fittingdelete', { show_id: req.query.show_id })
);

router.post('/fittingdelete', requireLogin, async (req, res) => {
  const { fitting_id, look_id, model_id, show_id } = req.body;
  try {
    await db.query(
      'DELETE FROM fitting WHERE fitting_id = ? AND look_id = ? AND model_id = ?',
      [fitting_id, look_id, model_id]
    );
    req.flash('success', 'Fitting deleted.');
    res.redirect(`/fitting${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete fitting.');
    res.redirect('/fittingdelete');
  }
});

router.get('/fittingstatus', requireLogin, (req, res) =>
  res.render('fittingstatus', { show_id: req.query.show_id })
);

router.post('/fittingstatus', requireLogin, async (req, res) => {
  const { fitting_id, look_id, model_id, new_status, show_id } = req.body;
  try {
    await db.query(
      'UPDATE fitting SET status = ? WHERE fitting_id = ? AND look_id = ? AND model_id = ?',
      [new_status, fitting_id, look_id, model_id]
    );
    req.flash('success', 'Fitting status updated.');
    res.redirect(`/fitting${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update fitting status.');
    res.redirect('/fittingstatus');
  }
});

module.exports = router;
