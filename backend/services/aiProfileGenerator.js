/** * Service d'analyse IA pour la génération de profils artistes * Utilise OpenAI GPT-4 pour analyser les œuvres et générer un profil artistique complet * * @module services/aiProfileGenerator */

const { OpenAI } = require('openai');
const crypto = require('crypto');

// Configuration du client OpenAI (lazy loading)
let openai = null;
function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is missing');
    }
    openai = new OpenAI({
      apiKey: apiKey,
      timeout: 30000, // 30 secondes timeout
      maxRetries: 3
    });
  }
  return openai;
}

// Cache simple en mémoire pour éviter les appels répétés (TTL: 24h)
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.TTL = 86400000; // 24h en ms
    
    // Nettoyage automatique toutes les heures
    setInterval(() => this.cleanup(), 3600000);
  }
  
  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp) return undefined;
    
    if (Date.now() - timestamp > this.TTL) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return undefined;
    }
    
    return this.cache.get(key);
  }
  
  set(key, value) {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
    return true;
  }
  
  flushAll() {
    this.cache.clear();
    this.timestamps.clear();
  }
  
  getStats() {
    return {
      keys: this.cache.size,
      hits: 'N/A',
      misses: 'N/A'
    };
  }
  
  keys() {
    return Array.from(this.cache.keys());
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps) {
      if (now - timestamp > this.TTL) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }
}

const profileCache = new SimpleCache();

// Modèle par défaut
const DEFAULT_MODEL = 'gpt-4-turbo-preview';

/**
 * Génère un hash unique pour le cache basé sur les œuvres
 * @param {Array} artworks - Tableau d'œuvres
 * @returns {string} Hash MD5
 */
function generateCacheKey(artworks) {
  const normalized = artworks
    .map(a => ({
      title: a.title || '',
      description: a.description || '',
      style: a.style || '',
      price: a.price || 0
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return crypto.createHash('md5').update(JSON.stringify(normalized)).digest('hex');
}

/**
 * Calcule les statistiques des prix
 * @param {Array} artworks - Tableau d'œuvres avec prix
 * @returns {Object} Statistiques de prix
 */
function calculatePriceStats(artworks) {
  const prices = artworks
    .map(a => parseFloat(a.price))
    .filter(p => !isNaN(p) && p > 0);
  
  if (prices.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0, range: 'Non spécifié' };
  }
  
  const sorted = prices.sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  // Formatage de la fourchette
  let range;
  if (min === max) {
    range = `${min.toFixed(0)}€`;
  } else {
    range = `${min.toFixed(0)}€ - ${max.toFixed(0)}€`;
  }
  
  return { min, max, average: Math.round(average), median: Math.round(median), range };
}

/**
 * Extrait les styles uniques des œuvres
 * @param {Array} artworks - Tableau d'œuvres
 * @returns {Array} Styles uniques
 */
function extractStyles(artworks) {
  const styles = artworks
    .map(a => a.style)
    .filter(Boolean)
    .flatMap(s => s.split(/[,;\/]/).map(st => st.trim()))
    .filter((v, i, a) => a.indexOf(v) === i);
  return [...new Set(styles)];
}

/**
 * Génère un profil artistique via OpenAI GPT-4
 * @param {Array} artworks - Tableau d'œuvres de l'artiste
 * @param {Object} options - Options de génération
 * @param {string} options.language - Langue de sortie (fr, en, etc.)
 * @param {string} options.model - Modèle OpenAI à utiliser
 * @returns {Promise<Object>} Profil artistique généré
 */
async function generateArtistProfile(artworks, options = {}) {
  // Validation des entrées
  if (!Array.isArray(artworks) || artworks.length === 0) {
    throw new Error(' artworks array is required and must not be empty');
  }
  
  const { language = 'fr', model = DEFAULT_MODEL } = options;
  
  // Vérification du cache
  const cacheKey = generateCacheKey(artworks);
  const cached = profileCache.get(cacheKey);
  if (cached) {
    console.log('[AI Profile] Cache hit, returning cached profile');
    return { ...cached, fromCache: true };
  }
  
  try {
    // Préparation des données pour l'analyse
    const priceStats = calculatePriceStats(artworks);
    const styles = extractStyles(artworks);
    
    // Construction du prompt système
    const systemPrompt = buildSystemPrompt(language);
    
    // Construction du prompt utilisateur avec les données des œuvres
    const userPrompt = buildUserPrompt(artworks, priceStats, styles, language);
    
    console.log('[AI Profile] Calling OpenAI API...');
    const startTime = Date.now();
    
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });
    
    const duration = Date.now() - startTime;
    console.log(`[AI Profile] API call completed in ${duration}ms`);
    
    // Parsing de la réponse
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    const profile = JSON.parse(content);
    
    // Validation de la structure
    const validatedProfile = validateProfile(profile);
    
    // Enrichissement avec métadonnées
    const result = {
      ...validatedProfile,
      metadata: {
        artworksAnalyzed: artworks.length,
        priceRange: priceStats.range,
        detectedStyles: styles,
        generatedAt: new Date().toISOString(),
        model: model,
        language: language,
        tokensUsed: response.usage?.total_tokens || 0
      },
      fromCache: false
    };
    
    // Stockage dans le cache
    profileCache.set(cacheKey, result);
    
    return result;
    
  } catch (error) {
    console.error('[AI Profile] OpenAI API error:', error.message);
    
    // Fallback sur génération locale
    console.log('[AI Profile] Falling back to local generation...');
    const fallbackProfile = generateLocalFallback(artworks, priceStats, styles, language);
    
    return {
      ...fallbackProfile,
      metadata: {
        artworksAnalyzed: artworks.length,
        priceRange: priceStats?.range || 'Non spécifié',
        detectedStyles: styles || [],
        generatedAt: new Date().toISOString(),
        model: 'local-fallback',
        language: language,
        error: error.message
      },
      fromCache: false,
      isFallback: true
    };
  }
}

