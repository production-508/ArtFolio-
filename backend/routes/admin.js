const express = require('express');
const userService = require('../services/userService');
const artworkService = require('../services/artworkService');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';

// Middleware vérification Auth + Admin
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth requise' });
  try {
    const user = jwt.verify(auth.slice(7), JWT_SECRET);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Réservé aux administrateurs.' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// Appliquer le middleware à toutes les routes /api/admin
router.use(requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const userStats = await userService.getAdminStats();
    const artStats = await artworkService.getAdminStats();
    
    res.json({
      users: userStats.totalUsers,
      artists: userStats.totalArtists,
      artworks: artStats.artworks,
      sold: artStats.sold,
      revenue: artStats.revenue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await userService.getAllUsersAdmin();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/artworks
router.get('/artworks', async (req, res) => {
  try {
    const artworks = await artworkService.getAllArtworksAdmin();
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/artworks/:id (Modération)
router.delete('/artworks/:id', async (req, res) => {
  try {
    await artworkService.deleteArtworkAdmin(req.params.id);
    res.json({ success: true, message: 'Œuvre supprimée par un administrateur.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'artist', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide.' });
    }
    
    // On empêche de se retirer soi-même les droits admin pour éviter d'être bloqué
    if (req.user.id.toString() === req.params.id && role !== 'admin') {
      return res.status(400).json({ error: 'Impossible de retirer vos propres droits administrateur.' });
    }

    await userService.updateUserRole(req.params.id, role);
    res.json({ success: true, message: `Rôle mis à jour: ${role}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
