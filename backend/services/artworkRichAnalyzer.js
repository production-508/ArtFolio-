const OpenAI = require('openai');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { dbGet } = require('../db/database');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class ArtworkRichAnalyzer {
  constructor() {
    this.EMOTION_TAGS = [
      'sérénité', 'dynamisme', 'mélancolie', 'joie', 'introspection',
      'puissance', 'fragilité', 'mystère', 'chaleur', 'froid',
      'nostalgie', 'espoir', 'tension', 'harmonie', 'chaos'
    ];
  }

  /**
   * Analyse complète d'une œuvre : Vision + OCR + Contexte artiste
   */
  async analyzeArtwork(artworkId) {
    console.log(`🔍 Analyse Rich Document pour œuvre #${artworkId}`);

    // 1. Récupérer l'œuvre et l'artiste
    const artwork = await dbGet(`
      SELECT a.*, u.name as artist_name, u.bio as artist_bio,
             u.ai_bio, u.ai_statement, u.ai_style_tags, u.location
      FROM artworks a
      JOIN users u ON u.id = a.artist_id
      WHERE a.id = ?
    `, [artworkId]);

    if (!artwork) {
      throw new Error(`Œuvre #${artworkId} introuvable`);
    }

    // 2. Analyse visuelle (Vision API)
    const visualAnalysis = await this.analyzeVisual(artwork);

    // 3. OCR (texte détecté sur l'image)
    const ocrResult = await this.analyzeOCR(artwork);

    // 4. Analyse des couleurs (déjà existante)
    const colorAnalysis = await this.analyzeColors(artwork);

    // 5. Générer le Rich Document
    const richDocument = await this.generateRichDocument({
      artwork,
      visualAnalysis,
      ocrResult,
      colorAnalysis
    });

    // 6. Sauvegarder en base
    await this.saveAnalysis(artworkId, richDocument);

    return richDocument;
  }

  /**
   * Analyse visuelle avec GPT-4o Vision
   */
  async analyzeVisual(artwork) {
    try {
      const imagePath = path.join(__dirname, '..', 'public', artwork.image_url);
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en analyse d'art. Décris cette œuvre visuellement en détail.
            Format de réponse JSON strict:
            {
              "description_visuelle": "description détaillée en français",
              "sujet_principal": "ce qui est représenté",
              "composition": "organisation spatiale",
              "technique_apparente": "style de pinceau, texture",
              "atmosphere": "ambiance générale",
              "emotion_dominante": "une émotion clé",
              "references_art": "artistes ou mouvements rappelés",
              "elements_cles": ["élément 1", "élément 2"]
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyse cette œuvre. Contexte: "${artwork.title}" par ${artwork.artist_name}. ${artwork.description || 'Aucune description fournie.'}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Erreur Vision API:', error);
      return {
        description_visuelle: 'Analyse visuelle indisponible',
        sujet_principal: artwork.description || 'Non identifié',
        composition: 'Non analysée',
        technique_apparente: artwork.medium || 'Non identifiée',
        atmosphere: 'Non déterminée',
        emotion_dominante: 'Neutre',
        references_art: '',
        elements_cles: []
      };
    }
  }

  /**
   * OCR avec GPT-4o Vision
   */
  async analyzeOCR(artwork) {
    try {
      const imagePath = path.join(__dirname, '..', 'public', artwork.image_url);
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Extrais tout texte visible sur cette image d'œuvre d'art.
            Format JSON:
            {
              "textes_detectes": ["texte 1", "texte 2"],
              "signature": "signature détectée ou null",
              "date": "date détectée ou null",
              "titre_sur_oeuvre": "titre écrit sur l'œuvre ou null",
              "localisation_textes": "où sont les textes (coin, bas, etc.)"
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 400,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Erreur OCR:', error);
      return {
        textes_detectes: [],
        signature: null,
        date: null,
        titre_sur_oeuvre: null,
        localisation_textes: null
      };
    }
  }

  /**
   * Analyse des couleurs avec Sharp
   */
  async analyzeColors(artwork) {
    try {
      const imagePath = path.join(__dirname, '..', 'public', artwork.image_url);
      const { data, info } = await sharp(imagePath)
        .resize(100, 100, { fit: 'cover' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const colorMap = new Map();
      for (let i = 0; i < data.length; i += info.channels) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }

      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hex, count]) => ({
          hex,
          percentage: Math.round((count / (data.length / info.channels)) * 100),
          name: this.getColorName(hex)
        }));

      // Déterminer la température dominante
      const warmScore = sortedColors.reduce((sum, c) => {
        const r = parseInt(c.hex.slice(1, 3), 16);
        return sum + (r > 150 ? c.percentage : 0);
      }, 0);

      return {
        palette: sortedColors,
        temperature: warmScore > 50 ? 'chaude' : 'froide',
        luminosite: this.getLuminosity(sortedColors)
      };
    } catch (error) {
      console.error('Erreur analyse couleurs:', error);
      return { palette: [], temperature: 'neutre', luminosite: 'moyenne' };
    }
  }

  getColorName(hex) {
    const colors = {
      '#ff0000': 'rouge', '#00ff00': 'vert', '#0000ff': 'bleu',
      '#ffff00': 'jaune', '#ff00ff': 'magenta', '#00ffff': 'cyan',
      '#000000': 'noir', '#ffffff': 'blanc', '#808080': 'gris'
    };
    return colors[hex.toLowerCase()] || 'custom';
  }

  getLuminosity(palette) {
    const avg = palette.reduce((sum, c) => {
      const r = parseInt(c.hex.slice(1, 3), 16);
      const g = parseInt(c.hex.slice(3, 5), 16);
      const b = parseInt(c.hex.slice(5, 7), 16);
      return sum + (r + g + b) / 3;
    }, 0) / palette.length;

    if (avg > 200) return 'très claire';
    if (avg > 150) return 'claire';
    if (avg > 100) return 'moyenne';
    if (avg > 50) return 'sombre';
    return 'très sombre';
  }

  /**
   * Génère le Rich Document final
   */
  async generateRichDocument({ artwork, visualAnalysis, ocrResult, colorAnalysis }) {
    const artistStatement = artwork.ai_statement || '';
    const artistBio = artwork.ai_bio || artwork.artist_bio || '';
    const artistStyleTags = artwork.ai_style_tags ? JSON.parse(artwork.ai_style_tags) : [];

    // Combiner toutes les sources
    const richDocument = {
      metadata: {
        artwork_id: artwork.id,
        title: artwork.title,
        artist: artwork.artist_name,
        artist_location: artwork.location,
        medium: artwork.medium,
        style: artwork.style,
        dimensions: artwork.dimensions,
        year: artwork.year,
        price: artwork.price,
        analyzed_at: new Date().toISOString()
      },

      // Données de l'artiste (mots de l'artiste lui-même)
      artist_context: {
        statement: artistStatement,
        bio: artistBio,
        declared_style_tags: artistStyleTags,
        location: artwork.location
      },

      // Analyse visuelle (IA)
      visual_analysis: visualAnalysis,

      // OCR (texte sur l'œuvre)
      ocr: ocrResult,

      // Couleurs
      color_analysis: colorAnalysis,

      // Description fournie par l'artiste
      artist_description: artwork.description,

      // Rich Text combiné pour recherche sémantique
      searchable_text: this.generateSearchableText({
        artwork,
        visualAnalysis,
        artistStatement,
        artistBio,
        artistStyleTags,
        colorAnalysis
      }),

      // Tags enrichis
      enriched_tags: this.generateEnrichedTags({
        visualAnalysis,
        artistStyleTags,
        colorAnalysis,
        artwork
      }),

      // Résumé pour le chatbot
      chatbot_summary: this.generateChatbotSummary({
        artwork,
        visualAnalysis,
        colorAnalysis
      })
    };

    return richDocument;
  }

  generateSearchableText({ artwork, visualAnalysis, artistStatement, artistBio, artistStyleTags, colorAnalysis }) {
    const parts = [
      `Titre: ${artwork.title}`,
      `Artiste: ${artwork.artist_name}`,
      `Description artiste: ${artwork.description || ''}`,
      `Déclaration artiste: ${artistStatement}`,
      `Bio artiste: ${artistBio}`,
      `Style déclaré: ${artistStyleTags.join(', ')}`,
      `Style détecté: ${artwork.style}`,
      `Médium: ${artwork.medium}`,
      `Analyse visuelle: ${visualAnalysis.description_visuelle}`,
      `Sujet: ${visualAnalysis.sujet_principal}`,
      `Composition: ${visualAnalysis.composition}`,
      `Atmosphère: ${visualAnalysis.atmosphere}`,
      `Émotion: ${visualAnalysis.emotion_dominante}`,
      `Technique: ${visualAnalysis.technique_apparente}`,
      `Palette: ${colorAnalysis.palette.map(c => c.name).join(', ')}`,
      `Température: ${colorAnalysis.temperature}`,
      `Luminosité: ${colorAnalysis.luminosite}`
    ];

    return parts.join('. ');
  }

  generateEnrichedTags({ visualAnalysis, artistStyleTags, colorAnalysis, artwork }) {
    const tags = new Set([
      ...artistStyleTags,
      artwork.style,
      artwork.medium,
      visualAnalysis.emotion_dominante,
      ...visualAnalysis.elements_cles || [],
      colorAnalysis.temperature,
      colorAnalysis.luminosite
    ]);

    return Array.from(tags).filter(Boolean);
  }

  generateChatbotSummary({ artwork, visualAnalysis, colorAnalysis }) {
    return `"${artwork.title}" de ${artwork.artist_name} est une œuvre en ${artwork.medium.toLowerCase()} dans un style ${artwork.style.toLowerCase()}. ${visualAnalysis.description_visuelle} L'ambiance est ${visualAnalysis.atmosphere.toLowerCase()} avec une dominante ${colorAnalysis.temperature} et ${colorAnalysis.luminosite}.`;
  }

  /**
   * Sauvegarde en base de données
   */
  async saveAnalysis(artworkId, richDocument) {
    const { dbRun } = require('../db/database');

    await dbRun(`
      UPDATE artworks SET
        rich_document = ?,
        searchable_text = ?,
        enriched_tags = ?,
        chatbot_summary = ?,
        analyzed_at = datetime('now'),
        color_palette = ?,
        emotion_tags = ?
      WHERE id = ?
    `, [
      JSON.stringify(richDocument),
      richDocument.searchable_text,
      JSON.stringify(richDocument.enriched_tags),
      richDocument.chatbot_summary,
      JSON.stringify(richDocument.color_analysis.palette),
      JSON.stringify([richDocument.visual_analysis.emotion_dominante]),
      artworkId
    ]);

    console.log(`✅ Rich Document sauvegardé pour œuvre #${artworkId}`);
  }
}

module.exports = new ArtworkRichAnalyzer();
