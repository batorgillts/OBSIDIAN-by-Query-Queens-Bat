const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/fitting', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  try {
    const [fittings] = show_id
      ? await db.query(
          `SELECT f.* FROM fitting f
           JOIN fashion_look l ON l.look_id = f.look_id
           JOIN show_event se ON se.collection_id = l.collection_id
           WHERE se.show_id = ? ORDER BY f.fitting_id`, [show_id])
      : req.session.user.role === 'developer'
        ? await db.query(`SELECT * FROM fitting ORDER BY fitting_id`)
        : [[]];
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
  const { look_id, fitting_date, fitting_status, show_id } = req.body;
  try {
    await db.query(
      'INSERT INTO fitting (look_id, fitting_date, fitting_status) VALUES (?, ?, ?)',
      [look_id, fitting_date, fitting_status]
    );
    req.flash('success', 'Fitting added.');
    res.redirect(`/fitting${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add fitting. Check that Look ID exists.');
    res.redirect('/fittingadd');
  }
});

router.get('/fittingdelete', requireLogin, (req, res) =>
  res.render('fittingdelete', { show_id: req.query.show_id })
);

router.post('/fittingdelete', requireLogin, async (req, res) => {
  const { fitting_id, show_id } = req.body;
  try {
    await db.query('DELETE FROM fitting WHERE fitting_id = ?', [fitting_id]);
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
  const { fitting_id, new_status, show_id } = req.body;
  try {
    await db.query(
      'UPDATE fitting SET fitting_status = ? WHERE fitting_id = ?',
      [new_status, fitting_id]
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
