const express = require('express');
const { dbGet, dbAll, dbRun } = require('../db/database');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware d'authentification
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth requise' });
  try { 
    req.user = jwt.verify(auth.slice(7), JWT_SECRET); 
    next(); 
  }
  catch { 
    res.status(401).json({ error: 'Token invalide' }); 
  }
}

/**
 * Extrait la palette de couleurs dominantes d'une œuvre
 */
async function extractColorFromImage(imagePath) {
  try {
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    await fs.access(fullPath);
    
    const { data, info } = await sharp(fullPath)
      .resize(50, 50, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const colorMap = new Map();
    for (let i = 0; i < data.length; i += info.channels) {
      const r = Math.round(data[i] / 16) * 16;
      const g = Math.round(data[i + 1] / 16) * 16;
      const b = Math.round(data[i + 2] / 16) * 16;
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }

    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([hex]) => hex);
  } catch (error) {
    console.warn('Erreur extraction couleur:', error.message);
    return [];
  }
}

/**
 * Génère le profil artiste avec OpenAI
 */
async function generateProfileWithAI(artworks, artistName) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('demo')) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const artworksData = artworks.map(a => ({
    title: a.title,
    medium: a.medium,
    style: a.style,
    description: a.description,
    year: a.year,
    dimensions: a.dimensions,
    colorPalette: a.colorPalette || []
  }));

  const prompt = `Tu es un expert en art contemporain. Analyse ces œuvres de l'artiste "${artistName}" et génère un profil artistique complet.

ŒUVRES:
${JSON.stringify(artworksData, null, 2)}

Génère un JSON strict avec cette structure:
{
  "bio": "string (150 mots max, style artistique, français)",
  "story": "string (pourquoi il/elle crée, sa motivation, 100 mots max, français, ton personnel et chaleureux)",
  "tags": ["string"], // 5 tags max décrivant le style
  "colorPalette": ["#HEX"], // 6 couleurs hex dominantes de son travail
  "styleSignature": "string", // Nom du style (ex: "Abstraction Lyrique", "Réalisme Contemporain", "Art Brut Digital")
  "layoutType": "grid" | "masonry" | "spotlight" | "timeline" // Type de mise en page recommandé pour son portfolio
}

Règles:
- La bio doit être évocatrice, professionnelle, en français
- La story doit révéler l'intention artistique, le "pourquoi" de sa création
- Les tags doivent être précis et variés (mouvement, technique, émotion)
- La palette doit refléter ses couleurs récurrentes
- Le styleSignature doit être un nom accrocheur et reconnaissable
- Le layoutType dépend du nombre et du type d'œuvres:
  * "grid": œuvres très cohérentes, même format
  * "masonry": œuvres variées en taille
  * "spotlight": quelques œuvres fortes, impact visuel
  * "timeline": évolution stylistique visible

Réponds UNIQUEMENT avec le JSON, sans markdown, sans explication.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu es un assistant qui génère des profils artistiques. Réponds uniquement en JSON valide.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  // Nettoyer le JSON (parfois OpenAI ajoute des backticks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Réponse OpenAI non valide');
  }
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Génère des données mockées réalistes en fallback
 */
function generateMockProfile(artworks, artistName) {
  const styles = [
    { name: 'Abstraction Lyrique', tags: ['Abstrait', 'Expressionnisme', 'Couleurs vives', 'Émotion', 'Contemporain'] },
    { name: 'Réalisme Contemporain', tags: ['Réalisme', 'Portrait', 'Technique', 'Détail', 'Moderne'] },
    { name: 'Art Brut Digital', tags: ['Brut', 'Raw', 'Authentique', 'Énergie', 'Urbain'] },
    { name: 'Minimalisme Épuré', tags: ['Minimaliste', 'Géométrie', 'Épure', 'Élégance', 'Essentiel'] },
    { name: 'Surréalisme Moderne', tags: ['Surréaliste', 'Onirique', 'Symbolique', 'Mystère', 'Imaginaire'] },
    { name: 'Impressionnisme Urbain', tags: ['Impressionniste', 'Lumière', 'Mouvement', 'Ville', 'Atmosphère'] }
  ];
  
  const layouts = ['grid', 'masonry', 'spotlight', 'timeline'];
  const colorPalettes = [
    ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#eaeaea', '#ffd700'],
    ['#2d3436', '#636e72', '#b2bec3', '#dfe6e9', '#0984e3', '#74b9ff'],
    ['#2c003e', '#510a32', '#801336', '#c72c41', '#ee4540', '#ff6b6b'],
    ['#1e272e', '#485460', '#808e9b', '#d2dae2', '#ff9f43', '#feca57'],
    ['#0c2461', '#1e3799', '#4a69bd', '#6a89cc', '#82ccdd', '#b8e994']
  ];

  // Choisir un style basé sur le hash du nom
  const styleIndex = artistName.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % styles.length;
  const layoutIndex = artworks.length > 10 ? 1 : (artworks.length > 5 ? 0 : 2);
  const paletteIndex = artistName.length % colorPalettes.length;
  
  const style = styles[styleIndex];

  return {
    bio: `${artistName} explore les frontières entre l'intention et l'accident, créant des œuvres qui invitent le spectateur à une contemplation profonde. Son approche unique mêle technique maîtrisée et spontanéité, donnant naissance à des compositions qui résonnent avec une émotion authentique. Chaque pièce est une invitation à découvrir de nouvelles perspectives, où la couleur et la forme dialoguent dans une harmonie singulière. Son travail a été exposé dans plusieurs galeries et fait partie de collections privées internationales.`,
    story: `Je crée parce que les mots ne suffisent pas. L'art est ma façon de traduire l'invisible, de donner forme aux émotions qui habitent mes silences. Chaque toile est un fragment de mon histoire, une bataille entre le chaos et l'ordre. Je cherche à capturer ces instants fugaces où tout bascule, où la beauté émerge de l'imperfection. Mon atelier est mon refuge, l'endroit où le temps s'arrête et où je peux enfin respirer.`,
    tags: style.tags,
    colorPalette: colorPalettes[paletteIndex],
    styleSignature: style.name,
    layoutType: layouts[layoutIndex],
    _mock: true
  };
}

// POST /api/artists/generate-profile
router.post('/generate-profile', requireAuth, async (req, res) => {
  try {
    const artistId = req.user.id;
    
    // 1. Récupérer les infos de l'artiste
    const artist = await dbGet(
      'SELECT id, name, email, bio FROM users WHERE id = ? AND role = ?',
      [artistId, 'artist']
    );
    
    if (!artist) {
      return res.status(404).json({ error: 'Artiste non trouvé' });
    }

    // 2. Récupérer toutes les œuvres de l'artiste
    const artworks = await dbAll(
      'SELECT * FROM artworks WHERE artist_id = ? ORDER BY created_at DESC',
      [artistId]
    );

    if (artworks.length === 0) {
      return res.status(400).json({ 
        error: 'Aucune œuvre trouvée',
        message: 'Ajoutez au moins une œuvre avant de générer votre profil'
      });
    }

    // 3. Extraire les palettes de couleurs des œuvres
    const artworksWithColors = await Promise.all(
      artworks.map(async (artwork) => {
        if (artwork.image_url) {
          const colors = await extractColorFromImage(artwork.image_url);
          return { ...artwork, colorPalette: colors };
        }
        return artwork;
      })
    );

    // 4. Générer le profil (OpenAI ou Mock)
    let profileData;
    let usedMock = false;
    
    try {
      profileData = await generateProfileWithAI(artworksWithColors, artist.name);
    } catch (aiError) {
      console.warn('OpenAI indisponible, utilisation du fallback:', aiError.message);
      profileData = generateMockProfile(artworksWithColors, artist.name);
      usedMock = true;
    }

    // 5. Mettre à jour ou créer l'entrée dans la table artists
    const existingArtist = await dbGet('SELECT id FROM artists WHERE userId = ?', [artistId]);
    
    const now = new Date().toISOString();
    const tagsJson = JSON.stringify(profileData.tags);
    const paletteJson = JSON.stringify(profileData.colorPalette);
    
    if (existingArtist) {
      // Mise à jour
      await dbRun(
        `UPDATE artists SET 
          bio = ?, story = ?, tags = ?, colorPalette = ?, 
          styleSignature = ?, layoutType = ?, updatedAt = ?
         WHERE userId = ?`,
        [
          profileData.bio,
          profileData.story,
          tagsJson,
          paletteJson,
          profileData.styleSignature,
          profileData.layoutType,
          now,
          artistId
        ]
      );
    } else {
      // Création
      await dbRun(
        `INSERT INTO artists 
          (userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          artistId,
          artist.name,
          artist.email,
          profileData.bio,
          profileData.story,
          tagsJson,
          paletteJson,
          profileData.styleSignature,
          profileData.layoutType,
          now,
          now
        ]
      );
    }

    // 6. Mettre à jour aussi la table users (pour compatibilité existante)
    await dbRun(
      `UPDATE users SET 
        ai_bio = ?, 
        ai_statement = ?, 
        ai_style_tags = ?,
        ai_generated_at = ?
       WHERE id = ?`,
      [
        profileData.bio,
        profileData.story,
        tagsJson,
        now,
        artistId
      ]
    );

    res.json({
      success: true,
      profile: {
        ...profileData,
        artworkCount: artworks.length
      },
      usedMock,
      message: usedMock 
        ? 'Profil généré avec des données de démonstration (OpenAI non configuré)'
        : 'Profil généré avec succès via IA'
    });

  } catch (err) {
    console.error('Erreur génération profil:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la génération du profil',
      details: err.message 
    });
  }
});

