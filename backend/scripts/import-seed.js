#!/usr/bin/env node
/**
 * Script d'import des données seed pour la beta ArtFolio
 * Importe 15 artistes fictifs avec leurs œuvres
 */

const path = require('path');
const fs = require('fs').promises;

// Charger la connexion DB
const { dbRun, dbGet, dbAll } = require('../db/database');

// Charger les données seed
const seedData1 = require('../../content/seed_data_part1.json');
const seedData2 = require('../../content/seed_data_part2.json');
const seedData3 = require('../../content/seed_data_part3.json');

const allArtists = [
  ...seedData1.artists,
  ...seedData2.artists,
  ...seedData3.artists
];

// Hasher un mot de passe simple pour les users de test
// Note: En production, utiliser bcrypt
async function hashPassword(password) {
  // Simple hash pour la démo - NE PAS UTILISER EN PROD
  return `demo_hash_${password}`;
}

async function importArtists() {
  console.log('🎨 Import ArtFolio Beta - 15 Artistes\n');
  console.log(`📊 ${allArtists.length} artistes à importer\n`);

  let successCount = 0;
  let artworkCount = 0;

  for (const artistData of allArtists) {
    try {
      // 1. Créer l'utilisateur (user)
      const email = `${artistData.slug}@artfolio.demo`;
      const passwordHash = await hashPassword('demo123');
      
      const userResult = await dbRun(
        `INSERT INTO users (
          name, email, password_hash, role, plan, location, bio, 
          avatar_url, ai_bio, ai_style_tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          artistData.name,
          email,
          passwordHash,
          'artist',
          'pro',
          artistData.location,
          artistData.bio,
          artistData.image,
          artistData.bio,
          JSON.stringify(artistData.style_tags)
        ]
      );

      const userId = userResult.lastID;
      console.log(`✅ Artiste créé: ${artistData.name} (ID: ${userId})`);

      // 2. Créer le profil artiste enrichi
      await dbRun(
        `INSERT INTO artists (
          userId, name, email, bio, story, tags, colorPalette, 
          styleSignature, layoutType, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          userId,
          artistData.name,
          email,
          artistData.bio,
          artistData.story,
          JSON.stringify(artistData.style_tags),
          JSON.stringify(artistData.color_palette),
          artistData.style_tags[0] || 'Contemporain',
          'masonry',
        ]
      );

      // 3. Créer les œuvres
      for (const artwork of artistData.artworks) {
        await dbRun(
          `INSERT INTO artworks (
            title, artist_id, medium, style, description, price, 
            available, image_url, year, dimensions, featured, 
            color_palette, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            artwork.title,
            userId,
            artwork.medium,
            artistData.style_tags[0] || 'Contemporain',
            artwork.description,
            artwork.price,
            artwork.status === 'available' ? 1 : 0,
            artwork.image,
            artwork.year,
            artwork.dimensions,
            Math.random() > 0.7 ? 1 : 0, // 30% featured
            JSON.stringify(artistData.color_palette.slice(0, 5))
          ]
        );
        artworkCount++;
      }

      console.log(`   🖼️  ${artistData.artworks.length} œuvres importées`);
      successCount++;

    } catch (error) {
      console.error(`❌ Erreur import ${artistData.name}:`, error.message);
    }
  }

  console.log('\n📊 RÉCAPITULATIF');
  console.log('='.repeat(40));
  console.log(`✅ Artistes importés: ${successCount}/${allArtists.length}`);
  console.log(`🖼️  Œuvres importées: ${artworkCount}`);
  console.log('='.repeat(40));

  // Afficher un aperçu des données
  console.log('\n📋 APERÇU DES ARTISTES');
  const artists = await dbAll(`
    SELECT a.name, a.location, a.styleSignature, COUNT(aw.id) as artwork_count
    FROM artists a
    LEFT JOIN artworks aw ON aw.artist_id = a.userId
    GROUP BY a.id
    ORDER BY a.id DESC
    LIMIT 5
  `);
  
  artists.forEach((a, i) => {
    console.log(`  ${i+1}. ${a.name} (${a.location}) - ${a.styleSignature} - ${a.artwork_count} œuvres`);
  });

  if (artists.length < allArtists.length) {
    console.log(`  ... et ${allArtists.length - artists.length} autres`);
  }

  process.exit(0);
}

// Vérifier si la DB est disponible
async function checkDatabase() {
  try {
    const test = await dbGet('SELECT 1 as test');
    if (!test) {
      console.error('❌ Base de données non disponible');
      process.exit(1);
    }
    console.log('✅ Base de données connectée\n');
  } catch (error) {
    console.error('❌ Erreur connexion DB:', error.message);
    process.exit(1);
  }
}

// Vérifier si des données existent déjà
async function checkExistingData() {
  const count = await dbGet('SELECT COUNT(*) as count FROM artists');
  if (count.count > 0) {
    console.log(`⚠️  ${count.count} artistes existent déjà dans la base`);
    console.log('   Utilisez --force pour réimporter (suppression préalable)');
    
    // Afficher quand même le récap
    console.log('\n📊 DONNÉES EXISTANTES');
    const existing = await dbAll(`
      SELECT name, location, styleSignature FROM artists LIMIT 10
    `);
    existing.forEach((a, i) => {
      console.log(`  ${i+1}. ${a.name} - ${a.location}`);
    });
    
    process.exit(0);
  }
}

// Main
async function main() {
  console.log('🚀 ArtFolio Beta - Import de contenu\n');
  
  await checkDatabase();
  
  const force = process.argv.includes('--force');
  if (force) {
    console.log('⚠️  Mode force: suppression des données existantes...');
    await dbRun('DELETE FROM artworks WHERE artist_id IN (SELECT userId FROM artists)');
    await dbRun('DELETE FROM artists');
    await dbRun('DELETE FROM users WHERE email LIKE "%@artfolio.demo"');
    console.log('✅ Données précédentes supprimées\n');
  }
  
  await checkExistingData();
  await importArtists();
}

main().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
