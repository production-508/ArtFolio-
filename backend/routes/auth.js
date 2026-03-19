const express = require('express');
const { dbGet, dbRun } = require('../db/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { validate, registerSchema, loginSchema, resetPasswordRequestSchema, resetPasswordSubmitSchema } = require('../utils/validation');
const { sendResetPasswordEmail } = require('../utils/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';

// Limiteur pour prévenir les attaques brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite chaque IP à 5 requêtes par fenêtre
  message: { error: 'Trop de tentatives de connexion échouées. Veuillez réessayer dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password, role } = req.body;
  const userRole = role || 'collector';
  try {
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
    const hash = await bcrypt.hash(password, 10);
    const r = await dbRun(
      `INSERT INTO users (name, email, password_hash, role, plan, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'starter', datetime('now'), datetime('now'))`,
      [name.trim(), email.toLowerCase().trim(), hash, userRole]
    );
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [r.lastID]);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token manquant' });
  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch { res.status(401).json({ error: 'Token invalide' }); }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(resetPasswordRequestSchema), async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      // Pour éviter le listage silencieux des emails (user enumeration), on renvoie un mock de succès
      return res.json({ message: 'Si cet email correspond à un compte, un lien de réinitialisation vous a été envoyé.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // Expire dans 1 heure

    // Sauvegarder en DB
    await dbRun(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt]
    );

    // Envoyer l'email
    await sendResetPasswordEmail(email, resetToken);
    
    res.json({ message: 'Si cet email correspond à un compte, un lien de réinitialisation vous a été envoyé.' });
  } catch (err) {
    console.error('Erreur forgot-password:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSubmitSchema), async (req, res) => {
  const { token, password } = req.body;
  
  try {
    // Vérifier si le token est valide et non expiré
    const resetRecord = await dbGet(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > datetime("now")',
      [token]
    );

    if (!resetRecord) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    // Hasher le nouveau mot de passe
    const hash = await bcrypt.hash(password, 10);
    
    // Mettre à jour le mot de passe
    await dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [hash, resetRecord.user_id]);
    
    // Invalider tous les anciens tokens pour ce user
    await dbRun('DELETE FROM password_resets WHERE user_id = ?', [resetRecord.user_id]);

    res.json({ message: 'Votre mot de passe a été réinitialisé avec succès.' });
  } catch (err) {
    console.error('Erreur reset-password:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
