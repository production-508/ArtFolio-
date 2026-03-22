#!/usr/bin/env node
/**
 * Script d'import des données seed pour la beta ArtFolio
 * Utilise better-sqlite3 pour une exécution synchrone fiable
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../backend/db/artfolio.db');

// Charger les données seed
const seedData1 = require('../content/seed_data_part1.json');
const seedData2 = require('../content/seed_data_part2.json');
const seedData3 = require('../content/seed_data_part3.json');

const allArtists = [
  ...seedData1.artists,
  ...seedData2.artists,
  ...seedData3.artists
];

console.log('🎨 ArtFolio Beta - Import de contenu\n');
console.log(`📊 ${allArtists.length} artistes à importer\n`);

try {
  const db = new Database(DB_PATH);
  console.log('✅ Base de données connectée\n');

  // Préparer les statements
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, plan, location, bio, avatar_url, ai_bio, ai_style_tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertArtist = db.prepare(`
    INSERT INTO artists (userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertArtwork = db.prepare(`
    INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const getUserId = db.prepare('SELECT id FROM users WHERE email = ?');

  let successCount = 0;
  let artworkCount = 0;

  // Transaction pour l'import
  const importTransaction = db.transaction(() => {
    for (const artistData of allArtists) {
      try {
        const email = `${artistData.slug}@artfolio.demo`;
        
        // 1. Insérer l'utilisateur
        insertUser.run(
          artistData.name,
          email,
          'demo_hash_demo123',
          'artist',
          'pro',
          artistData.location,
          artistData.bio,
          artistData.image,
          artistData.bio,
          JSON.stringify(artistData.style_tags)
        );

        // 2. Récupérer l'ID
        const user = getUserId.get(email);
        if (!user) {
          console.error(`❌ Utilisateur non trouvé: ${artistData.name}`);
          continue;
        }

        // 3. Insérer le profil artiste
        insertArtist.run(
          user.id,
          artistData.name,
          email,
          artistData.bio,
          artistData.story,
          JSON.stringify(artistData.style_tags),
          JSON.stringify(artistData.color_palette),
          artistData.style_tags[0] || 'Contemporain',
          'masonry'
        );

        // 4. Insérer les œuvres
        for (const artwork of artistData.artworks) {
          insertArtwork.run(
            artwork.title,
            user.id,
            artwork.medium,
            artistData.style_tags[0] || 'Contemporain',
            artwork.description,
            artwork.price,
            artwork.status === 'available' ? 1 : 0,
            artwork.image,
            artwork.year,
            artwork.dimensions,
            Math.random() > 0.7 ? 1 : 0
          );
          artworkCount++;
        }

        console.log(`✅ ${artistData.name} - ${artistData.artworks.length} œuvres`);
        successCount++;

      } catch (error) {
        console.error(`❌ Erreur import ${artistData.name}:`, error.message);
      }
    }
  });

  // Exécuter la transaction
  importTransaction();

  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉCAPITULATIF');
  console.log('='.repeat(50));
  console.log(`✅ Artistes importés: ${successCount}/${allArtists.length}`);
  console.log(`🖼️  Œuvres importées: ${artworkCount}`);
  console.log('='.repeat(50));

  // Afficher un aperçu
  console.log('\n📋 APERÇU DES ARTISTES:');
  const artists = db.prepare(`
    SELECT a.name, u.location, a.styleSignature, COUNT(aw.id) as artwork_count
    FROM artists a
    JOIN users u ON u.id = a.userId
    LEFT JOIN artworks aw ON aw.artist_id = a.userId
    GROUP BY a.id
    ORDER BY a.id DESC
    LIMIT 10
  `).all();

  artists.forEach((a, i) => {
    console.log(`  ${i+1}. ${a.name} (${a.location}) - ${a.styleSignature} - ${a.artwork_count} œuvres`);
  });

  if (artists.length < successCount) {
    console.log(`  ... et ${successCount - artists.length} autres`);
  }

  db.close();
  console.log('\n✨ Import terminé avec succès!');
  process.exit(0);

} catch (error) {
  console.error('💥 Erreur fatale:', error.message);
  console.error(error.stack);
  process.exit(1);
}
