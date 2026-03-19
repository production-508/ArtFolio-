#!/usr/bin/env node
/**
 * Télécharge des images d'art en domaine public et les stocke localement.
 * Exécuter une seule fois : node db/download-images.js
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const IMG_DIR = path.join(__dirname, '..', 'public', 'images');
const DB_PATH = path.join(__dirname, 'artfolio.db');

// Créer le dossier si nécessaire
fs.mkdirSync(IMG_DIR, { recursive: true });

// 12 images d'art en domaine public — uniquement Wikimedia Commons
// On les réutilise pour les 42 œuvres avec de la variété
const SOURCE_IMAGES = [
  { file: 'monet-water-lilies.jpg',  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg' },
  { file: 'vangogh-starry-night.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
  { file: 'klimt-kiss.jpg',          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/757px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' },
  { file: 'kandinsky.jpg',           url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/800px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg' },
  { file: 'vermeer-pearl.jpg',       url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Vermeer_-_Girl_with_a_Pearl_Earring.jpg/778px-Vermeer_-_Girl_with_a_Pearl_Earring.jpg' },
  { file: 'munch-scream.jpg',        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Munch_The_Scream_lithograph.png/651px-Munch_The_Scream_lithograph.png' },
  { file: 'monet-garden.jpg',        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg/800px-Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg' },
  { file: 'vangogh-sunflowers.jpg',  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg/683px-Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg' },
  { file: 'caspar-wanderer.jpg',     url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/703px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg' },
  { file: 'modigliani.jpg',          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Modigliani_-_Portrait_of_a_Girl.jpg/572px-Modigliani_-_Portrait_of_a_Girl.jpg' },
  { file: 'millet-gleaners.jpg',     url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg/800px-Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg' },
  { file: 'pissarro-boulevard.jpg',  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Mardi_Gras.jpg/800px-Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Mardi_Gras.jpg' },
];

// Attribution des images aux œuvres — variety for demo
const ASSIGNMENT = [
  { title: 'Lumière de Seine #3',        img: 'monet-water-lilies.jpg' },
  { title: 'Abstraction Bleue',           img: 'kandinsky.jpg' },
  { title: 'Jardin de Mémoire',           img: 'monet-garden.jpg' },
  { title: 'Tempête Intérieure',          img: 'munch-scream.jpg' },
  { title: 'Aquarelle Urbaine I',         img: 'pissarro-boulevard.jpg' },
  { title: 'Fusion Dorée',               img: 'klimt-kiss.jpg' },
  { title: 'Portrait au Trait',           img: 'modigliani.jpg' },
  { title: 'Série Bleue — Variation IV', img: 'vangogh-starry-night.jpg' },
  { title: 'Seuil',                       img: 'caspar-wanderer.jpg' },
  { title: 'Silhouette #7',              img: 'modigliani.jpg' },
  { title: "Architecture de l'Absence",  img: 'pissarro-boulevard.jpg' },
  { title: 'Équilibre',                  img: 'klimt-kiss.jpg' },
  { title: 'La Ville qui dort',          img: 'vangogh-starry-night.jpg' },
  { title: 'Texture III',               img: 'kandinsky.jpg' },
  { title: 'Contre-jour',               img: 'caspar-wanderer.jpg' },
  { title: 'Espace Négatif',            img: 'monet-water-lilies.jpg' },
  { title: 'Forme Tellurique I',        img: 'millet-gleaners.jpg' },
  { title: 'Vase des Calanques',        img: 'monet-garden.jpg' },
  { title: 'Série Ocre — III',          img: 'klimt-kiss.jpg' },
  { title: 'Mémoire de Pierre',         img: 'caspar-wanderer.jpg' },
  { title: 'Bol à thé, édition unique', img: 'vermeer-pearl.jpg' },
  { title: 'Madonna Neon',              img: 'kandinsky.jpg' },
  { title: 'Saint Sébastien Tropical',  img: 'munch-scream.jpg' },
  { title: 'Pietà Favela',             img: 'modigliani.jpg' },
  { title: 'Ex-voto Numérique #4',     img: 'vangogh-starry-night.jpg' },
  { title: 'Côte Amalfitaine, août',   img: 'monet-water-lilies.jpg' },
  { title: 'Marché de Pigalle',        img: 'pissarro-boulevard.jpg' },
  { title: 'Étude de Roses Jaunes',    img: 'vangogh-sunflowers.jpg' },
  { title: 'Nu à la Fenêtre',          img: 'modigliani.jpg' },
  { title: 'Jardin en Hiver',          img: 'monet-garden.jpg' },
  { title: 'Soleil Couchant sur la Loire', img: 'monet-water-lilies.jpg' },
  { title: 'Fatima, Tlemcen',          img: 'vermeer-pearl.jpg' },
  { title: 'Jeunesse de Tunis',        img: 'modigliani.jpg' },
  { title: "Café d'Alexandrie",        img: 'pissarro-boulevard.jpg' },
  { title: 'Hammam, Fès',              img: 'millet-gleaners.jpg' },
  { title: 'Atlas, Neige',             img: 'caspar-wanderer.jpg' },
  { title: "L'Enfant à l'Horloge",    img: 'munch-scream.jpg' },
  { title: 'Le Lac des Morts',         img: 'vangogh-starry-night.jpg' },
  { title: 'Autoportrait au Renard',   img: 'klimt-kiss.jpg' },
  { title: 'Chambre en Sibérie',       img: 'kandinsky.jpg' },
  { title: 'La Botaniste',             img: 'monet-garden.jpg' },
  { title: 'Nuit Blanche à Moscou',    img: 'caspar-wanderer.jpg' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) { return resolve(false); } // déjà téléchargé
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, {
      headers: { 'User-Agent': 'ArtFolio-Downloader/1.0 (educational demo)' },
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', err => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function run() {
  console.log('📥 Téléchargement des images en local...\n');

  // Télécharger les images sources
  for (const { file, url } of SOURCE_IMAGES) {
    const dest = path.join(IMG_DIR, file);
    try {
      const downloaded = await download(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`  ${downloaded ? '⬇' : '✓'} ${file} (${(size/1024).toFixed(0)}KB)`);
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }

  console.log('\n📦 Mise à jour des URLs dans la BDD...');
  const db = new sqlite3.Database(DB_PATH);
  let updated = 0;

  for (const { title, img } of ASSIGNMENT) {
    const localUrl = `/images/${img}`;
    await new Promise(resolve => {
      db.run('UPDATE artworks SET image_url = ? WHERE title = ?', [localUrl, title], function(err) {
        if (!err && this.changes > 0) { updated++; process.stdout.write('✓'); }
        resolve();
      });
    });
  }

  db.close();
  console.log(`\n\n✅ ${updated}/${ASSIGNMENT.length} œuvres mises à jour`);
  console.log('🎨 Images servies via http://localhost:3001/images/{nom-fichier}');
}

run().catch(console.error);
