/**
 * Données de test/mock pour le composant ArtworkAnalyzer
 * Utilisez ces données pour tester l'UI sans appeler l'API
 */

/**
 * @typedef {import('./index').AnalysisData} AnalysisData
 */

/** @type {AnalysisData} */
export const mockAnalysisData = {
  palette: ['#FF6B35', '#F7C59F', '#2EC4B6', '#011627', '#E71D36'],
  tags: ['Impressionniste', 'Portrait', 'Huile sur toile', 'XIXe siècle', 'Lumière naturelle'],
  style: 'Impressionnisme',
  priceEstimate: {
    low: 450,
    high: 800,
    confidence: 0.85,
  },
  seoDescription: 'Portrait impressionniste aux teintes chaudes représentant une femme élégante dans un jardin ensoleillé. Cette œuvre maîtrise parfaitement la technique de la lumière diffuse caractéristique du mouvement impressionniste, avec des coups de brosse fluides et une palette harmonieuse de corail et de turquoise.',
  confidence: 0.87,
};

/** @type {AnalysisData} */
export const mockAbstractData = {
  palette: ['#9B5DE5', '#F15BB5', '#00BBF9', '#FEE440', '#00F5D4'],
  tags: ['Abstrait', 'Contemporain', 'Acrylique', 'Géométrique', 'Vibrant'],
  style: 'Abstrait',
  priceEstimate: {
    low: 1200,
    high: 2500,
    confidence: 0.72,
  },
  seoDescription: 'Composition abstraite contemporaine aux couleurs vibrantes et géométries audacieuses. Cette œuvre explore les contrastes entre formes organiques et lignes structurées, créant un dialogue visuel dynamique entre le chaos et l\'ordre.',
  confidence: 0.78,
};

/** @type {AnalysisData} */
export const mockRealismData = {
  palette: ['#8B4513', '#D2691E', '#F4A460', '#2F4F4F', '#1C1C1C'],
  tags: ['Réalisme', 'Nature morte', 'Huile', 'Classique', 'Détaillé'],
  style: 'Réalisme',
  priceEstimate: {
    low: 800,
    high: 1500,
    confidence: 0.91,
  },
  seoDescription: 'Nature morte réaliste d\'une composition de fruits et de vaisselle ancienne. Chaque détail est rendu avec une précision remarquable, des reflets sur la porcelaine aux textures des peaux de fruits.',
  confidence: 0.92,
};

/**
 * Simule un appel API avec délai
 * @param {AnalysisData} data - Données à retourner
 * @param {number} delay - Délai en ms (défaut: 2000)
 * @returns {Promise<{success: boolean, analysis: AnalysisData}>}
 */
export function mockAnalyzeAPI(data = mockAnalysisData, delay = 2000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        analysis: data,
      });
    }, delay);
  });
}
