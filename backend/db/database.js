/**
 * Connexion SQLite singleton — une seule connexion partagée pour tout le serveur.  
 * Évite les SQLITE_BUSY liés aux open/close fréquents.
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'artfolio.db');
let _db = null;

function getDb() {
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

// Wrappers promisifiés
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
      err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { getDb, dbGet, dbAll, dbRun };
