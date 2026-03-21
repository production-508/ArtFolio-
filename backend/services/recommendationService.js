const { dbAll, dbGet, dbRun } = require('../db/database');

/**
 * Service de recommandations personnalisées "Pour Vous"
 * Algorithme basé sur: vues, favoris, recherches, achats
 * Scoring pondéré: favoris = +10, vue = +1, achat = +20
 */
class RecommendationService {
  constructor() {
    this.WEIGHTS = {
      VIEW: 1,
      FAVORITE: 10,
      PURCHASE: 20,
      HOVER: 0.5,
      SEARCH: 3,
      CLICK: 2
    };
    
    this.SIMILARITY_FACTORS = {
      STYLE: 0.3,
      ARTIST: 0.25,
      COLOR: 0.25,
      PRICE_RANGE: 0.15,
      MEDIUM: 0.05
    };
  }

  /**
   * Récupère les recommandations personnalisées pour un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {number} limit - Nombre de recommandations (défaut: 10)
   * @returns {Promise<Array>} Œuvres recommandées avec score
   */
  async getForYou(userId, limit = 10) {
    // Si nouvel utilisateur (pas d'historique), retourner les fallback
    const hasHistory = await this.hasUserHistory(userId);
    if (!hasHistory) {
      return this.getFallbackRecommendations(limit);
    }

    // 1. Récupérer le profil d'intérêt de l'utilisateur
    const userProfile = await this.buildUserProfile(userId);
    
    // 2. Récupérer toutes les œuvres candidates (exclure celles déjà vues/rachetées)
    const candidates = await this.getCandidateArtworks(userId);
    
    // 3. Calculer le score de similarité pour chaque œuvre
    const scoredArtworks = candidates.map(artwork => ({
      ...artwork,
      score: this.calculateSimilarityScore(artwork, userProfile),
      reasons: this.getRecommendationReasons(artwork, userProfile)
    }));

    // 4. Trier par score décroissant
    scoredArtworks.sort((a, b) => b.score - a.score);

    // 5. Appliquer la diversification (pas tout du même artiste)
    const diversified = this.diversifyRecommendations(scoredArtworks, limit);

    return diversified;
  }

  /**
   * Récupère les collections thématiques personnalisées
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Collections thématiques
   */
  async getThematicCollections(userId) {
    const userProfile = await this.buildUserProfile(userId);
    const collections = [];

    // Collection 1: Dans vos tons favoris
    if (userProfile.favoriteColors.length > 0) {
      const colorCollection = await this.getColorCollection(
        userProfile.favoriteColors[0],
        userId
      );
      if (colorCollection.artworks.length >= 4) {
        collections.push(colorCollection);
      }
    }

    // Collection 2: Style préféré
    if (userProfile.favoriteStyles.length > 0) {
      const styleCollection = await this.getStyleCollection(
        userProfile.favoriteStyles[0],
        userId
      );
      if (styleCollection.artworks.length >= 4) {
        collections.push(styleCollection);
      }
    }

    // Collection 3: Similaire à ce que vous avez regardé
    const recentlyViewed = userProfile.recentlyViewed.slice(0, 1);
    if (recentlyViewed.length > 0) {
      const similarCollection = await this.getSimilarArtworksCollection(
        recentlyViewed[0],
        userId
      );
      if (similarCollection.artworks.length >= 4) {
        collections.push(similarCollection);
      }
    }

    // Collection 4: Découvertes de la semaine (toujours présente)
    const newCollection = await this.getNewThisWeekCollection(userId);
    if (newCollection.artworks.length >= 4) {
      collections.push(newCollection);
    }

    return collections;
  }

  /**
   * Enregistre une vue d'œuvre
   */
  async trackView(userId, artworkId, duration = 0) {
    try {
      await dbRun(
        `INSERT INTO user_tracking (user_id, artwork_id, action_type, duration, created_at)
         VALUES (?, ?, 'view', ?, datetime('now'))`,
        [userId, artworkId, duration]
      );
      
      // Incrémenter le compteur de vues de l'œuvre
      await dbRun(
        'UPDATE artworks SET view_count = view_count + 1 WHERE id = ?',
        [artworkId]
      );
    } catch (err) {
      console.error('Erreur tracking view:', err);
    }
  }