/**
 * Construit le prompt système pour l'IA
 * @param {string} language - Langue cible
 * @returns {string} Prompt système
 */
function buildSystemPrompt(language) {
  const prompts = {
    fr: `Tu es un expert en analyse artistique et en rédaction de profils créatifs. 
Ta mission est d'analyser un portfolio d'œuvres d'art et de générer un profil artistique complet et captivant.

Tu dois retourner UNIQUEMENT un objet JSON valide avec cette structure exacte:
{
  "bio": "narrative captivante de 2-3 phrases décrivant l'artiste et son univers",
  "story": "motivation artistique, parcours et vision en 4-5 phrases",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "colorPalette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "styleSignature": "nom unique et évocateur du style de l'artiste",
  "layoutType": "minimaliste|galerie|mosaique|immersion|narratif"
}

Règles:
- La bio doit être engageante et donner envie d'explorer l'œuvre
- L'histoire doit révéler l'âme et les inspirations de l'artiste
- Les tags doivent être pertinents pour la découverte (5 max)
- La palette doit refléter les couleurs dominantes suggérées
- Le styleSignature doit être mémorable et unique
- Le layoutType recommande la meilleure présentation`,

    en: `You are an expert in artistic analysis and creative profile writing.
Your mission is to analyze an art portfolio and generate a complete, captivating artist profile.

Return ONLY a valid JSON object with this exact structure:
{
  "bio": "captivating 2-3 sentence narrative describing the artist and their universe",
  "story": "artistic motivation, journey and vision in 4-5 sentences",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "colorPalette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "styleSignature": "unique and evocative name for the artist's style",
  "layoutType": "minimal|gallery|mosaic|immersive|narrative"
}

Rules:
- Bio must be engaging and invite exploration
- Story must reveal the artist's soul and inspirations
- Tags must be relevant for discovery (max 5)
- Palette should reflect dominant suggested colors
- StyleSignature must be memorable and unique
- LayoutType recommends the best presentation format`
  };
  
  return prompts[language] || prompts.fr;
}

/**
 * Construit le prompt utilisateur avec les données des œuvres
 * @param {Array} artworks - Œuvres à analyser
 * @param {Object} priceStats - Statistiques de prix
 * @param {Array} styles - Styles détectés
 * @param {string} language - Langue
 * @returns {string} Prompt utilisateur
 */
