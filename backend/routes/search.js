const express = require('express');
const router = express.Router();
const SmartSearchService = require('../services/smartSearchService');
const authMiddleware = require('../middleware/auth');

/**
 * Routes de recherche intelligente ArtFolio
 * POST /api/search/text     - Recherche sémantique par texte
 * POST /api/search/visual   - Recherche visuelle par image
 * POST /api/search/combined - Recherche combinée texte + image
 * GET  /api/search/suggest  - Suggestions de recherche
 */

module.exports = (db) => {
  const searchService = new SmartSearchService(db);

  /**
   * POST /api/search/text
   * Recherche sémantique par texte
   * Body: { query: string, filters: {}, limit: number, offset: number }
   */
  router.post('/text', async (req, res) => {
    try {
      const { query, filters = {}, limit = 20, offset = 0 } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Requête de recherche requise' });
      }

      const results = await searchService.searchByText(query, {
        filters,
        limit,
        offset
      });

      res.json({
        success: true,
        ...results
      });

    } catch (error) {
      console.error('Text search error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la recherche',
        details: error.message 
      });
    }
  });

  /**
   * POST /api/search/visual
   * Recherche visuelle par image (base64)
   * Body: { image: base64String, limit: number }
   */
  router.post('/visual', async (req, res) => {
    try {
      const { image, limit = 20 } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Image requise pour la recherche visuelle' });
      }

      // Supprimer le préfixe data:image si présent
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

      const results = await searchService.searchByImage(base64Data, { limit });

      res.json({
        success: true,
        ...results
      });

    } catch (error) {
      console.error('Visual search error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la recherche visuelle',
        details: error.message 
      });
    }
  });

  /**
   * POST /api/search/combined
   * Recherche combinée (texte + visuel)
   * Body: { query: string, image: base64String, filters: {} }
   */
  router.post('/combined', async (req, res) => {
    try {
      const { query, image, filters = {}, limit = 20 } = req.body;

      if (!query && !image) {
        return res.status(400).json({ 
          error: 'Requête texte ou image requise' 
        });
      }

      const base64Data = image ? image.replace(/^data:image\/\w+;base64,/, '') : null;

      const results = await searchService.searchCombined(
        query, 
        base64Data, 
        { filters, limit }
      );

      res.json({
        success: true,
        ...results
      });

    } catch (error) {
      console.error('Combined search error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la recherche combinée',
        details: error.message 
      });
    }
  });

  /**
   * GET /api/search/suggest?q=partialQuery
   * Suggestions de recherche
   */
  router.get('/suggest', async (req, res) => {
    try {
      const { q = '' } = req.query;

      if (q.length < 2) {
        return res.json({ suggestions: [] });
      }

      const suggestions = await searchService.getSuggestions(q);

      res.json({
        success: true,
        suggestions
      });

    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des suggestions' 
      });
    }
  });

  /**
   * GET /api/search/popular
   * Recherches populaires (pour la page d'accueil)
   */
  router.get('/popular', async (req, res) => {
    try {
      const popularSearches = [
        { query: 'Abstrait contemporain', count: 1240 },
        { query: 'Portrait moderne', count: 980 },
        { query: 'Paysage minimaliste', count: 750 },
        { query: 'Sculpture contemporaine', count: 620 },
        { query: 'Art digital', count: 540 },
      ];

      res.json({
        success: true,
        searches: popularSearches
      });

    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  return router;
};
