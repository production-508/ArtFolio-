const { dbGet, dbAll } = require('../db/database');

/**
 * LanceDB Service pour vectorisation des Rich Documents
 * Stockage et recherche sémantique des œuvres
 */
class LanceDBService {
  constructor() {
    this.collectionName = 'artworks_vectors';
    this.initialized = false;
  }

  /**
   * Initialise la connexion LanceDB
   */
  async init() {
    if (this.initialized) return;

    try {
      // LanceDB est géré via l'extension memory-lancedb
      // On utilise les données de la base SQLite comme source
      this.initialized = true;
      console.log('✅ LanceDB Service initialisé');
    } catch (error) {
      console.error('Erreur init LanceDB:', error);
      throw error;
    }
  }

  /**
   * Vectorise et indexe un Rich Document
   */
  async indexArtwork(artworkId, richDocument) {
    try {
      await this.init();

      // Pour l'instant, on stocke dans SQLite avec recherche textuelle
      // Plus tard : vectorisation réelle avec embeddings
      console.log(`📦 Indexation œuvre #${artworkId}`);

      // Créer des chunks pour recherche sémantique
      const chunks = this.createChunks(richDocument);
      
      // Sauvegarder les chunks
      for (const chunk of chunks) {
        await this.saveChunk(artworkId, chunk);
      }

      return { indexed: true, chunks: chunks.length };
    } catch (error) {
      console.error('Erreur indexation:', error);
      throw error;
    }
  }

  /**
   * Crée des chunks de recherche à partir du Rich Document
   */
  createChunks(richDocument) {
    const chunks = [];

    // Chunk 1: Description complète
    chunks.push({
      type: 'full_description',
      content: richDocument.searchable_text,
      weight: 1.0
    });

    // Chunk 2: Analyse visuelle uniquement
    const va = richDocument.visual_analysis;
    chunks.push({
      type: 'visual_only',
      content: `${va.description_visuelle}. Sujet: ${va.sujet_principal}. Émotion: ${va.emotion_dominante}.`,
      weight: 0.9
    });

    // Chunk 3: Contexte artiste
    chunks.push({
      type: 'artist_context',
      content: `Artiste ${richDocument.metadata.artist}. ${richDocument.artist_context.bio}. ${richDocument.artist_context.statement}`,
      weight: 0.8
    });

    // Chunk 4: Mots-clés enrichis
    chunks.push({
      type: 'keywords',
      content: richDocument.enriched_tags.join('. '),
      weight: 0.7
    });

    // Chunk 5: Pour chatbot (résumé)
    chunks.push({
      type: 'chatbot_summary',
      content: richDocument.chatbot_summary,
      weight: 0.6
    });

    return chunks;
  }

  /**
   * Sauvegarde un chunk (simulation - utiliserait LanceDB en prod)
   */
  async saveChunk(artworkId, chunk) {
    const { dbRun } = require('../db/database');
    
    await dbRun(`
      INSERT OR REPLACE INTO artwork_search_chunks 
      (artwork_id, chunk_type, content, weight, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [artworkId, chunk.type, chunk.content, chunk.weight]);
  }

  /**
   * Recherche sémantique (simulation avec recherche textuelle)
   */
  async search(query, options = {}) {
    const { limit = 10, filters = {} } = options;

    try {
      await this.init();

      // Tokeniser la requête
      const searchTerms = query.toLowerCase()
        .split(/\s+/)
        .filter(t => t.length > 2)
        .map(t => `%${t}%`);

      if (searchTerms.length === 0) {
        return [];
      }

      // Construire la requête SQL de recherche
      let sql = `
        SELECT DISTINCT 
          a.id,
          a.title,
          a.image_url,
          a.price,
          a.style,
          a.medium,
          u.name as artist_name,
          a.chatbot_summary,
          a.searchable_text,
          COUNT(CASE 
        `;

      // Compter les matches pour chaque terme
      searchTerms.forEach((term, i) => {
        sql += `WHEN a.searchable_text LIKE ? THEN 1 `;
      });

      sql += `ELSE 0 END) as match_score
        FROM artworks a
        JOIN users u ON u.id = a.artist_id
        WHERE a.searchable_text IS NOT NULL
      `;

      // Ajouter les termes de recherche
      searchTerms.forEach(() => {
        sql += ` AND a.searchable_text LIKE ?`;
      });

      // Filtres optionnels
      if (filters.style) {
        sql += ` AND a.style = ?`;
      }
      if (filters.medium) {
        sql += ` AND a.medium = ?`;
      }
      if (filters.maxPrice) {
        sql += ` AND a.price <= ?`;
      }
      if (filters.available) {
        sql += ` AND a.available = 1`;
      }

      sql += `
        GROUP BY a.id
        HAVING match_score > 0
        ORDER BY match_score DESC, a.created_at DESC
        LIMIT ?
      `;

      const params = [
        ...searchTerms,  // Pour le COUNT
        ...searchTerms,  // Pour le WHERE
        ...(filters.style ? [filters.style] : []),
        ...(filters.medium ? [filters.medium] : []),
        ...(filters.maxPrice ? [filters.maxPrice] : []),
        limit
      ];

      const results = await dbAll(sql, params);

      return results.map(r => ({
        id: r.id,
        title: r.title,
        image_url: r.image_url,
        price: r.price,
        style: r.style,
        medium: r.medium,
        artist_name: r.artist_name,
        summary: r.chatbot_summary,
        relevance: r.match_score / searchTerms.length
      }));
    } catch (error) {
      console.error('Erreur recherche:', error);
      throw error;
    }
  }

  /**
   * Récupère le contexte pour le chatbot RAG
   */
  async getContextForChatbot(query, limit = 3) {
    const results = await this.search(query, { limit });
    
    if (results.length === 0) {
      return "Aucune œuvre ne correspond à cette recherche pour le moment.";
    }

    return results.map((r, i) => 
      `[${i + 1}] ${r.title} par ${r.artist_name} (${r.price}€): ${r.summary}`
    ).join('\n\n');
  }

  /**
   * Trouve des œuvres similaires à une œuvre donnée
   */
  async findSimilar(artworkId, limit = 5) {
    const artwork = await dbGet(`
      SELECT searchable_text, enriched_tags 
      FROM artworks WHERE id = ?
    `, [artworkId]);

    if (!artwork || !artwork.searchable_text) {
      return [];
    }

    // Extraire les tags pour recherche
    const tags = artwork.enriched_tags ? 
      JSON.parse(artwork.enriched_tags) : [];
    
    const query = tags.slice(0, 5).join(' ');
    
    const results = await this.search(query, { 
      limit: limit + 1 
    });

    // Exclure l'œuvre elle-même
    return results.filter(r => r.id !== artworkId).slice(0, limit);
  }
}

module.exports = new LanceDBService();
