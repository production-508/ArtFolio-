const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/artfolio.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("UPDATE users SET role = 'admin' WHERE email = 'thomas.blanchard@example.com'", function(err) {
    if (err) {
      console.error("Erreur:", err.message);
    } else {
      console.log(`Rôles modifiés : ${this.changes} utilisateur(s)`);
    }
  });

  db.all("SELECT id, email, role FROM users", (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);
    db.close();
  });
});
