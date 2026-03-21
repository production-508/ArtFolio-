const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';

/**
 * Middleware d'authentification
 * Vérifie le token JWT dans le header Authorization
 */
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

/**
 * Middleware d'authentification optionnel
 * N'échoue pas si pas de token, mais ajoute l'utilisateur si présent
 */
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  
  if (!auth?.startsWith('Bearer ')) {
    return next();
  }
  
  try { 
    req.user = jwt.verify(auth.slice(7), JWT_SECRET); 
  } catch {
    // Token invalide, on continue sans user
  }
  
  next();
}

module.exports = { requireAuth, optionalAuth };