function buildUserPrompt(artworks, priceStats, styles, language) {
  const artworksData = artworks.map((artwork, index) => ({
    index: index + 1,
    title: artwork.title || 'Sans titre',
    description: artwork.description || 'Aucune description',
    style: artwork.style || 'Non spécifié',
    price: artwork.price ? `${artwork.price}€` : 'Non spécifié',
    medium: artwork.medium || 'Non spécifié',
    dimensions: artwork.dimensions || 'Non spécifiées',
    year: artwork.year || 'Non spécifiée'
  }));
  
  const summary = {
    totalWorks: artworks.length,
    priceRange: priceStats.range,
    averagePrice: priceStats.average > 0 ? `${priceStats.average}€` : 'Non calculable',
    detectedStyles: styles.length > 0 ? styles : ['Divers'],
    mediums: [...new Set(artworks.map(a => a.medium).filter(Boolean))],
    yearRange: calculateYearRange(artworks)
  };
  
  if (language === 'fr') {
    return `ANALYSE DE PORTFOLIO ARTISTIQUE

=== RÉSUMÉ ===
${JSON.stringify(summary, null, 2)}

=== ŒUVRES ===
${JSON.stringify(artworksData, null, 2)}

Génère un profil artistique complet basé sur cette analyse. Sois créatif, authentique et percutant.`;
  } else {
    return `ARTIST PORTFOLIO ANALYSIS

=== SUMMARY ===
${JSON.stringify(summary, null, 2)}

=== ARTWORKS ===
${JSON.stringify(artworksData, null, 2)}

Generate a complete artist profile based on this analysis. Be creative, authentic, and impactful.`;
  }
}

/**
 * Calcule la fourchette d'années
 * @param {Array} artworks - Œuvres
 * @returns {string} Fourchette d'années
 */
function calculateYearRange(artworks) {
  const years = artworks
    .map(a => parseInt(a.year))
    .filter(y => !isNaN(y) && y > 1000 && y < 2100);
  
  if (years.length === 0) return 'Non spécifiée';
  
  const min = Math.min(...years);
  const max = Math.max(...years);
  
  return min === max ? `${min}` : `${min}-${max}`;
}

/**
 * Valide et corrige la structure du profil généré
 * @param {Object} profile - Profil à valider
 * @returns {Object} Profil validé
 */
function validateProfile(profile) {
  const defaults = {
    bio: 'Artiste créatif passionné par la création d\'œuvres uniques et émouvantes.',
    story: 'Son parcours artistique est marqué par une exploration constante de nouvelles techniques et expressions. Chaque œuvre raconte une histoire, invite à la contemplation et éveille les émotions. Inspiré par le monde qui l\'entoure, il transforme ses visions en créations tangibles qui résonnent avec le public.',
    tags: ['contemporain', 'original', 'émouvant'],
    colorPalette: ['#2C3E50', '#E74C3C', '#ECF0F1', '#3498DB', '#F39C12'],
    styleSignature: 'Style Contemporain Expressif',
    layoutType: 'galerie'
  };
  
  return {
    bio: typeof profile.bio === 'string' && profile.bio.length > 10 
      ? profile.bio 
      : defaults.bio,
    story: typeof profile.story === 'string' && profile.story.length > 20 
      ? profile.story 
      : defaults.story,
    tags: Array.isArray(profile.tags) && profile.tags.length > 0 
      ? profile.tags.slice(0, 5) 
      : defaults.tags,
    colorPalette: Array.isArray(profile.colorPalette) && profile.colorPalette.length >= 3 
      ? profile.colorPalette.slice(0, 6).map(c => validateHexColor(c)).filter(Boolean)
      : defaults.colorPalette,
    styleSignature: typeof profile.styleSignature === 'string' && profile.styleSignature.length > 3 
      ? profile.styleSignature 
      : defaults.styleSignature,
    layoutType: ['minimaliste', 'minimal', 'galerie', 'gallery', 'mosaique', 'mosaic', 'immersion', 'immersive', 'narratif', 'narrative'].includes(profile.layoutType)
      ? normalizeLayoutType(profile.layoutType)
      : defaults.layoutType
  };
}

/**
 * Normalise le type de layout
 * @param {string} layout - Layout à normaliser
 * @returns {string} Layout normalisé
 */
function normalizeLayoutType(layout) {
  const mapping = {
    'minimal': 'minimaliste',
    'gallery': 'galerie',
    'mosaic': 'mosaique',
    'immersive': 'immersion',
    'narrative': 'narratif'
  };
  return mapping[layout] || layout;
}

