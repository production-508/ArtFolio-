const express = require('express');
const { dbGet, dbAll } = require('../db/database');
const router = express.Router();

// GET /api/artists
router.get('/', async (req, res) => {
  try {
    const artists = await dbAll(`
      SELECT u.id, u.name, u.bio, u.avatar_url, u.location, u.website, u.instagram,
             u.plan, u.ai_bio, u.ai_statement, u.ai_style_tags,
             COUNT(a.id) as artwork_count
      FROM users u LEFT JOIN artworks a ON a.artist_id = u.id
      WHERE u.role = 'artist' GROUP BY u.id ORDER BY u.name`);
      
    // Pour chaque artiste, récupérer ses 3 dernières œuvres (miniatures)
    const result = await Promise.all(artists.map(async (a) => {
      const preview_artworks = await dbAll(`
        SELECT id, title, image_url 
        FROM artworks 
        WHERE artist_id = ? 
        ORDER BY created_at DESC LIMIT 3`, [a.id]);

      return {
        ...a,
        ai_style_tags: a.ai_style_tags ? (() => { try { return JSON.parse(a.ai_style_tags); } catch { return []; } })() : [],
        preview_artworks
      };
    }));
    
    res.json({ artists: result, total: result.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/artists/featured
router.get('/featured', async (req, res) => {
  try {
    const artists = await dbAll(`
      SELECT u.id, u.name, u.bio, u.avatar_url, u.location, u.plan,
             COUNT(a.id) as artwork_count
      FROM users u LEFT JOIN artworks a ON a.artist_id = u.id
      WHERE u.role = 'artist' GROUP BY u.id ORDER BY artwork_count DESC LIMIT 6`);
    res.json({ artists, total: artists.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/artists/:id
router.get('/:id', async (req, res) => {
  try {
    const artist = await dbGet(`
      SELECT u.*, COUNT(a.id) as artwork_count FROM users u
      LEFT JOIN artworks a ON a.artist_id = u.id
      WHERE u.id = ? AND u.role = 'artist' GROUP BY u.id`, [req.params.id]);
    if (!artist) return res.status(404).json({ error: 'Artiste introuvable' });
    const artworks = await dbAll('SELECT * FROM artworks WHERE artist_id = ? ORDER BY created_at DESC', [req.params.id]);
    const { password_hash, ...safeArtist } = artist;
    if (safeArtist.ai_style_tags) { try { safeArtist.ai_style_tags = JSON.parse(safeArtist.ai_style_tags); } catch { safeArtist.ai_style_tags = []; } }
    res.json({ artist: safeArtist, artworks });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