  /**
   * Enregistre une interaction (hover, click)
   */
  async trackInteraction(userId, artworkId, interactionType, duration = 0) {
    try {
      await dbRun(
        `INSERT INTO user_tracking (user_id, artwork_id, action_type, duration, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [userId, artworkId, interactionType, duration]
      );
    } catch (err) {
      console.error('Erreur tracking interaction:', err);
    }
  }

  /**
   * Enregistre un favori
   */
  async trackFavorite(userId, artworkId, isFavorite = true) {
    try {
      if (isFavorite) {
        await dbRun(
          `INSERT OR IGNORE INTO user_favorites (user_id, artwork_id, created_at)
           VALUES (?, ?, datetime('now'))`,
          [userId, artworkId]
        );
        await this.trackInteraction(userId, artworkId, 'favorite');
      } else {
        await dbRun(
          'DELETE FROM user_favorites WHERE user_id = ? AND artwork_id = ?',
          [userId, artworkId]
        );
      }
    } catch (err) {
      console.error('Erreur tracking favorite:', err);
    }
  }

  /**
   * Enregistre une recherche
   */
  async trackSearch(userId, query, resultsCount = 0) {
    try {
      await dbRun(
        `INSERT INTO user_searches (user_id, query, results_count, created_at)
         VALUES (?, ?, ?, datetime('now'))`,
        [userId, query, resultsCount]
      );
    } catch (err) {
      console.error('Erreur tracking search:', err);
    }
  }

  /**
   * Enregistre un achat
   */
  async trackPurchase(userId, artworkId, amount) {
    try {
      await this.trackInteraction(userId, artworkId, 'purchase');
    } catch (err) {
      console.error('Erreur tracking purchase:', err);
    }
  }

  /**
   * Construit le profil d'intérêt d'un utilisateur
   */
  async buildUserProfile(userId) {
    // Récupérer l'historique de tracking pondéré
    const trackingData = await dbAll(
      `SELECT 
        a.id, a.style, a.medium, a.price, a.color_palette, a.artist_id,
        ut.action_type, ut.duration,
        COUNT(CASE WHEN ut.action_type = 'view' THEN 1 END) as view_count,
        COUNT(CASE WHEN ut.action_type = 'favorite' THEN 1 END) as favorite_count,
        COUNT(CASE WHEN ut.action_type = 'purchase' THEN 1 END) as purchase_count
       FROM user_tracking ut
       JOIN artworks a ON a.id = ut.artwork_id
       WHERE ut.user_id = ?
         AND ut.created_at >= datetime('now', '-90 days')
       GROUP BY a.id`,
      [userId]
    );

    // Récupérer les favoris
    const favorites = await dbAll(
      `SELECT a.* FROM user_favorites uf
       JOIN artworks a ON a.id = uf.artwork_id
       WHERE uf.user_id = ?`,
      [userId]
    );

    // Récupérer les recherches récentes
    const searches = await dbAll(
      `SELECT query FROM user_searches 
       WHERE user_id = ? 
         AND created_at >= datetime('now', '-30 days')
       ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    // Construire le profil
    const profile = {
      favoriteStyles: this.extractFavoriteStyles(trackingData, favorites),
      favoriteColors: this.extractFavoriteColors(trackingData, favorites),
      favoriteArtists: this.extractFavoriteArtists(trackingData, favorites),
      priceRange: this.extractPriceRange(trackingData, favorites),
      favoriteMediums: this.extractFavoriteMediums(trackingData, favorites),
      recentSearches: searches.map(s => s.query),
      recentlyViewed: trackingData
        .filter(t => t.view_count > 0)
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5)
        .map(t => ({ id: t.id, title: t.title }))
    };

    return profile;
  }

  /**
   * Calcule le score de similarité entre une œuvre et le profil utilisateur
   */
  calculateSimilarityScore(artwork, userProfile) {
    let score = 0;

    // Score de style
    if (userProfile.favoriteStyles.includes(artwork.style)) {
      score += this.WEIGHTS.FAVORITE * this.SIMILARITY_FACTORS.STYLE;
    }

    // Score d'artiste (pénaliser si déjà beaucoup de cet artiste)
    if (userProfile.favoriteArtists.includes(artwork.artist_id)) {
      score += this.WEIGHTS.FAVORITE * this.SIMILARITY_FACTORS.ARTIST;
    }

    // Score de couleur
    const artworkColors = this.parseColorPalette(artwork.color_palette);
    const colorMatch = artworkColors.some(c => 
      userProfile.favoriteColors.some(fc => this.colorDistance(c, fc) < 50)
    );
    if (colorMatch) {
      score += this.WEIGHTS.VIEW * this.SIMILARITY_FACTORS.COLOR * 3;
    }

    // Score de prix (préférence pour la fourchette)
    if (userProfile.priceRange.min && userProfile.priceRange.max) {
      const midPrice = (userProfile.priceRange.min + userProfile.priceRange.max) / 2;
      const priceDiff = Math.abs(artwork.price - midPrice);
      const priceScore = Math.max(0, 1 - (priceDiff / midPrice));
      score += priceScore * this.WEIGHTS.VIEW * this.SIMILARITY_FACTORS.PRICE_RANGE;
    }

    // Score de medium
    if (userProfile.favoriteMediums.includes(artwork.medium)) {
      score += this.WEIGHTS.VIEW * this.SIMILARITY_FACTORS.MEDIUM;
    }

    // Bonus pour les œuvres populaires
    score += (artwork.view_count || 0) * 0.01;

    // Bonus pour les œuvres en vedette
    if (artwork.featured) {
      score += 2;
    }

    return score;
  }

  /**
   * Diversifie les recommandations (éviter trop du même artiste)
   */
  diversifyRecommendations(artworks, limit) {
    const diversified = [];
    const artistCounts = {};
    const maxPerArtist = 3;

    for (const artwork of artworks) {
      const artistId = artwork.artist_id;
      artistCounts[artistId] = (artistCounts[artistId] || 0) + 1;

      if (artistCounts[artistId] <= maxPerArtist) {
        diversified.push(artwork);
      }

      if (diversified.length >= limit) break;
    }

    // Si pas assez après diversification, compléter avec les suivants
    if (diversified.length < limit) {
      for (const artwork of artworks) {
        if (!diversified.find(a => a.id === artwork.id)) {
          diversified.push(artwork);
          if (diversified.length >= limit) break;
        }
      }
    }

    return diversified.slice(0, limit);
  }

  /**
   * Récupère les œuvres candidates (exclure vues/favoris/achetées)
   */
  async getCandidateArtworks(userId) {
    return await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1
         AND a.id NOT IN (
           SELECT DISTINCT artwork_id FROM user_tracking 
           WHERE user_id = ? AND action_type IN ('view', 'purchase')
         )
       ORDER BY a.created_at DESC
       LIMIT 200`,
      [userId]
    );
  }

  /**
   * Fallback pour nouveaux utilisateurs
   */
  async getFallbackRecommendations(limit = 10) {
    // Mélange de populaires, en vedette et nouveautés
    const popular = await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1
       ORDER BY a.view_count DESC LIMIT ?`,
      [Math.floor(limit * 0.4)]
    );

    const featured = await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1 AND a.featured = 1
       ORDER BY a.created_at DESC LIMIT ?`,
      [Math.floor(limit * 0.3)]
    );

    const newest = await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1
       ORDER BY a.created_at DESC LIMIT ?`,
      [Math.floor(limit * 0.3) + 1]
    );

