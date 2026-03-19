const artworkRichAnalyzer = require('../services/artworkRichAnalyzer');
const lancedbService = require('../services/lancedbService');

/**
 * Hook déclenché quand une œuvre est validée/publice par un admin
 * Pipeline: Analyse Rich Document → Vectorisation
 */
async function onArtworkPublished(artworkId) {
  console.log(`🎨 Hook: Œuvre #${artworkId} publiée, lancement analyse...`);

  try {
    // 1. Analyse complète (Vision + OCR + Contexte artiste)
    const richDocument = await artworkRichAnalyzer.analyzeArtwork(artworkId);

    // 2. Vectorisation pour recherche sémantique
    const indexResult = await lancedbService.indexArtwork(artworkId, richDocument);

    console.log(`✅ Hook terminé: œuvre #${artworkId} analysée et indexée (${indexResult.chunks} chunks)`);

    return {
      success: true,
      artworkId,
      richDocument,
      indexed: indexResult
    };
  } catch (error) {
    console.error(`❌ Hook échoué pour œuvre #${artworkId}:`, error);
    return {
      success: false,
      artworkId,
      error: error.message
    };
  }
}

/**
 * Hook pour analyse batch (toutes les œuvres non analysées)
 */
async function analyzeAllPending() {
  const { dbAll } = require('../db/database');

  const pending = await dbAll(`
    SELECT id FROM artworks 
    WHERE rich_document IS NULL 
    AND image_url IS NOT NULL
    LIMIT 10
  `);

  console.log(`🔄 Analyse batch: ${pending.length} œuvres en attente`);

  const results = [];
  for (const { id } of pending) {
    const result = await onArtworkPublished(id);
    results.push(result);
    // Petite pause entre chaque analyse (rate limiting API)
    await new Promise(r => setTimeout(r, 1000));
  }

  return results;
}

module.exports = {
  onArtworkPublished,
  analyzeAllPending
};
