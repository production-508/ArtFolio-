const express = require('express');
const OpenAI = require('openai');
const lancedbService = require('../services/lancedbService');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /api/chat/art-advisor
 * Chatbot expert d'art avec RAG (Retrieval Augmented Generation)
 */
router.post('/art-advisor', async (req, res) => {
  try {
    const { message, history = [], filters = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    // 1. Recherche sémantique des œuvres pertinentes
    const context = await lancedbService.getContextForChatbot(message, 3);

    // 2. Construire le prompt système
    const systemPrompt = `Tu es un conseiller d'art expert pour ArtFolio, une galerie d'art en ligne.

MISSION:
Aider les collectionneurs à trouver des œuvres qui correspondent à leurs goûts, leur budget et leur intérieur.

CONTEXTE DISPOBIBLE:
Tu as accès aux informations suivantes sur les œuvres:
- Description visuelle détaillée (générée par Vision AI)
- Palette de couleurs dominantes
- Émotions et atmosphère
- Style et technique
- Biographie et déclaration de l'artiste
- Mots-clés enrichis

ŒUVRES ACTUELLEMENT PERTINENTES:
${context}

RÈGLES:
1. Réponds de manière chaleureuse et professionnelle
2. Si une question porte sur une œuvre spécifique, réfère-toi au contexte fourni
3. Pour les recherches générales ("j'aime le bleu"), suggère des œuvres du contexte
4. Mentionne le prix quand c'est pertinent
5. Pose des questions pour affiner la recherche si besoin
6. Si aucune œuvre ne correspond, dis-le honnêtement et propose des alternatives

STYLE:
- Passionné mais pas prétentieux
- Concret, pas de jargon inutile
- Parle des émotions que l'œuvre procure`;

    // 3. Appel OpenAI avec contexte
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-5), // Garder les 5 derniers échanges
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 800
    });

    const reply = response.choices[0].message.content;

    // 4. Suggérer des œuvres spécifiques basées sur la recherche
    const suggestions = await lancedbService.search(message, { 
      limit: 3,
      filters 
    });

    res.json({
      reply,
      suggestions: suggestions.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist_name,
        price: s.price,
        image_url: s.image_url,
        relevance: s.relevance
      })),
      tokens_used: response.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('Erreur chatbot:', error);
    res.status(500).json({ 
      error: 'Erreur du conseiller',
      details: error.message 
    });
  }
});

/**
 * POST /api/chat/find-similar
 * Trouver des œuvres similaires à une œuvre donnée
 */
router.post('/find-similar', async (req, res) => {
  try {
    const { artwork_id, limit = 5 } = req.body;

    if (!artwork_id) {
      return res.status(400).json({ error: 'artwork_id requis' });
    }

    const similar = await lancedbService.findSimilar(artwork_id, limit);

    res.json({
      artwork_id,
      similar_artworks: similar,
      count: similar.length
    });

  } catch (error) {
    console.error('Erreur find-similar:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/analyze-artwork
 * Analyse interactive d'une œuvre spécifique
 */
router.post('/analyze-artwork', async (req, res) => {
  try {
    const { artwork_id, question } = req.body;
    const { dbGet } = require('../db/database');

    const artwork = await dbGet(`
      SELECT a.*, u.name as artist_name, a.rich_document
      FROM artworks a
      JOIN users u ON u.id = a.artist_id
      WHERE a.id = ?
    `, [artwork_id]);

    if (!artwork) {
      return res.status(404).json({ error: 'Œuvre introuvable' });
    }

    const richDoc = artwork.rich_document ? 
      JSON.parse(artwork.rich_document) : null;

    const context = richDoc ? `
TITRE: ${artwork.title}
ARTISTE: ${artwork.artist_name}
PRIX: ${artwork.price}€

DESCRIPTION DÉTAILLÉE:
${richDoc.visual_analysis?.description_visuelle || 'Non analysée'}

SUJET: ${richDoc.visual_analysis?.sujet_principal || 'N/A'}
ÉMOTION: ${richDoc.visual_analysis?.emotion_dominante || 'N/A'}
ATMOSPHÈRE: ${richDoc.visual_analysis?.atmosphere || 'N/A'}

PALETTE:
${richDoc.color_analysis?.palette?.map(c => `${c.name} (${c.hex}) ${c.percentage}%`).join(', ') || 'N/A'}

STATEMENT ARTISTE:
${richDoc.artist_context?.statement || 'Non fourni'}
    ` : `
TITRE: ${artwork.title}
ARTISTE: ${artwork.artist_name}
PRIX: ${artwork.price}€
DESCRIPTION: ${artwork.description || 'Aucune description'}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert d'art analysant une œuvre spécifique. Réponds à la question de l'utilisateur en te basant sur ces informations.`
        },
        {
          role: 'user',
          content: `Contexte de l'œuvre:\n${context}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    res.json({
      artwork_id,
      question,
      answer: response.choices[0].message.content,
      analyzed: !!richDoc
    });

  } catch (error) {
    console.error('Erreur analyze-artwork:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