    // Mélanger et dédupliquer
    const mixed = [...popular, ...featured, ...newest];
    const seen = new Set();
    const unique = mixed.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });

    return unique.slice(0, limit).map(a => ({
      ...a,
      score: 0,
      reasons: ['Populaire sur ArtFolio'],
      isFallback: true
    }));
  }

  /**
   * Vérifie si l'utilisateur a un historique
   */
  async hasUserHistory(userId) {
    const result = await dbGet(
      `SELECT COUNT(*) as count FROM user_tracking WHERE user_id = ?`,
      [userId]
    );
    return result.count > 0;
  }

  // === COLLECTIONS THÉMATIQUES ===

  async getColorCollection(color, userId) {
    const artworks = await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1
         AND a.color_palette LIKE ?
         AND a.id NOT IN (
           SELECT artwork_id FROM user_tracking 
           WHERE user_id = ? AND action_type = 'purchase'
         )
       ORDER BY a.view_count DESC LIMIT 10`,
      [`%${color}%`, userId]
    );

    return {
      id: `color-${color}`,
      title: `Dans vos tons favoris : ${this.getColorName(color)}`,
      subtitle: 'Basé sur vos couleurs préférées',
      artworks: artworks.slice(0, 8),
      color: color
    };
  }

  async getStyleCollection(style, userId) {
    const styleNames = {
      'abstract': 'Abstrait',
      'impressionist': 'Impressionniste',
      'surrealist': 'Surréaliste',
      'realist': 'Réaliste',
      'expressionist': 'Expressionniste',
      'minimalist': 'Minimaliste',
      'contemporary': 'Contemporain',
      'pop art': 'Pop Art'
    };

    const artworks = await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1 AND a.style = ?
         AND a.id NOT IN (
           SELECT artwork_id FROM user_tracking 
           WHERE user_id = ? AND action_type = 'purchase'
         )
       ORDER BY a.created_at DESC LIMIT 10`,
      [style, userId]
    );

    return {
      id: `style-${style}`,
      title: styleNames[style] || style,
      subtitle: 'Dans votre style préféré',
      artworks: artworks.slice(0, 8),
      style: style
    };
  }

  async getSimilarArtworksCollection(referenceArtwork, userId) {
    const artworks = await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar,
        CASE 
          WHEN a.style = ? THEN 3
          WHEN a.artist_id = ? THEN 2
          WHEN a.medium = ? THEN 1
          ELSE 0
        END as similarity_score
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1
         AND a.id != ?
         AND a.id NOT IN (
           SELECT artwork_id FROM user_tracking 
           WHERE user_id = ? AND action_type = 'purchase'
         )
       ORDER BY similarity_score DESC, a.view_count DESC
       LIMIT 10`,
      [referenceArtwork.style, referenceArtwork.artist_id, referenceArtwork.medium, 
       referenceArtwork.id, userId]
    );

    return {
      id: `similar-${referenceArtwork.id}`,
      title: `Similaire à "${referenceArtwork.title}"`,
      subtitle: 'Parce que vous avez aimé cette œuvre',
      artworks: artworks.slice(0, 8),
      referenceId: referenceArtwork.id
    };
  }

  async getNewThisWeekCollection(userId) {
    const artworks = await dbAll(
      `SELECT a.*, u.name as artist_name, u.avatar_url as artist_avatar
       FROM artworks a
       JOIN users u ON u.id = a.artist_id
       WHERE a.available = 1
         AND a.created_at >= datetime('now', '-7 days')
         AND a.id NOT IN (
           SELECT artwork_id FROM user_tracking 
           WHERE user_id = ? AND action_type = 'purchase'
         )
       ORDER BY a.created_at DESC LIMIT 10`,
      [userId]
    );

    return {
      id: 'new-this-week',
      title: 'Nouveautés de la semaine',
      subtitle: 'Les dernières œuvres ajoutées',
      artworks: artworks.slice(0, 8)
    };
  }

  // === HELPERS ===

  extractFavoriteStyles(trackingData, favorites) {
    const styleCounts = {};
    
    trackingData.forEach(item => {
      const weight = item.favorite_count * this.WEIGHTS.FAVORITE + 
                     item.purchase_count * this.WEIGHTS.PURCHASE +
                     item.view_count * this.WEIGHTS.VIEW;
      styleCounts[item.style] = (styleCounts[item.style] || 0) + weight;
    });

    favorites.forEach(fav => {
      styleCounts[fav.style] = (styleCounts[fav.style] || 0) + this.WEIGHTS.FAVORITE;
    });

    return Object.entries(styleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([style]) => style);
  }

  extractFavoriteColors(trackingData, favorites) {
    const colorCounts = {};

    [...trackingData, ...favorites].forEach(item => {
      const colors = this.parseColorPalette(item.color_palette);
      colors.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });
    });

    return Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([color]) => color);
  }

  extractFavoriteArtists(trackingData, favorites) {
    const artistCounts = {};

    trackingData.forEach(item => {
      const weight = item.favorite_count * this.WEIGHTS.FAVORITE + 
                     item.purchase_count * this.WEIGHTS.PURCHASE;
      artistCounts[item.artist_id] = (artistCounts[item.artist_id] || 0) + weight;
    });

    return Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artistId]) => parseInt(artistId));
  }

  extractPriceRange(trackingData, favorites) {
    const allItems = [...trackingData, ...favorites];
    if (allItems.length === 0) return { min: null, max: null };

    const prices = allItems.map(item => item.price).filter(p => p > 0);
    if (prices.length === 0) return { min: null, max: null };

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    // Élargir la fourchette de 20%
    return {
      min: Math.floor(min * 0.8),
      max: Math.ceil(max * 1.2)
    };
  }

  extractFavoriteMediums(trackingData, favorites) {
    const mediumCounts = {};

    [...trackingData, ...favorites].forEach(item => {
      mediumCounts[item.medium] = (mediumCounts[item.medium] || 0) + 1;
    });

    return Object.entries(mediumCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([medium]) => medium);
  }

  parseColorPalette(colorPaletteJson) {
    if (!colorPaletteJson) return [];
    try {
      const palette = JSON.parse(colorPaletteJson);
      return palette.map(c => c.hex || c).filter(Boolean);
    } catch {
      return [];
    }
  }

  colorDistance(hex1, hex2) {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  getColorName(hex) {
    const colorNames = {
      '#FF0000': 'rouge', '#00FF00': 'vert', '#0000FF': 'bleu',
      '#FFFF00': 'jaune', '#FF00FF': 'magenta', '#00FFFF': 'cyan',
      '#000000': 'noir', '#FFFFFF': 'blanc', '#808080': 'gris',
      '#800000': 'bordeaux', '#808000': 'olive', '#008000': 'vert foncé',
      '#800080': 'violet', '#008080': 'sarcelle', '#000080': 'bleu marine'
    };
    return colorNames[hex.toUpperCase()] || hex;
  }

  getRecommendationReasons(artwork, userProfile) {
    const reasons = [];

    if (userProfile.favoriteStyles.includes(artwork.style)) {
      reasons.push(`Style ${artwork.style}`);
    }

    if (userProfile.favoriteArtists.includes(artwork.artist_id)) {
      reasons.push('Même artiste');
    }

    if (userProfile.favoriteMediums.includes(artwork.medium)) {
      reasons.push(`Medium: ${artwork.medium}`);
    }

    const artworkColors = this.parseColorPalette(artwork.color_palette);
    const hasColorMatch = artworkColors.some(c => 
      userProfile.favoriteColors.some(fc => this.colorDistance(c, fc) < 50)
    );
    if (hasColorMatch) {
      reasons.push('Couleurs similaires');
    }

    if (artwork.featured) {
      reasons.push('Sélection éditeur');
    }

    return reasons.length > 0 ? reasons : ['Pour vous'];
  }
}

module.exports = new RecommendationService();