/**
 * Valide et corrige une couleur hexadécimale
 * @param {string} color - Couleur à valider
 * @returns {string|null} Couleur validée ou null
 */
function validateHexColor(color) {
  if (typeof color !== 'string') return null;
  
  // Nettoie la couleur
  let hex = color.trim();
  
  // Ajoute le # si manquant
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  
  // Valide le format hex
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (hexRegex.test(hex)) {
    return hex.toUpperCase();
  }
  
  // Essaie de compléter les couleurs courtes (#RGB)
  const shortHexRegex = /^#[0-9A-Fa-f]{3}$/;
  if (shortHexRegex.test(hex)) {
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  
  return null;
}

/**
 * Génération de fallback locale quand l'API est indisponible
 * @param {Array} artworks - Œuvres
 * @param {Object} priceStats - Statistiques de prix
 * @param {Array} styles - Styles détectés
 * @param {string} language - Langue
 * @returns {Object} Profil généré localement
 */
function generateLocalFallback(artworks, priceStats, styles, language) {
  const isFrench = language === 'fr';
  
  // Analyse simple pour générer des données pertinentes
  const allTitles = artworks.map(a => a.title || '').join(' ');
  const allDescriptions = artworks.map(a => a.description || '').join(' ');
  const allText = (allTitles + ' ' + allDescriptions).toLowerCase();
  
  // Détection de mots-clés simple
  const keywords = {
    nature: ['nature', 'paysage', 'fleur', 'arbre', 'mer', 'montagne', 'forêt'],
    urbain: ['ville', 'urbain', 'rue', 'architecture', 'bâtiment', 'graffiti'],
    abstrait: ['abstrait', 'géométrique', 'forme', 'couleur', 'texture'],
    portrait: ['portrait', 'visage', 'personne', 'figure', 'humain'],
    emotion: ['émotion', 'sentiment', 'rêve', 'souvenir', 'nostalgie']
  };
  
  const detectedThemes = [];
  for (const [theme, words] of Object.entries(keywords)) {
    if (words.some(w => allText.includes(w))) {
      detectedThemes.push(theme);
    }
  }
  
  // Sélection de tags basée sur les thèmes
  const tagOptions = {
    nature: isFrench ? ['nature', 'organique', 'paysagiste'] : ['nature', 'organic', 'landscape'],
    urbain: isFrench ? ['urbain', 'contemporain', 'street-art'] : ['urban', 'contemporary', 'street-art'],
    abstrait: isFrench ? ['abstrait', 'géométrique', 'moderne'] : ['abstract', 'geometric', 'modern'],
    portrait: isFrench ? ['portrait', 'figuratif', 'humain'] : ['portrait', 'figurative', 'human'],
    emotion: isFrench ? ['émotionnel', 'expressif', 'intime'] : ['emotional', 'expressive', 'intimate']
  };
  
  const selectedTags = detectedThemes
    .flatMap(t => tagOptions[t] || [])
    .slice(0, 5);
  
  if (selectedTags.length < 3) {
    selectedTags.push(...(isFrench 
      ? ['contemporain', 'original', 'créatif']
      : ['contemporary', 'original', 'creative']
    ));
  }
  
  // Génération de la palette basée sur les thèmes
  const palettes = {
    nature: ['#2E7D32', '#8BC34A', '#4CAF50', '#C8E6C9', '#1B5E20'],
    urbain: ['#424242', '#757575', '#BDBDBD', '#212121', '#616161'],
    abstrait: ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3'],
    portrait: ['#FF9800', '#F57C00', '#E65100', '#FFE0B2', '#BF360C'],
    emotion: ['#F44336', '#E53935', '#FFEBEE', '#B71C1C', '#EF9A9A']
  };
  
  const selectedPalette = detectedThemes.length > 0 
    ? palettes[detectedThemes[0]] || palettes.nature
    : ['#3F51B5', '#E91E63', '#FFC107', '#4CAF50', '#9C27B0'];
  
  // Génération du style signature
  const signatureAdjectives = isFrench 
    ? ['Épuré', 'Expressif', 'Harmonieux', 'Audacieux', 'Poétique', 'Dynamique']
    : ['Refined', 'Expressive', 'Harmonious', 'Bold', 'Poetic', 'Dynamic'];
  
  const signatureNouns = isFrench
    ? ['Contemporain', 'Moderne', 'Singulier', 'Vibrant', 'Organique']
    : ['Contemporary', 'Modern', 'Unique', 'Vibrant', 'Organic'];
  
  const adj = signatureAdjectives[Math.floor(Math.random() * signatureAdjectives.length)];
  const noun = signatureNouns[Math.floor(Math.random() * signatureNouns.length)];
  const styleSignature = `${adj} ${noun}`;
  
  // Génération de la bio et story
  const bio = isFrench
    ? `Artiste ${detectedThemes.length > 0 ? detectedThemes[0] : 'créatif'} explorant l'essence de ${detectedThemes.includes('emotion') ? 'l\'émotion humaine' : 'la beauté visuelle'} à travers des œuvres ${priceStats.average > 500 ? 'raffinées' : 'accessibles'}. Son approche ${styles.length > 0 ? styles[0] : 'unique'} crée des ponts entre tradition et innovation.`
    : `${detectedThemes.length > 0 ? detectedThemes[0] : 'Creative'} artist exploring the essence of ${detectedThemes.includes('emotion') ? 'human emotion' : 'visual beauty'} through ${priceStats.average > 500 ? 'refined' : 'accessible'} works. Their ${styles.length > 0 ? styles[0] : 'unique'} approach bridges tradition and innovation.`;
  
  const story = isFrench
    ? `Le parcours de cet artiste est une quête constante de ${detectedThemes.includes('nature') ? 'l\'harmonie naturelle' : 'l\'expression authentique'}. Influencé par ${styles.length > 0 ? styles.join(' et ') : 'les maîtres classiques et les mouvements contemporains'}, il développe un langage visuel qui lui est propre. Chaque création est une invitation à ralentir, observer et ressentir. Avec ${artworks.length} œuvres dans son portfolio${priceStats.average > 0 ? ` et des prix moyennant autour de ${priceStats.average}€` : ''}, il partage sa vision avec un public toujours plus large.`
    : `This artist's journey is a constant quest for ${detectedThemes.includes('nature') ? 'natural harmony' : 'authentic expression'}. Influenced by ${styles.length > 0 ? styles.join(' and ') : 'classical masters and contemporary movements'}, they develop a unique visual language. Each creation is an invitation to slow down, observe, and feel. With ${artworks.length} works in their portfolio${priceStats.average > 0 ? ` and prices averaging around ${priceStats.average}€` : ''}, they share their vision with an ever-growing audience.`;
  
  // Détermination du layout
  const layoutTypes = ['galerie', 'gallery', 'minimal', 'minimaliste', 'mosaique', 'mosaic'];
  const layoutType = artworks.length > 6 ? 'galerie' : (artworks.length > 3 ? 'mosaique' : 'minimaliste');
  
  return {
    bio,
    story,
    tags: [...new Set(selectedTags)].slice(0, 5),
    colorPalette: selectedPalette,
    styleSignature,
    layoutType
  };
}

/**
 * Vide le cache des profils
 */
function clearCache() {
  profileCache.flushAll();
  console.log('[AI Profile] Cache cleared');
}

/**
 * Récupère les statistiques du cache
 * @returns {Object} Statistiques
 */
function getCacheStats() {
  return {
    keys: profileCache.keys(),
    stats: profileCache.getStats()
  };
}

/**
 * Prévisualise le prompt qui serait envoyé à OpenAI (pour debug)
 * @param {Array} artworks - Œuvres
 * @param {string} language - Langue
 * @returns {Object} Prompts
 */
function previewPrompt(artworks, language = 'fr') {
  const priceStats = calculatePriceStats(artworks);
  const styles = extractStyles(artworks);
  
  return {
    system: buildSystemPrompt(language),
    user: buildUserPrompt(artworks, priceStats, styles, language),
    artworkCount: artworks.length,
    estimatedTokens: Math.ceil((buildSystemPrompt(language).length + buildUserPrompt(artworks, priceStats, styles, language).length) / 4)
  };
}

module.exports = {
  generateArtistProfile,
  clearCache,
  getCacheStats,
  previewPrompt,
  generateCacheKey,
  calculatePriceStats,
  extractStyles
};