#!/usr/bin/env node
/**
 * Initialisation de la base de données avec better-sqlite3
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db/artfolio.db');
const SCHEMA_PATH = path.join(__dirname, 'db/schema.sql');
const ARTISTS_SCHEMA_PATH = path.join(__dirname, 'db/artists_schema.sql');

console.log('🔧 Initialisation de la base de données...\n');

try {
  // Supprimer l'ancienne DB si elle existe (optionnel)
  // if (fs.existsSync(DB_PATH)) {
  //   fs.unlinkSync(DB_PATH);
  //   console.log('🗑️  Ancienne base de données supprimée');
  // }

  // Créer la connexion
  const db = new Database(DB_PATH);
  console.log('✅ Connexion établie\n');

  // Activer les clés étrangères
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Lire et exécuter le schéma principal
  console.log('📜 Exécution du schéma principal...');
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  console.log('✅ Schéma principal créé\n');

  // Lire et exécuter le schéma des artistes
  console.log('📜 Exécution du schéma artists...');
  const artistsSchema = fs.readFileSync(ARTISTS_SCHEMA_PATH, 'utf8');
  db.exec(artistsSchema);
  console.log('✅ Schéma artists créé\n');

  // Vérifier les tables créées
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📊 Tables créées:');
  tables.forEach(t => console.log(`  - ${t.name}`));

  db.close();
  console.log('\n✨ Base de données initialisée avec succès!');
  process.exit(0);

} catch (error) {
  console.error('💥 Erreur:', error.message);
  process.exit(1);
}
