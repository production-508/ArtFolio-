const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'artfolio.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Helper : promisifier les opérations sqlite3
function openDb() {
  return new sqlite3.Database(DB_PATH);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDb() {
  const db = openDb();
  await run(db, 'PRAGMA journal_mode = WAL');
  await run(db, 'PRAGMA foreign_keys = ON');

  // Appliquer le schéma
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  await new Promise((resolve, reject) => {
    db.exec(schema, err => err ? reject(err) : resolve());
  });

  // Vérifier si déjà seedé
  const row = await get(db, 'SELECT COUNT(*) as count FROM users');
  if (row.count > 0) {
    console.log('✅ Base de données déjà initialisée');
    db.close();
    return;
  }

  console.log('🌱 Initialisation de la base de données...');
  const passwordHash = bcrypt.hashSync('demo1234', 10);

  // Insérer les utilisateurs
  const marie = await run(db,
    `INSERT INTO users (name, email, password_hash, role, plan, avatar_url, bio, location, website, instagram, ai_bio, ai_statement, ai_style_tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Marie Dubois', 'marie@artfolio.art', passwordHash, 'artist', 'pro',
     'https://api.dicebear.com/8.x/lorelei/svg?seed=marie',
     "Peintre française basée à Paris, spécialisée dans l'art abstrait et les paysages impressionnistes.",
     'Paris, France', 'https://mariedubois.art', '@mariedubois.art',
     "Marie Dubois est une peintre française dont l'œuvre puise sa force dans la tension entre l'ordre et le chaos. Formée aux Beaux-Arts de Paris, elle déploie une palette chromatique d'une rare sensibilité, flirtant avec l'abstraction sans jamais renoncer à une profonde ancrage dans le réel.",
     "Je peins ce que les mots ne peuvent pas dire — la lumière changeante de la Seine au crépuscule, la vibration d'une foule en mouvement, le silence qui précède la tempête. Mon travail est une tentative de capturer l'insaisissable.",
     JSON.stringify(['Abstrait', 'Impressionnisme', 'Lyrique', 'Contemporain'])]
  );

  const thomas = await run(db,
    `INSERT INTO users (name, email, password_hash, role, plan, avatar_url, bio, location, website, instagram, ai_bio, ai_statement, ai_style_tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Thomas Renard', 'thomas@artfolio.art', passwordHash, 'artist', 'pro',
     'https://api.dicebear.com/8.x/lorelei/svg?seed=thomas',
     'Photographe et sculpteur contemporain, Thomas explore les frontières entre matière et lumière.',
     'Lyon, France', 'https://thomasrenard.fr', '@thomas.renard.art',
     "Thomas Renard est un artiste pluridisciplinaire lyonnais dont la pratique oscille entre photographie et sculpture. Autodidacte, il développe depuis dix ans un langage visuel singulier où la lumière devient matière première et la matière devient lumière.",
     "Chaque sculpture est une photographie arrêtée dans le bronze ; chaque photographie est une sculpture de lumière. Je ne distingue pas les médiums — je cherche la même vérité dans chacun d'eux.",
     JSON.stringify(['Minimalisme', 'Contemporain', 'Sculpture', 'Photographie'])]
  );

  await run(db,
    `INSERT INTO users (name, email, password_hash, role, plan, avatar_url, bio, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Admin ArtFolio', 'admin@artfolio.art', passwordHash, 'admin', 'galerie',
     'https://api.dicebear.com/8.x/lorelei/svg?seed=admin',
     'Équipe ArtFolio — gestion de la plateforme.', 'Paris, France']
  );

  const marieId = marie.lastID;
  const thomasId = thomas.lastID;

  // Insérer les œuvres
  const artworks = [
    [marieId, 'Lumière de Seine #3', 'Huile sur toile', 'Impressionnisme', "La Seine au crépuscule, saisie dans un instant de lumière dorée qui se fragmente sur l'eau.", 3200, 1, 'https://picsum.photos/seed/artwork1/800/600', 2023, '80 × 60 cm', 1],
    [marieId, 'Abstraction Bleue', 'Acrylique', 'Abstrait', "Une exploration des profondeurs de l'indigo — entre mer et ciel, entre rêve et réalité.", 1800, 1, 'https://picsum.photos/seed/artwork2/800/600', 2024, '100 × 80 cm', 1],
    [marieId, 'Jardin de Mémoire', 'Huile sur toile', 'Impressionnisme', "Une réminiscence de l'enfance, un jardin aux couleurs vives que seule la mémoire embellit.", 4500, 0, 'https://picsum.photos/seed/artwork3/800/600', 2022, '120 × 90 cm', 0],
    [marieId, 'Tempête Intérieure', 'Huile sur toile', 'Abstrait', 'Un tourbillon de gris et de blanc — la représentation visible de ce qui ne se voit pas.', 2700, 1, 'https://picsum.photos/seed/artwork4/800/600', 2023, '90 × 70 cm', 0],
    [marieId, 'Aquarelle Urbaine I', 'Aquarelle', 'Contemporain', "Paris sous la pluie — une étude chromatique de la ville à travers un voile d'eau.", 850, 1, 'https://picsum.photos/seed/artwork5/800/600', 2024, '42 × 30 cm', 0],
    [marieId, 'Fusion Dorée', 'Acrylique', 'Abstrait', "L'or, le cuivre et la terre rouge — une célébration de la matière et de la lumière.", 2200, 1, 'https://picsum.photos/seed/artwork6/800/600', 2023, '80 × 80 cm', 1],
    [marieId, 'Portrait au Trait', 'Dessin', 'Réalisme', "Un portrait en quelques traits — l'économie du geste comme révélation du caractère.", 450, 1, 'https://picsum.photos/seed/artwork7/800/600', 2024, '30 × 40 cm', 0],
    [marieId, 'Série Bleue — Variation IV', 'Acrylique', 'Minimalisme', "Quatrième pièce d'une série de cinq — variations autour d'un même bleu de Klein réimaginé.", 1650, 1, 'https://picsum.photos/seed/artwork8/800/600', 2022, '60 × 60 cm', 0],
    [thomasId, 'Seuil', 'Sculpture', 'Minimalisme', "Bronze patiné. Une forme simple qui interroge : qu'est-ce qui se passe exactement au seuil entre deux états ?", 7800, 1, 'https://picsum.photos/seed/artwork9/800/600', 2023, '45 × 30 × 20 cm', 1],
    [thomasId, 'Silhouette #7', 'Photographie', 'Contemporain', "Tirage argentique. Une silhouette contre la lumière d'une fenêtre d'usine désaffectée.", 1200, 1, 'https://picsum.photos/seed/artwork10/800/600', 2023, '60 × 40 cm — édition 5/10', 1],
    [thomasId, "Architecture de l'Absence", 'Photographie', 'Minimalisme', "Série de 3 tirages. Les vestiges d'un bâtiment industriel, photographiés à l'aube.", 2400, 1, 'https://picsum.photos/seed/artwork11/800/600', 2022, '80 × 55 cm — édition 3/5', 0],
    [thomasId, 'Équilibre', 'Sculpture', 'Contemporain', "Acier brossé et verre soufflé. Deux forces opposées maintenues en parfait équilibre sur un axe invisible.", 5600, 0, 'https://picsum.photos/seed/artwork12/800/600', 2021, '70 × 25 × 25 cm', 0],
    [thomasId, 'La Ville qui dort', 'Photographie', 'Réalisme', "Lyon à 4h du matin — la ville révèle sa beauté brute quand elle ne sait plus qu'on la regarde.", 980, 1, 'https://picsum.photos/seed/artwork13/800/600', 2024, '50 × 70 cm — édition 7/10', 0],
    [thomasId, 'Texture III', 'Sculpture', 'Abstrait', "Plâtre brut et résine. Une étude de surface — la matière révèle son histoire dans ses imperfections.", 3200, 1, 'https://picsum.photos/seed/artwork14/800/600', 2023, '40 × 40 × 15 cm', 1],
    [thomasId, 'Contre-jour', 'Photographie', 'Surréalisme', 'Un jeu de lumière et d ombres qui transforme le quotidien en paysage onirique.', 760, 1, 'https://picsum.photos/seed/artwork15/800/600', 2024, '40 × 60 cm — édition 2/10', 0],
    [thomasId, 'Espace Négatif', 'Sculpture', 'Minimalisme', "Aluminium anodisé. L'espace entre les formes est aussi important que les formes elles-mêmes.", 4800, 1, 'https://picsum.photos/seed/artwork16/800/600', 2022, '55 × 30 × 30 cm', 0],
  ];

  for (const [artist_id, title, medium, style, description, price, available, image_url, year, dimensions, featured] of artworks) {
    await run(db,
      `INSERT INTO artworks (artist_id, title, medium, style, description, price, available, image_url, year, dimensions, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [artist_id, title, medium, style, description, price, available, image_url, year, dimensions, featured]
    );
  }

  console.log(`✅ Seed terminé : ${artworks.length} œuvres, 3 utilisateurs`);
  db.close();
}

module.exports = { initDb, openDb, DB_PATH, run, get, all };
