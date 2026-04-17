const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, `show_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/myshows', requireLogin, async (req, res) => {
  try {
    const [shows] = await db.query(
      'SELECT * FROM show_event WHERE user_id = ? ORDER BY show_date DESC',
      [req.session.user.id]
    );
    res.render('myshows', { shows });
  } catch (err) {
    console.error(err);
    res.render('myshows', { shows: [] });
  }
});

router.get('/myshowsregistration', requireLogin, (req, res) => res.render('myshowsregistration'));

router.post('/myshowsregistration', requireLogin, upload.single('logo'), async (req, res) => {
  const { show_name, show_date, venue, show_address, start_time, end_time, collection_id } = req.body;
  const logo_path = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    await db.query(
      'INSERT INTO show_event (collection_id, user_id, show_name, show_date, venue, start_time, end_time, show_address, logo_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [collection_id || null, req.session.user.id, show_name, show_date, venue, start_time || null, end_time || null, show_address, logo_path]
    );
    req.flash('success', 'Show added successfully.');
    res.redirect('/myshows');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add show.');
    res.redirect('/myshowsregistration');
  }
});

router.get('/myshowsdelete', requireLogin, (req, res) => res.render('myshowsdelete'));

router.post('/myshowsdelete', requireLogin, async (req, res) => {
  const { show_name, show_date, venue } = req.body;
  try {
    await db.query(
      'DELETE FROM show_event WHERE show_name = ? AND show_date = ? AND venue = ? AND user_id = ?',
      [show_name, show_date, venue, req.session.user.id]
    );
    req.flash('success', 'Show deleted.');
    res.redirect('/myshows');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete show.');
    res.redirect('/myshowsdelete');
  }
});

router.get('/mymenu/:show_id', requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM show_event WHERE show_id = ?', [req.params.show_id]);
    if (!rows.length) return res.redirect('/myshows');
    res.render('mymenu', { show: rows[0] });
  } catch (err) {
    console.error(err);
    res.redirect('/myshows');
  }
});

router.get('/mymenudetail/:show_id', requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM show_event WHERE show_id = ?', [req.params.show_id]);
    if (!rows.length) return res.redirect('/myshows');
    res.render('mymenudetail', { show: rows[0] });
  } catch (err) {
    console.error(err);
    res.redirect('/myshows');
  }
});

module.exports = router;
