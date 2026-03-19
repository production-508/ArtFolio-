const express = require('express');
const userService = require('../services/userService');
const artworkService = require('../services/artworkService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth requise' });
  try { req.user = jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalide' }); }
}

// GET /api/artist/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Artiste introuvable' });
    const artworks = await artworkService.getArtworksByArtist(req.user.id);
    const { password_hash, ...safeUser } = user;
    res.json({ artist: safeUser, artworks });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/artist/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body);
    const { password_hash, ...safeUser } = user;
    res.json({ artist: safeUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// GET /api/artist/artworks
router.get('/artworks', requireAuth, async (req, res) => {
  try {
    const artworks = await artworkService.getArtworksByArtist(req.user.id);
    res.json({ artworks, total: artworks.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/artist/artworks
router.post('/artworks', requireAuth, async (req, res) => {
  const { title, medium, style, price } = req.body;
  if (!title || !medium || !style || !price) return res.status(400).json({ error: 'Champs requis manquants' });
  try {
    const artwork = await artworkService.createArtwork(req.user.id, req.body);
    res.status(201).json({ artwork });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/artist/stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = await artworkService.getArtistStats(req.user.id);
    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/artist/artworks/:id
router.put('/artworks/:id', requireAuth, async (req, res) => {
  try {
    const existing = await artworkService.getArtworkByIdAndArtist(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Œuvre introuvable ou accès refusé' });
    const artwork = await artworkService.updateArtwork(req.params.id, req.user.id, req.body);
    res.json({ artwork });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/artist/artworks/:id
router.delete('/artworks/:id', requireAuth, async (req, res) => {
  try {
    const existing = await artworkService.getArtworkByIdAndArtist(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Œuvre introuvable ou accès refusé' });
    await artworkService.deleteArtwork(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/artist/ai/openclawd
router.post('/ai/openclawd', requireAuth, async (req, res) => {
  req.url = '/generate-profile';
  require('./ai')(req, res);
});

module.exports = router;
