const express = require('express');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../db/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentification requise' });
  try { req.user = jwt.verify(authHeader.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalide' }); }
}

// POST /api/ai/generate-profile
router.post('/generate-profile', requireAuth, async (req, res) => {
  const { name, medium, style, influences, description } = req.body;
  if (!name || !medium) return res.status(400).json({ error: 'name et medium sont requis' });

  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user || user.role === 'admin') return res.status(403).json({ error: 'Réservé aux artistes' });

    const tokenLimits = { starter: 500, pro: 5000, galerie: 20000 };
    const limit = tokenLimits[user.plan] || 500;
    if ((user.ai_tokens_used || 0) >= limit) {
      return res.status(429).json({ error: `Limite de tokens IA atteinte (${limit} tokens pour le plan ${user.plan})`, tokens_used: user.ai_tokens_used, limit });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      const demoResult = generateDemoProfile(name, medium, style, influences, description, user);
      await dbRun(`UPDATE users SET ai_bio=?,ai_statement=?,ai_style_tags=?,
        ai_generated_at=datetime('now'),ai_tokens_used=ai_tokens_used+50 WHERE id=?`,
        [demoResult.bio, demoResult.statement, JSON.stringify(demoResult.style_tags), req.user.id]);
      return res.json({ ...demoResult, tokens_used: 50, mode: 'demo', message: 'Profil généré en mode démo' });
    }

    // Appel OpenAI
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const prompt = `Tu es un rédacteur spécialisé dans l'art contemporain. Génère un profil artiste professionnel en français pour :
- Nom : ${name}
- Medium : ${medium}
- Style : ${style || 'non précisé'}
- Influences : ${influences || 'non précisées'}
- Localisation : ${user.location || 'non précisée'}
- Démarche : ${description || 'non précisée'}
- Mots-clés / Bio existante : ${user.bio || 'aucune'}

Prends en compte ces informations (spécialement la localisation et la démarche) pour créer une biographie unique.
Réponds UNIQUEMENT en JSON :
{"bio": "3-4 phrases à la 3ème personne, élégantes.", "statement": "2-3 phrases à la 1ère personne, personnelles.", "style_tags": ["Tag1","Tag2","Tag3"]}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.7,
    });
    const tokensUsed = completion.usage?.total_tokens || 100;
    const generated = JSON.parse(completion.choices[0].message.content);

    await dbRun(`UPDATE users SET ai_bio=?,ai_statement=?,ai_style_tags=?,
      ai_generated_at=datetime('now'),ai_tokens_used=ai_tokens_used+? WHERE id=?`,
      [generated.bio, generated.statement, JSON.stringify(generated.style_tags), tokensUsed, req.user.id]);
    res.json({ bio: generated.bio, statement: generated.statement, style_tags: generated.style_tags, tokens_used: tokensUsed, mode: 'openai' });
  } catch (err) {
    console.error('Erreur IA:', err.message);
    res.status(500).json({ error: 'Erreur lors de la génération IA', detail: err.message });
  }
});

// GET /api/ai/tokens
router.get('/tokens', requireAuth, async (req, res) => {
  try {
    const user = await dbGet('SELECT plan, ai_tokens_used FROM users WHERE id = ?', [req.user.id]);
    const limits = { starter: 500, pro: 5000, galerie: 20000 };
    const limit = limits[user?.plan] || 500;
    const used = user?.ai_tokens_used || 0;
    res.json({ used, limit, remaining: Math.max(0, limit - used), plan: user?.plan });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function generateDemoProfile(name, medium, style, influences, description, user) {
  const mediums = { 'Huile sur toile': "la peinture à l'huile", 'Acrylique': "l'acrylique", 'Aquarelle': "l'aquarelle", 'Photographie': "la photographie", 'Sculpture': "la sculpture", 'Dessin': "le dessin" };
  const mediumLabel = mediums[medium] || medium.toLowerCase();
  const locStr = user?.location ? `Basé(e) à ${user.location}, ` : '';
  const descStr = description ? description + '. ' : (user?.bio ? user.bio + '. ' : '');
  
  return {
    bio: `${locStr}${name} est un·e artiste contemporain·e dont la pratique s'articule autour de ${mediumLabel}. ${descStr}${influences ? `Son travail s'inscrit dans la tradition de ${influences}.` : 'Son travail est reconnu pour sa sensibilité et son originalité.'}`,
    statement: `Je travaille ${mediumLabel} comme d'autres écrivent un journal — pour dire ce que les mots ne suffisent pas à exprimer. ${style ? `Le ${style.toLowerCase()} est ma façon d'appréhender le monde.` : ''}`,
    style_tags: [style, medium, 'Expressif', 'Contemporain'].filter(Boolean).slice(0, 4),
  };
}

// POST /api/ai/generate-theme
router.post('/generate-theme', requireAuth, async (req, res) => {
  const { name, medium, style, description } = req.body;
  if (!name || !medium) return res.status(400).json({ error: 'name et medium sont requis' });

  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user || user.role === 'admin') return res.status(403).json({ error: 'Réservé aux artistes' });

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      // Demo response - simulate generation delay so it doesn't feel weirdly instant
      await new Promise(resolve => setTimeout(resolve, 1800));
      const demoTheme = {
        basePreset: 'nuit',
        bg: 'linear-gradient(135deg, #121014 0%, #1e1b24 100%)',
        accent: '#bf8bff',
        text: '#f2ebfb',
        muted: 'rgba(242, 235, 251, 0.5)',
        font: "'Cormorant Garamond', serif",
        fontStyle: 'italic',
        fontWeight: '300'
      };
      return res.json({ theme: demoTheme, tokens_used: 20, mode: 'demo' });
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const prompt = `Génère une palette de couleurs et un choix typographique CSS de qualité "Awwwards" pour le portfolio d'un artiste.
Détails de l'artiste:
- Nom : ${name}
- Medium : ${medium}
- Style : ${style || 'non précisé'}
- Démarche : ${description || 'non précisée'}

Consignes: Pense comme un designer web de luxe (brutalisme, minimalisme ou élégance classique selon le profil).
Choisis un "basePreset" parmi ces layout disponibles qui correspond au mieux à l'artiste (obsidian, blanc, manifesto, nomade, nuit, cinema, marbre, foret, studio).
Réponds UNIQUEMENT en JSON avec la structure exacte suivante :
{
  "basePreset": "obsidian | blanc | manifesto | nomade | nuit | cinema | marbre | foret | studio",
  "bg": "Code couleur CSS ou linear-gradient (fond général)",
  "accent": "Couleur CSS pour les boutons, liens, éléments d'accentuation",
  "text": "Couleur CSS pour le texte principal (doit contraster avec bg)",
  "muted": "Couleur CSS semi-transparente pour le texte secondaire",
  "font": "Police CSS (ex: 'Inter, sans-serif' ou 'Cormorant Garamond, serif')",
  "fontStyle": "normal ou italic",
  "fontWeight": "300, 400 ou 900"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.8,
    });
    const tokensUsed = completion.usage?.total_tokens || 50;
    const generated = JSON.parse(completion.choices[0].message.content);

    await dbRun(`UPDATE users SET ai_tokens_used=ai_tokens_used+? WHERE id=?`, [tokensUsed, req.user.id]);
    res.json({ theme: generated, tokens_used: tokensUsed, mode: 'openai' });
  } catch (err) {
    console.error('Erreur IA Thème:', err.message);
    res.status(500).json({ error: 'Erreur lors de la génération du thème', detail: err.message });
  }
});

module.exports = router;
