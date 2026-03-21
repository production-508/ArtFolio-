/** * Tests pour le service AI Profile Generator */

const { 
  generateArtistProfile, 
  generateCacheKey, 
  calculatePriceStats, 
  extractStyles,
  previewPrompt,
  clearCache 
} = require('./aiProfileGenerator');

// Mock data pour les tests
const mockArtworks = [
  {
    title: "Échos du silence",
    description: "Une exploration des émotions enfouies, où la lumière danse avec les ombres.",
    style: "Abstrait contemporain",
    price: 850,
    medium: "Acrylique sur toile",
    dimensions: "100x80cm",
    year: 2023
  },
  {
    title: "Métamorphose urbaine",
    description: "La ville en constante mutation, capturée dans un moment de grâce.",
    style: "Street art, Contemporain",
    price: 1200,
    medium: "Mixte sur métal",
    dimensions: "150x100cm",
    year: 2024
  },
  {
    title: "Fragments de mémoire",
    description: "Des bribes de souvenirs s'assemblent comme un puzzle.",
    style: "Expressionnisme",
    price: 650,
    medium: "Huile sur toile",
    dimensions: "60x60cm",
    year: 2023
  }
];

const mockArtworksMinimal = [
  {
    title: "Sans titre",
    price: 500
  }
];

// Tests
async function runTests() {
  console.log('🧪 Running AI Profile Generator Tests\n');
  
  // Test 1: generateCacheKey
  console.log('Test 1: generateCacheKey');
  const key1 = generateCacheKey(mockArtworks);
  const key2 = generateCacheKey(mockArtworks);
  const key3 = generateCacheKey([...mockArtworks].reverse());
  console.log('  ✓ Same data produces same key:', key1 === key2);
  console.log('  ✓ Order independence:', key1 === key3);
  console.log(`  Key: ${key1}\n`);
  
  // Test 2: calculatePriceStats
  console.log('Test 2: calculatePriceStats');
  const stats = calculatePriceStats(mockArtworks);
  console.log('  Stats:', JSON.stringify(stats, null, 2));
  console.log('  ✓ Min:', stats.min === 650);
  console.log('  ✓ Max:', stats.max === 1200);
  console.log('  ✓ Average:', stats.average === 900);
  console.log('  ✓ Range:', stats.range === '650€ - 1200€');
  
  const emptyStats = calculatePriceStats([]);
  console.log('  ✓ Empty array:', emptyStats.average === 0);
  console.log();
  
  // Test 3: extractStyles
  console.log('Test 3: extractStyles');
  const styles = extractStyles(mockArtworks);
  console.log('  Styles found:', styles);
  console.log('  ✓ Styles extracted:', styles.length > 0);
  console.log();
  
  // Test 4: previewPrompt
  console.log('Test 4: previewPrompt');
  const preview = previewPrompt(mockArtworks, 'fr');
  console.log('  System prompt length:', preview.system.length);
  console.log('  User prompt length:', preview.user.length);
  console.log('  Estimated tokens:', preview.estimatedTokens);
  console.log('  ✓ Preview generated');
  console.log();
  
  // Test 5: generateArtistProfile (fallback mode - sans API key)
  console.log('Test 5: generateArtistProfile (fallback mode)');
  try {
    // Supprime temporairement la clé API pour forcer le fallback
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    
    const profile = await generateArtistProfile(mockArtworks, { language: 'fr' });
    
    console.log('  Profile generated (fallback):', profile.isFallback ? '✓' : '✗');
    console.log('  Bio:', profile.bio.substring(0, 50) + '...');
    console.log('  Tags:', profile.tags);
    console.log('  Color palette:', profile.colorPalette);
    console.log('  Style signature:', profile.styleSignature);
    console.log('  Layout type:', profile.layoutType);
    console.log('  ✓ All fields present:', 
      profile.bio && profile.story && profile.tags && 
      profile.colorPalette && profile.styleSignature && profile.layoutType
    );
    
    // Restaure la clé API
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
    
  } catch (error) {
    console.error('  ✗ Error:', error.message);
  }
  console.log();
  
  // Test 6: Validation
  console.log('Test 6: Input validation');
  try {
    await generateArtistProfile([]);
    console.log('  ✗ Should throw on empty array');
  } catch (e) {
    console.log('  ✓ Throws on empty array:', e.message);
  }
  
  try {
    await generateArtistProfile(null);
    console.log('  ✗ Should throw on null');
  } catch (e) {
    console.log('  ✓ Throws on null:', e.message);
  }
  console.log();
  
  // Test 7: Cache
  console.log('Test 7: Cache');
  clearCache();
  console.log('  ✓ Cache cleared');
  console.log();
  
  console.log('✅ All tests completed!');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };