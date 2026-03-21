/**
 * Service de recherche intelligente pour ArtFolio
 * Recherche sémantique par texte + recherche visuelle par similarité
 */

const { OpenAI } = require('openai');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class SmartSearchService {
  constructor(db) {
    this.db = db;
    this.embeddingCache = new Map(); // Cache simple pour embeddings
  }

  /**
   * Générer un embedding vectoriel pour du texte
   */
  async generateTextEmbedding(text) {
    const cacheKey = text.slice(0, 100); // Simple cache par début de texte
    
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey);
    }

    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      const embedding = response.data[0].embedding;
      this.embeddingCache.set(cacheKey, embedding);
      
      return embedding;
    } catch (error) {
      console.error('Error generating text embedding:', error);
      throw error;
    }
  }

  /**
   * Recherche sémantique par texte
   * Convertit la requête en embedding et trouve les œuvres similaires
   */
  async searchByText(query, options = {}) {
    const { 
      limit = 20, 
      filters = {},
      offset = 0 
    } = options;

    try {
      // Générer l'embedding de la requête
      const queryEmbedding = await this.generateTextEmbedding(query);

      // Construire la requête SQL avec filtrage
      let sql = `
        SELECT 
          a.id, a.title, a.price, a.image_url, a.year,
          ar.name as artist_name, ar.id as artist_id,
          a.medium, a.style, a.dimensions,
          a.description_embedding
        FROM artworks a
        JOIN artists ar ON a.artist_id = ar.id
        WHERE a.status = 'published'
      `;

      const params = [];

      // Appliquer les filtres
      if (filters.minPrice) {
        sql += ` AND a.price >= ?`;
        params.push(filters.minPrice);
      }
      if (filters.maxPrice) {
        sql += ` AND a.price <= ?`;
        params.push(filters.maxPrice);
      }
      if (filters.styles?.length) {
        sql += ` AND a.style IN (${filters.styles.map(() => '?').join(',')})`;
        params.push(...filters.styles);
      }
      if (filters.mediums?.length) {
        sql += ` AND a.medium IN (${filters.mediums.map(() => '?').join(',')})`;
        params.push(...filters.mediums);
      }

      // Récupérer les œuvres candidates
      const artworks = await this.db.all(sql, params);

      // Calculer la similarité cosinus pour chaque œuvre
      const scoredArtworks = artworks.map(artwork => {
        // Si l'œuvre a un embedding stocké, comparer
        if (artwork.description_embedding) {
          const artworkEmbedding = JSON.parse(artwork.description_embedding);
          const similarity = this.cosineSimilarity(queryEmbedding, artworkEmbedding);
          return { ...artwork, similarity_score: similarity };
        }
        
        // Sinon, score basé sur correspondance textuelle simple
        const textMatch = this.calculateTextMatch(query, artwork);
        return { ...artwork, similarity_score: textMatch };
      });

      // Trier par score de similarité
      scoredArtworks.sort((a, b) => b.similarity_score - a.similarity_score);

      return {
        results: scoredArtworks.slice(offset, offset + limit),
        total: scoredArtworks.length,
        query: query,
      };

    } catch (error) {
      console.error('Search by text error:', error);
      throw error;
    }
  }

  /**
   * Recherche visuelle par similarité
   * Analyse une image et trouve des œuvres visuellement similaires
   */
  async searchByImage(imageBase64, options = {}) {
    const { limit = 20 } = options;

    try {
      // Utiliser GPT-4 Vision pour décrire l'image
      const visionResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Décris cette image d'art en détail. 
                       Mentionne: le style artistique, les couleurs dominantes, 
                       la composition, le sujet, la technique, et l'ambiance générale.
                       Réponds en français, en phrases courtes et descriptives.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      });

      const imageDescription = visionResponse.choices[0].message.content;

      // Générer un embedding de la description
      const descriptionEmbedding = await this.generateTextEmbedding(imageDescription);

      // Rechercher les œuvres similaires
      const sql = `
        SELECT 
          a.id, a.title, a.price, a.image_url, a.year,
          ar.name as artist_name, ar.id as artist_id,
          a.medium, a.style, a.dimensions,
          a.description_embedding, a.image_analysis
        FROM artworks a
        JOIN artists ar ON a.artist_id = ar.id
        WHERE a.status = 'published'
      `;

      const artworks = await this.db.all(sql);

      const scoredArtworks = artworks.map(artwork => {
        let similarity = 0;

        // Comparer avec embedding de description si disponible
        if (artwork.description_embedding) {
          const artworkEmbedding = JSON.parse(artwork.description_embedding);
          similarity = this.cosineSimilarity(descriptionEmbedding, artworkEmbedding);
        }

        // Bonus si couleurs dominantes correspondent
        if (artwork.image_analysis) {
          const analysis = JSON.parse(artwork.image_analysis);
          // Logique de correspondance de couleurs ici
        }

        return { 
          ...artwork, 
          similarity_score: similarity,
          matched_description: imageDescription
        };
      });

      scoredArtworks.sort((a, b) => b.similarity_score - a.similarity_similarity);

      return {
        results: scoredArtworks.slice(0, limit),
        total: scoredArtworks.length,
        description: imageDescription,
      };

    } catch (error) {
      console.error('Search by image error:', error);
      throw error;
    }
  }

  /**
   * Recherche combinée (texte + visuel)
   */
  async searchCombined(textQuery, imageBase64, options = {}) {
    // Effectuer les deux recherches en parallèle
    const [textResults, imageResults] = await Promise.all([
      textQuery ? this.searchByText(textQuery, options) : Promise.resolve({ results: [] }),
      imageBase64 ? this.searchByImage(imageBase64, options) : Promise.resolve({ results: [] })
    ]);

    // Fusionner et dédoublonner les résultats
    const combined = new Map();

    textResults.results.forEach(artwork => {
      combined.set(artwork.id, { ...artwork, combined_score: artwork.similarity_score * 0.6 });
    });

    imageResults.results.forEach(artwork => {
      if (combined.has(artwork.id)) {
        const existing = combined.get(artwork.id);
        existing.combined_score += artwork.similarity_score * 0.4;
      } else {
        combined.set(artwork.id, { ...artwork, combined_score: artwork.similarity_score * 0.4 });
      }
    });

    const sorted = Array.from(combined.values())
      .sort((a, b) => b.combined_score - a.combined_score);

    return {
      results: sorted,
      total: sorted.length,
      text_query: textQuery,
      image_description: imageResults.description,
    };
  }

  /**
   * Obtenir les suggestions de recherche
   */
  async getSuggestions(partialQuery) {
    const suggestions = [
      { text: 'Abstrait avec bleu profond', type: 'style' },
      { text: 'Portrait contemporain', type: 'style' },
      { text: 'Minimalisme organique', type: 'style' },
      { text: 'Expressionnisme urbain', type: 'style' },
      { text: 'Huile sur toile grand format', type: 'technique' },
      { text: 'Sculpture moderne', type: 'medium' },
      { text: 'Art digital futuriste', type: 'style' },
      { text: 'Nature morte moderne', type: 'sujet' },
    ];

    // Filtrer selon la requête partielle
    return suggestions.filter(s => 
      s.text.toLowerCase().includes(partialQuery.toLowerCase())
    ).slice(0, 5);
  }

  /**
   * Calcul de similarité cosinus entre deux vecteurs
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calcul de correspondance textuelle simple (fallback)
   */
  calculateTextMatch(query, artwork) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const artworkText = `${artwork.title} ${artwork.artist_name} ${artwork.style} ${artwork.medium}`.toLowerCase();
    
    let matches = 0;
    queryWords.forEach(word => {
      if (artworkText.includes(word)) matches++;
    });

    return matches / queryWords.length;
  }
}

module.exports = SmartSearchService;
