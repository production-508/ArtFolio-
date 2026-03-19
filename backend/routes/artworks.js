const express = require('express');
const { dbGet, dbAll, dbRun } = require('../db/database');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { upload } = require('../middlewares/upload');
const { validate, artworkSchema } = require('../utils/validation');
const artworkAnalyzer = require('../services/artworkAnalyzerService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth requise' });
  try { req.user = jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalide' }); }
}

// GET /api/artworks
router.get('/', async (req, res) => {
  const { medium, style, available, maxPrice, search, page = 1, limit = 18 } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
    FROM artworks a JOIN users u ON u.id = a.artist_id WHERE 1=1`;
  let countSql = `SELECT COUNT(*) as count FROM artworks a JOIN users u ON u.id = a.artist_id WHERE 1=1`;
  const params = [];
  
  if (medium)   { 
    const cond = ' AND a.medium = ?';
    sql += cond; countSql += cond; params.push(medium); 
  }
  if (style)    { 
    const cond = ' AND a.style = ?';
    sql += cond; countSql += cond; params.push(style); 
  }
  if (available !== undefined && available !== '') {
    const cond = ' AND a.available = ?';
    sql += cond; countSql += cond;
    params.push(available === 'true' || available === '1' ? 1 : 0);
  }
  if (maxPrice) { 
    const cond = ' AND a.price <= ?';
    sql += cond; countSql += cond; params.push(parseFloat(maxPrice)); 
  }
  if (search)   { 
    const cond = ' AND (a.title LIKE ? OR u.name LIKE ?)';
    sql += cond; countSql += cond; params.push(`%${search}%`, `%${search}%`); 
  }
  
  sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  const dataParams = [...params, parseInt(limit), parseInt(offset)];
  
  try {
    const artworks = await dbAll(sql, dataParams);
    const totalResult = await dbGet(countSql, params);
    res.json({ artworks, total: totalResult.count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/artworks/featured
router.get('/featured', async (req, res) => {
  try {
    const artworks = await dbAll(`
      SELECT a.*, u.name as artist_name FROM artworks a
      JOIN users u ON u.id = a.artist_id
      WHERE a.featured = 1 ORDER BY a.created_at DESC LIMIT 6`);
    res.json({ artworks });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/artworks/:id
router.get('/:id', async (req, res) => {
  try {
    const artwork = await dbGet(`
      SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar, u.bio as artist_bio
      FROM artworks a JOIN users u ON u.id = a.artist_id WHERE a.id = ?`, [req.params.id]);
    if (!artwork) return res.status(404).json({ error: 'Œuvre introuvable' });
    await dbRun('UPDATE artworks SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ artwork });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/artworks
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    // 1. Validation de la payload textuelle
    const data = artworkSchema.parse(req.body);
    
    // 2. Traitement de l'image si fournie
    let finalImageUrl = data.image_url; // fallback pour la rétrocompatibilité
    if (req.file) {
      const publicImagesDir = path.join(__dirname, '..', 'public', 'images');
      if (!fs.existsSync(publicImagesDir)) {
        fs.mkdirSync(publicImagesDir, { recursive: true });
      }
      
      const filename = `artwork_${Date.now()}_${Math.round(Math.random() * 1E9)}.webp`;
      const filepath = path.join(publicImagesDir, filename);
      
      await sharp(req.file.buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);
        
      finalImageUrl = `/images/${filename}`;
    }
    
    if (!finalImageUrl) {
      return res.status(400).json({ error: "L'image de l'œuvre est requise" });
    }

    const r = await dbRun(
      `INSERT INTO artworks (artist_id, title, medium, style, description, price, available, image_url, year, dimensions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, data.title, data.medium, data.style, data.description, data.price, data.available ? 1 : 0, finalImageUrl, data.year || '', data.dimensions || '']
    );
    
    const artwork = await dbGet('SELECT * FROM artworks WHERE id = ?', [r.lastID]);
    res.status(201).json({ artwork });
  } catch (err) { 
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Erreur de validation', details: err.errors });
    }
    console.error('Erreur upload:', err);
    res.status(500).json({ error: err.message }); 
  }
});

// POST /api/artworks/:id/analyze
router.post('/:id/analyze', requireAuth, async (req, res) => {
  try {
    // Vérifier que l'œuvre existe et appartient à l'utilisateur
    const artwork = await dbGet(
      'SELECT * FROM artworks WHERE id = ? AND artist_id = ?',
      [req.params.id, req.user.id]
    );
    if (!artwork) {
      return res.status(404).json({ error: 'Œuvre introuvable ou non autorisée' });
    }

    // Construire le chemin de l'image
    const imagePath = path.join(__dirname, '..', 'public', artwork.image_url);
    
    // Analyser l'image
    const analysis = await artworkAnalyzer.analyzeImage(imagePath);
    
    // Générer une description
    const descriptions = await artworkAnalyzer.generateDescription(
      analysis,
      artwork.title,
      req.user.name || 'Artiste'
    );

    // Sauvegarder l'analyse en base
    await dbRun(
      `UPDATE artworks SET 
        analyzed_at = datetime('now'),
        analysis_data = ?,
        suggested_tags = ?,
        suggested_price_min = ?,
        suggested_price_max = ?
       WHERE id = ?`,
      [
        JSON.stringify(analysis),
        JSON.stringify(analysis.suggestedTags),
        analysis.priceRange.min,
        analysis.priceRange.max,
        req.params.id
      ]
    );

    res.json({
      analysis,
      descriptions,
      message: 'Analyse complétée avec succès'
    });
  } catch (err) {
    console.error('Erreur analyse:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/artworks/analyze-preview (pour analyser avant upload)
router.post('/analyze-preview', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image requise' });
    }

    // Analyser directement depuis le buffer
    const tempPath = path.join('/tmp', `analyze_${Date.now()}.tmp`);
    await fs.promises.writeFile(tempPath, req.file.buffer);
    
    const analysis = await artworkAnalyzer.analyzeImage(tempPath);
    
    // Nettoyer le fichier temporaire
    await fs.promises.unlink(tempPath).catch(() => {});

    res.json({
      analysis,
      message: 'Analyse preview complétée'
    });
  } catch (err) {
    console.error('Erreur analyse preview:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
