const express = require('express');
const { dbGet, dbAll } = require('../db/database');
const router = express.Router();

// GET /api/gallery — liste avec filtres
router.get('/', async (req, res) => {
  const { medium, style, available, maxPrice, price_max, search } = req.query;
  let sql = `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
    FROM artworks a JOIN users u ON u.id = a.artist_id WHERE 1=1`;
  const params = [];
  if (medium)   { sql += ' AND a.medium = ?';   params.push(medium); }
  if (style)    { sql += ' AND a.style = ?';    params.push(style); }
  if (available !== undefined && available !== '') {
    sql += ' AND a.available = ?';
    params.push(available === 'true' || available === '1' ? 1 : 0);
  }
  const maxP = maxPrice || price_max;
  if (maxP)     { sql += ' AND a.price <= ?';   params.push(parseFloat(maxP)); }
  if (search)   { sql += ' AND (a.title LIKE ? OR u.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY a.created_at DESC';
  try {
    const artworks = await dbAll(sql, params);
    const total = await dbGet('SELECT COUNT(*) as count FROM artworks');
    res.json({ artworks, total: total.count, filtered: artworks.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/gallery/featured
router.get('/featured', async (req, res) => {
  try {
    const artworks = await dbAll(`
      SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
      FROM artworks a JOIN users u ON u.id = a.artist_id
      WHERE a.featured = 1 ORDER BY a.created_at DESC LIMIT 6`);
    res.json({ artworks });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/gallery/:id
router.get('/:id', async (req, res) => {
  try {
    const artwork = await dbGet(`
      SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar, u.bio as artist_bio
      FROM artworks a JOIN users u ON u.id = a.artist_id WHERE a.id = ?`, [req.params.id]);
    if (!artwork) return res.status(404).json({ error: 'Œuvre introuvable' });
    // Incrémenter les vues de manière non-bloquante
    dbGet('UPDATE artworks SET view_count = view_count + 1 WHERE id = ?', [artwork.id]).catch(() => {});
    // Retourner l'artwork directement (pas de wrapper)
    res.json(artwork);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
