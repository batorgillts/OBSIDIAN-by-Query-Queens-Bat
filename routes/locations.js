const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/location', requireLogin, async (req, res) => {
  const show_id = req.query.show_id;
  try {
    const [locations] = await db.query('SELECT * FROM fit_location ORDER BY location_id');
    res.render('location', { locations, show_id });
  } catch (err) {
    console.error(err);
    res.render('location', { locations: [], show_id });
  }
});

router.get('/locationadd', requireLogin, (req, res) =>
  res.render('locationadd', { show_id: req.query.show_id })
);

router.post('/locationadd', requireLogin, async (req, res) => {
  const { location_name, location_address, show_id } = req.body;
  try {
    await db.query(
      'INSERT INTO fit_location (location_name, location_address) VALUES (?, ?)',
      [location_name, location_address]
    );
    req.flash('success', 'Location added.');
    res.redirect(`/location${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add location.');
    res.redirect('/locationadd');
  }
});

router.get('/locationdelete', requireLogin, (req, res) =>
  res.render('locationdelete', { show_id: req.query.show_id })
);

router.post('/locationdelete', requireLogin, async (req, res) => {
  const { location_id, show_id } = req.body;
  try {
    await db.query('DELETE FROM fit_location WHERE location_id = ?', [location_id]);
    req.flash('success', 'Location deleted.');
    res.redirect(`/location${show_id ? `?show_id=${show_id}` : ''}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete location.');
    res.redirect('/locationdelete');
  }
});

module.exports = router;
