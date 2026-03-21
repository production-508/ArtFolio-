const express = require('express');
const recommendationService = require('../services/recommendationService');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/recommendations/for-you
 * Récupère les recommandations personnalisées pour l'utilisateur connecté
 */
router.get('/for-you', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recommendations = await recommendationService.getForYou(req.user.id, limit);
    
    res.json({
      success: true,
      recommendations,
      count: recommendations.length
    });
  } catch (err) {
    console.error('Erreur recommandations:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la génération des recommandations' 
    });
  }
});

/**
 * GET /api/recommendations/collections
 * Récupère les collections thématiques personnalisées
 */
router.get('/collections', requireAuth, async (req, res) => {
  try {
    const collections = await recommendationService.getThematicCollections(req.user.id);
    
    res.json({
      success: true,
      collections,
      count: collections.length
    });
  } catch (err) {
    console.error('Erreur collections:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des collections' 
    });
  }
});

/**
 * GET /api/recommendations/similar/:artworkId
 * Récupère les œuvres similaires à une œuvre donnée
 */
router.get('/similar/:artworkId', async (req, res) => {
  try {
    const { artworkId } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    const userId = req.user?.id;

    // Récupérer l'œuvre de référence
    const { dbGet } = require('../db/database');
    const referenceArtwork = await dbGet(
      'SELECT * FROM artworks WHERE id = ?',
      [artworkId]
    );

    if (!referenceArtwork) {
      return res.status(404).json({ 
        success: false, 
        error: 'Œuvre non trouvée' 
      });
    }

    // Utiliser le service pour trouver des similaires
    const { dbAll } = require('../db/database');
    const similarArtworks = await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar,
        CASE 
          WHEN a.style = ? THEN 3
          WHEN a.artist_id = ? THEN 2
          WHEN a.medium = ? THEN 1
          ELSE 0
        END as similarity_score
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1 AND a.id != ?
       ORDER BY similarity_score DESC, a.view_count DESC
       LIMIT ?`,
      [referenceArtwork.style, referenceArtwork.artist_id, 
       referenceArtwork.medium, artworkId, limit]
    );

    res.json({
      success: true,
      reference: referenceArtwork,
      artworks: similarArtworks,
      count: similarArtworks.length
    });
  } catch (err) {
    console.error('Erreur similar artworks:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des œuvres similaires' 
    });
  }
});

/**
 * GET /api/recommendations/trending
 * Récupère les œuvres tendances (pour les visiteurs non connectés)
 */
router.get('/trending', async (req, res) => {
  try {
    const { dbAll } = require('../db/database');
    const limit = parseInt(req.query.limit) || 10;

    const trending = await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1
       ORDER BY a.view_count DESC, a.created_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      artworks: trending,
      count: trending.length
    });
  } catch (err) {
    console.error('Erreur trending:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des tendances' 
    });
  }
});

module.exports = router;