// GET /api/artists/profile/:userId (récupérer le profil généré)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await dbGet(
      'SELECT * FROM artists WHERE userId = ?',
      [userId]
    );
    
    if (!profile) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }
    
    // Parser les JSON
    const result = {
      ...profile,
      tags: JSON.parse(profile.tags || '[]'),
      colorPalette: JSON.parse(profile.colorPalette || '[]')
    };
    
    res.json({ profile: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artists (liste existante - enrichie avec les profils)
router.get('/', async (req, res) => {
  try {
    const artists = await dbAll(`
      SELECT u.id, u.name, u.bio, u.avatar_url, u.location, u.website, u.instagram,
             u.plan, u.ai_bio, u.ai_statement, u.ai_style_tags,
             a.story, a.tags as artist_tags, a.colorPalette, a.styleSignature, a.layoutType,
             COUNT(aw.id) as artwork_count
      FROM users u 
      LEFT JOIN artists a ON a.userId = u.id
      LEFT JOIN artworks aw ON aw.artist_id = u.id
      WHERE u.role = 'artist' 
      GROUP BY u.id 
      ORDER BY u.name`);
      
    const result = artists.map(a => ({
      ...a,
      ai_style_tags: a.ai_style_tags ? (() => { try { return JSON.parse(a.ai_style_tags); } catch { return []; } })() : [],
      artist_tags: a.artist_tags ? (() => { try { return JSON.parse(a.artist_tags); } catch { return []; } })() : [],
      colorPalette: a.colorPalette ? (() => { try { return JSON.parse(a.colorPalette); } catch { return []; } })() : []
    }));
    
    res.json({ artists: result, total: result.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/artists/featured
router.get('/featured', async (req, res) => {
  try {
    const artists = await dbAll(`
      SELECT u.id, u.name, u.bio, u.avatar_url, u.location, u.plan,
             a.styleSignature, a.layoutType,
             COUNT(aw.id) as artwork_count
      FROM users u 
      LEFT JOIN artists a ON a.userId = u.id
      LEFT JOIN artworks aw ON aw.artist_id = u.id
      WHERE u.role = 'artist' 
      GROUP BY u.id 
      ORDER BY artwork_count DESC 
      LIMIT 6`);
    res.json({ artists, total: artists.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/artists/:id
router.get('/:id', async (req, res) => {
  try {
    const artist = await dbGet(`
      SELECT u.*, a.bio as generated_bio, a.story, a.tags, a.colorPalette, 
             a.styleSignature, a.layoutType,
             COUNT(aw.id) as artwork_count 
      FROM users u
      LEFT JOIN artists a ON a.userId = u.id
      LEFT JOIN artworks aw ON aw.artist_id = u.id
      WHERE u.id = ? AND u.role = 'artist' 
      GROUP BY u.id`, [req.params.id]);
      
    if (!artist) return res.status(404).json({ error: 'Artiste introuvable' });
    
    const artworks = await dbAll(
      'SELECT * FROM artworks WHERE artist_id = ? ORDER BY created_at DESC', 
      [req.params.id]
    );
    
    const { password_hash, ...safeArtist } = artist;
    
    // Parser les JSON
    if (safeArtist.ai_style_tags) { 
      try { safeArtist.ai_style_tags = JSON.parse(safeArtist.ai_style_tags); } catch { safeArtist.ai_style_tags = []; } 
    }
    if (safeArtist.tags) { 
      try { safeArtist.tags = JSON.parse(safeArtist.tags); } catch { safeArtist.tags = []; } 
    }
    if (safeArtist.colorPalette) { 
      try { safeArtist.colorPalette = JSON.parse(safeArtist.colorPalette); } catch { safeArtist.colorPalette = []; } 
    }
    
    res.json({ artist: safeArtist, artworks });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
