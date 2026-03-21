const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';

// Comptes démo prédéfinis
const DEMO_ACCOUNTS = {
  artist: {
    id: 'demo-artist-001',
    email: 'artist@demo.com',
    name: 'Elena Vostrova',
    role: 'artist',
    bio: 'Artiste contemporaine explorant les formes géométriques et organiques.',
    avatar: null,
    plan: 'pro',
    createdAt: '2024-01-15'
  },
  admin: {
    id: 'demo-admin-001',
    email: 'admin@demo.com',
    name: 'Admin Demo',
    role: 'admin',
    bio: 'Administrateur de la galerie.',
    avatar: null,
    plan: 'enterprise',
    createdAt: '2023-06-01'
  },
  visitor: {
    id: 'demo-visitor-001',
    email: 'visitor@demo.com',
    name: 'Visiteur',
    role: 'collector',
    bio: 'Amateur d\'art contemporain.',
    avatar: null,
    plan: 'free',
    createdAt: '2025-03-01'
  }
};

/**
 * POST /api/auth/demo-login
 * Connexion avec un compte démo
 */
router.post('/demo-login', (req, res) => {
  const { type = 'visitor' } = req.body;
  
  if (!DEMO_ACCOUNTS[type]) {
    return res.status(400).json({ error: 'Type de compte invalide' });
  }

  const account = DEMO_ACCOUNTS[type];
  
  // Générer JWT
  const token = jwt.sign(
    { 
      userId: account.id, 
      email: account.email,
      role: account.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: account
  });
});

/**
 * GET /api/auth/me
 * Récupérer l'utilisateur courant (depuis le token)
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const token = authHeader.slice(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Retrouver le compte démo
    const account = Object.values(DEMO_ACCOUNTS).find(
      a => a.id === decoded.userId
    );
    
    if (!account) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: account });
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router;
