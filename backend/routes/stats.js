const express = require('express');
const { dbGet } = require('../db/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const artists = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'artist'");
    const artworks = await dbGet('SELECT COUNT(*) as count FROM artworks');
    const available = await dbGet('SELECT COUNT(*) as count FROM artworks WHERE available = 1');
    const totalValue = await dbGet('SELECT SUM(price) as total FROM artworks WHERE available = 1');
    res.json({
      artists: artists.count,
      artworks: artworks.count,
      available: available.count,
      totalValue: Math.round(totalValue.total || 0),
      collectors: 3247,
      countries: 28,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
