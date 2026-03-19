const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/artfolio.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("UPDATE users SET role = 'admin' WHERE email LIKE '%blanchard%' OR email LIKE '%demo%' OR id = 12", function(err) {
    if (err) {
      console.error("Erreur:", err.message);
    } else {
      console.log(`Rôles modifiés : ${this.changes} utilisateur(s) passés en admin.`);
    }
  });

  db.all("SELECT id, email, role FROM users WHERE role = 'admin'", (err, rows) => {
    if (err) console.error(err);
    else console.log("Admins actuels:", rows);
    db.close();
  });
});
