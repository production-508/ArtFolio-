const express = require('express');
const recommendationService = require('../services/recommendationService');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

/**
 * POST /api/tracking/view
 * Enregistre une vue d'œuvre
 */
router.post('/view', requireAuth, async (req, res) => {
  try {
    const { artworkId, duration = 0 } = req.body;
    
    if (!artworkId) {
      return res.status(400).json({ 
        success: false, 
        error: 'artworkId requis' 
      });
    }

    await recommendationService.trackView(req.user.id, artworkId, duration);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur tracking view:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'enregistrement de la vue' 
    });
  }
});

/**
 * POST /api/tracking/interaction
 * Enregistre une interaction (hover, click, etc.)
 */
router.post('/interaction', requireAuth, async (req, res) => {
  try {
    const { artworkId, type, duration = 0 } = req.body;
    
    if (!artworkId || !type) {
      return res.status(400).json({ 
        success: false, 
        error: 'artworkId et type requis' 
      });
    }

    const validTypes = ['hover', 'click', 'favorite', 'unfavorite', 'share', 'cart_add'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type d\'interaction invalide' 
      });
    }

    await recommendationService.trackInteraction(
      req.user.id, 
      artworkId, 
      type, 
      duration
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur tracking interaction:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'enregistrement de l\'interaction' 
    });
  }
});

/**
 * POST /api/tracking/favorite
 * Enregistre un favori (ajout ou suppression)
 */
router.post('/favorite', requireAuth, async (req, res) => {
  try {
    const { artworkId, isFavorite = true } = req.body;
    
    if (!artworkId) {
      return res.status(400).json({ 
        success: false, 
        error: 'artworkId requis' 
      });
    }

    await recommendationService.trackFavorite(
      req.user.id, 
      artworkId, 
      isFavorite
    );
    
    res.json({ 
      success: true,
      isFavorite 
    });
  } catch (err) {
    console.error('Erreur tracking favorite:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'enregistrement du favori' 
    });
  }
});

/**
 * POST /api/tracking/search
 * Enregistre une recherche
 */
router.post('/search', requireAuth, async (req, res) => {
  try {
    const { query, resultsCount = 0 } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query requise' 
      });
    }

    await recommendationService.trackSearch(
      req.user.id, 
      query.trim(), 
      resultsCount
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur tracking search:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'enregistrement de la recherche' 
    });
  }
});

/**
 * GET /api/tracking/history
 * Récupère l'historique de l'utilisateur
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { dbAll } = require('../db/database');
    const limit = parseInt(req.query.limit) || 50;

    const history = await dbAll(
      `SELECT 
        ut.*,
        a.title as artwork_title,
        a.image_url as artwork_image,
        u.name as artist_name
       FROM user_tracking ut
       JOIN artworks a ON a.id = ut.artwork_id
       JOIN users u ON u.id = a.artist_id
       WHERE ut.user_id = ?
       ORDER BY ut.created_at DESC
       LIMIT ?`,
      [req.user.id, limit]
    );

    res.json({ 
      success: true,
      history,
      count: history.length 
    });
  } catch (err) {
    console.error('Erreur récupération historique:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération de l\'historique' 
    });
  }
});

/**
 * GET /api/tracking/favorites
 * Récupère les favoris de l'utilisateur
 */
router.get('/favorites', requireAuth, async (req, res) => {
  try {
    const { dbAll } = require('../db/database');

    const favorites = await dbAll(
      `SELECT 
        uf.*,
        a.*,
        u.name as artist_name,
        u.avatar_url as artist_avatar
       FROM user_favorites uf
       JOIN artworks a ON a.id = uf.artwork_id
       JOIN users u ON u.id = a.artist_id
       WHERE uf.user_id = ?
       ORDER BY uf.created_at DESC`,
      [req.user.id]
    );

    res.json({ 
      success: true,
      favorites,
      count: favorites.length 
    });
  } catch (err) {
    console.error('Erreur récupération favoris:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des favoris' 
    });
  }
});

module.exports = router;
