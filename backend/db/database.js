/**
 * Connexion SQLite singleton — une seule connexion partagée pour tout le serveur.
 * Évite les SQLITE_BUSY liés aux open/close fréquents.
 * 
 * NOTE: Wrapper avec try-catch pour permettre le démarrage même si sqlite3
 * n'est pas compilé (utile pour Railway/Render où la compilation peut échouer temporairement)
 */

let sqlite3 = null;
let dbModule = null;

try {
  sqlite3 = require('sqlite3').verbose();
} catch (err) {
  console.error('⚠️ sqlite3 non disponible:', err.message);
  console.log('📝 Mode sans base de données activé');
}

const path = require('path');

const DB_PATH = path.join(__dirname, 'artfolio.db');
let _db = null;

function getDb() {
  if (!sqlite3) {
    throw new Error('SQLite3 non disponible - base de données désactivée');
  }
  if (!_db) {
    _db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) { console.error('❌ Erreur connexion DB:', err.message); }
      else { console.log('✅ Base SQLite connectée (singleton)'); }
    });
    // WAL mode pour de meilleures performances en lecture concurrente
    _db.run('PRAGMA journal_mode=WAL');
    _db.run('PRAGMA foreign_keys=ON');
  }
  return _db;
}

// Wrappers promisifiés avec fallback si DB indisponible
function dbGet(sql, params = []) {
  if (!sqlite3) {
    console.warn('⚠️ dbGet appelé mais DB non disponible');
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });
}

function dbAll(sql, params = []) {
  if (!sqlite3) {
    console.warn('⚠️ dbAll appelé mais DB non disponible');
    return Promise.resolve([]);
  }
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

function dbRun(sql, params = []) {
  if (!sqlite3) {
    console.warn('⚠️ dbRun appelé mais DB non disponible');
    return Promise.resolve({ lastID: 0, changes: 0 });
  }
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
      err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { getDb, dbGet, dbAll, dbRun, isAvailable: () => !!sqlite3 };
