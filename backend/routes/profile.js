/**
 * Routes API pour la personnalisation des profils utilisateurs
 * Sécurisées avec JWT et validation des données
 */
const express = require('express');
const { dbGet, dbAll, dbRun } = require('../db/database');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';

// Middleware d'authentification
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// Middleware de validation des erreurs
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: errors.array() 
    });
  }
  next();
}

// ===== PARAMÈTRES DE PROFIL =====

// GET /api/profile/settings - Récupérer les paramètres du profil connecté
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const settings = await dbGet(
      'SELECT * FROM user_profile_settings WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (!settings) {
      // Créer les paramètres par défaut s'ils n'existent pas
      await dbRun(
        `INSERT INTO user_profile_settings (user_id) VALUES (?)`,
        [req.user.userId]
      );
      const newSettings = await dbGet(
        'SELECT * FROM user_profile_settings WHERE user_id = ?',
        [req.user.userId]
      );
      return res.json(newSettings);
    }
    
    res.json(settings);
  } catch (err) {
    console.error('Erreur récupération settings:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/profile/settings - Mettre à jour les paramètres
router.put('/settings', requireAuth, [
  body('theme_mode').optional().isIn(['dark', 'light', 'auto']),
  body('primary_color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('accent_color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('layout_type').optional().isIn(['grid', 'masonry', 'spotlight', 'minimal', 'timeline']),
  body('hero_style').optional().isIn(['carousel', 'static', 'video', 'none']),
  body('banner_overlay_opacity').optional().isFloat({ min: 0, max: 1 }),
  body('custom_slug').optional().isSlug().isLength({ min: 3, max: 50 }),
  body('is_public').optional().isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'theme_mode', 'primary_color', 'accent_color', 'font_heading', 'font_body',
      'layout_type', 'hero_style', 'show_bio', 'show_story', 'show_stats',
      'show_social_links', 'show_contact_form', 'show_cv', 'show_exhibitions',
      'show_press', 'banner_image_url', 'banner_overlay_opacity', 'profile_image_shape',
      'custom_slug', 'page_title', 'meta_description', 'featured_artwork_id',
      'og_image_url', 'twitter_handle', 'contact_email', 'contact_phone',
      'contact_address', 'is_public', 'allow_messages', 'require_approval_for_comments'
    ];
    
    // Filtrer uniquement les champs autorisés
    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }
    
    // Vérifier l'unicité du slug custom
    if (filteredUpdates.custom_slug) {
      const existing = await dbGet(
        'SELECT id FROM user_profile_settings WHERE custom_slug = ? AND user_id != ?',
        [filteredUpdates.custom_slug, req.user.userId]
      );
      if (existing) {
        return res.status(409).json({ error: 'Ce slug est déjà utilisé' });
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }
    
    const fields = Object.keys(filteredUpdates);
    const values = Object.values(filteredUpdates);
    const placeholders = fields.map(f => `${f} = ?`).join(', ');
    
    // S'assurer que l'enregistrement existe
    const existing = await dbGet(
      'SELECT id FROM user_profile_settings WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (existing) {
      await dbRun(
        `UPDATE user_profile_settings SET ${placeholders}, last_updated = CURRENT_TIMESTAMP WHERE user_id = ?`,
        [...values, req.user.userId]
      );
    } else {
      await dbRun(
        `INSERT INTO user_profile_settings (user_id, ${fields.join(', ')}) VALUES (${['?'].concat(fields.map(() => '?')).join(', ')})`,
        [req.user.userId, ...values]
      );
    }
    
    const updated = await dbGet(
      'SELECT * FROM user_profile_settings WHERE user_id = ?',
      [req.user.userId]
    );
    
    res.json(updated);
  } catch (err) {
    console.error('Erreur mise à jour settings:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/profile/public/:slug - Profil public par slug
router.get('/public/:slug', async (req, res) => {
  try {
    const profile = await dbGet(
      `SELECT v.*, 
        (SELECT json_group_array(json_object('platform', platform, 'url', url, 'icon', custom_icon))
         FROM user_social_links WHERE user_id = v.user_id AND is_visible = 1 ORDER BY display_order) as social_links
      FROM v_user_complete_profiles v
      WHERE v.custom_slug = ? AND v.is_public = 1`,
      [req.params.slug]
    );
    
    if (!profile) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }
    
    // Incrémenter les vues
    await dbRun(
      'UPDATE user_profile_settings SET profile_views = profile_views + 1 WHERE user_id = ?',
      [profile.user_id]
    );
    
    // Parse le JSON des liens sociaux
    if (profile.social_links) {
      try {
        profile.social_links = JSON.parse(profile.social_links);
      } catch {
        profile.social_links = [];
      }
    }
    
    res.json(profile);
  } catch (err) {
    console.error('Erreur récupération profil public:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== LIENS SOCIAUX =====

// GET /api/profile/social-links - Récupérer les liens sociaux
router.get('/social-links', requireAuth, async (req, res) => {
  try {
    const links = await dbAll(
      'SELECT * FROM user_social_links WHERE user_id = ? ORDER BY display_order, id',
      [req.user.userId]
    );
    res.json(links);
  } catch (err) {
    console.error('Erreur récupération liens sociaux:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/profile/social-links - Ajouter un lien social
router.post('/social-links', requireAuth, [
  body('platform').isIn(['instagram', 'twitter', 'facebook', 'linkedin', 'behance', 'dribbble', 'youtube', 'tiktok', 'website', 'other']),
  body('url').isURL(),
  body('display_order').optional().isInt(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { platform, url, display_order = 0, custom_icon } = req.body;
    
    const result = await dbRun(
      'INSERT INTO user_social_links (user_id, platform, url, display_order, custom_icon) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, platform, url, display_order, custom_icon || null]
    );
    
    const newLink = await dbGet(
      'SELECT * FROM user_social_links WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json(newLink);
  } catch (err) {
    console.error('Erreur ajout lien social:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/profile/social-links/:id - Modifier un lien social
router.put('/social-links/:id', requireAuth, [
  body('platform').optional().isIn(['instagram', 'twitter', 'facebook', 'linkedin', 'behance', 'dribbble', 'youtube', 'tiktok', 'website', 'other']),
  body('url').optional().isURL(),
  body('is_visible').optional().isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    // Vérifier que le lien appartient à l'utilisateur
    const existing = await dbGet(
      'SELECT * FROM user_social_links WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (!existing) {
      return res.status(404).json({ error: 'Lien non trouvé' });
    }
    
    const updates = {};
    ['platform', 'url', 'display_order', 'is_visible', 'custom_icon'].forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }
    
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const placeholders = fields.map(f => `${f} = ?`).join(', ');
    
    await dbRun(
      `UPDATE user_social_links SET ${placeholders} WHERE id = ?`,
      [...values, req.params.id]
    );
    
    const updated = await dbGet('SELECT * FROM user_social_links WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error('Erreur modification lien social:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/profile/social-links/:id - Supprimer un lien social
router.delete('/social-links/:id', requireAuth, async (req, res) => {
  try {
    const result = await dbRun(
      'DELETE FROM user_social_links WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lien non trouvé' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression lien social:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== SECTIONS CUSTOM =====

// GET /api/profile/custom-sections
router.get('/custom-sections', requireAuth, async (req, res) => {
  try {
    const sections = await dbAll(
      'SELECT * FROM user_custom_sections WHERE user_id = ? ORDER BY display_order, id',
      [req.user.userId]
    );
    res.json(sections);
  } catch (err) {
    console.error('Erreur récupération sections:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/profile/custom-sections
router.post('/custom-sections', requireAuth, [
  body('section_type').isIn(['text', 'gallery', 'video', 'embed', 'quote', 'cv_entry', 'exhibition']),
  body('title').isLength({ min: 1, max: 200 }),
  body('content').optional(),
  body('display_order').optional().isInt(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { section_type, title, content, metadata, display_order = 0 } = req.body;
    
    const result = await dbRun(
      'INSERT INTO user_custom_sections (user_id, section_type, title, content, metadata, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.userId, section_type, title, content || null, JSON.stringify(metadata || {}), display_order]
    );
    
    const newSection = await dbGet(
      'SELECT * FROM user_custom_sections WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json(newSection);
  } catch (err) {
    console.error('Erreur ajout section:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/profile/custom-sections/:id
router.put('/custom-sections/:id', requireAuth, async (req, res) => {
  try {
    const existing = await dbGet(
      'SELECT * FROM user_custom_sections WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (!existing) {
      return res.status(404).json({ error: 'Section non trouvée' });
    }
    
    const allowedFields = ['title', 'content', 'metadata', 'display_order', 'is_visible'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'metadata' ? JSON.stringify(req.body[field]) : req.body[field];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }
    
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const placeholders = fields.map(f => `${f} = ?`).join(', ');
    
    await dbRun(
      `UPDATE user_custom_sections SET ${placeholders}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, req.params.id]
    );
    
    const updated = await dbGet('SELECT * FROM user_custom_sections WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error('Erreur modification section:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/profile/custom-sections/:id
router.delete('/custom-sections/:id', requireAuth, async (req, res) => {
  try {
    const result = await dbRun(
      'DELETE FROM user_custom_sections WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Section non trouvée' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression section:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== WIDGETS DASHBOARD =====

// GET /api/profile/dashboard-widgets
router.get('/dashboard-widgets', requireAuth, async (req, res) => {
  try {
    const widgets = await dbAll(
      'SELECT * FROM user_dashboard_widgets WHERE user_id = ? AND is_visible = 1 ORDER BY position_y, position_x',
      [req.user.userId]
    );
    res.json(widgets);
  } catch (err) {
    console.error('Erreur récupération widgets:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/profile/dashboard-widgets
router.post('/dashboard-widgets', requireAuth, [
  body('widget_type').isIn(['stats', 'recent_views', 'sales', 'messages', 'quick_upload', 'analytics', 'earnings']),
  body('position_x').isInt({ min: 0 }),
  body('position_y').isInt({ min: 0 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { widget_type, position_x, position_y, width = 1, height = 1, config } = req.body;
    
    const result = await dbRun(
      'INSERT INTO user_dashboard_widgets (user_id, widget_type, position_x, position_y, width, height, config) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.userId, widget_type, position_x, position_y, width, height, JSON.stringify(config || {})]
    );
    
    const newWidget = await dbGet(
      'SELECT * FROM user_dashboard_widgets WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json(newWidget);
  } catch (err) {
    console.error('Erreur ajout widget:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/profile/dashboard-widgets/:id/position
router.put('/dashboard-widgets/:id/position', requireAuth, [
  body('position_x').isInt({ min: 0 }),
  body('position_y').isInt({ min: 0 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { position_x, position_y } = req.body;
    
    const result = await dbRun(
      'UPDATE user_dashboard_widgets SET position_x = ?, position_y = ? WHERE id = ? AND user_id = ?',
      [position_x, position_y, req.params.id, req.user.userId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Widget non trouvé' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur mise à jour position widget:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/profile/dashboard-widgets/:id
router.delete('/dashboard-widgets/:id', requireAuth, async (req, res) => {
  try {
    const result = await dbRun(
      'DELETE FROM user_dashboard_widgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Widget non trouvé' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression widget:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== STATS ET ANALYTICS =====

// GET /api/profile/stats - Statistiques du profil
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = await dbGet(
      `SELECT 
        ups.profile_views,
        (SELECT COUNT(*) FROM artworks WHERE artist_id = ?) as total_artworks,
        (SELECT COUNT(*) FROM artworks WHERE artist_id = ? AND status = 'sold') as sold_artworks,
        (SELECT COUNT(*) FROM artworks WHERE artist_id = ? AND status = 'available') as available_artworks,
        (SELECT COALESCE(SUM(price), 0) FROM order_items oi 
         JOIN artworks a ON oi.artwork_id = a.id 
         WHERE a.artist_id = ?) as total_sales_value
      FROM user_profile_settings ups
      WHERE ups.user_id = ?`,
      [req.user.userId, req.user.userId, req.user.userId, req.user.userId, req.user.userId]
    );
    
    if (!stats) {
      return res.json({
        profile_views: 0,
        total_artworks: 0,
        sold_artworks: 0,
        available_artworks: 0,
        total_sales_value: 0
      });
    }
    
    res.json(stats);
  } catch (err) {
    console.error('Erreur récupération stats:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/profile/preview - Aperçu du profil tel que les visiteurs le voient
router.get('/preview', requireAuth, async (req, res) => {
  try {
    const profile = await dbGet(
      `SELECT v.*, 
        (SELECT json_group_array(json_object('platform', platform, 'url', url, 'icon', custom_icon))
         FROM user_social_links WHERE user_id = v.user_id AND is_visible = 1 ORDER BY display_order) as social_links,
        (SELECT json_group_array(json_object('id', id, 'section_type', section_type, 'title', title, 'content', content, 'metadata', metadata))
         FROM user_custom_sections WHERE user_id = v.user_id AND is_visible = 1 ORDER BY display_order) as custom_sections
      FROM v_user_complete_profiles v
      WHERE v.user_id = ?`,
      [req.user.userId]
    );
    
    if (!profile) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }
    
    // Parser les JSON
    ['social_links', 'custom_sections'].forEach(field => {
      if (profile[field]) {
        try {
          profile[field] = JSON.parse(profile[field]);
        } catch {
          profile[field] = [];
        }
      }
    });
    
    res.json(profile);
  } catch (err) {
    console.error('Erreur récupération preview:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
