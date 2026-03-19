/**
 * Convertit les URLs externes en URLs via le proxy local /api/img?url=...
 * Permet au navigateur de charger les images via localhost sans problèmes CORS
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'artfolio.db'));

const API_BASE = 'http://localhost:3001';

// Wikimedia Commons — vraies peintures domaine public
const ARTWORKS = [
  // Marie Dubois
  { title: 'Lumière de Seine #3',        ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg' },
  { title: 'Abstraction Bleue',           ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/800px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg' },
  { title: 'Jardin de Mémoire',           ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg/800px-Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg' },
  { title: 'Tempête Intérieure',          ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Munch_The_Scream_lithograph.png/651px-Munch_The_Scream_lithograph.png' },
  { title: 'Aquarelle Urbaine I',         ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Berthe_Morisot%2C_The_Harbor_at_Lorient.jpg/800px-Berthe_Morisot%2C_The_Harbor_at_Lorient.jpg' },
  { title: 'Fusion Dorée',               ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/757px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' },
  { title: 'Portrait au Trait',           ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Modigliani_-_Portrait_of_a_Girl.jpg/572px-Modigliani_-_Portrait_of_a_Girl.jpg' },
  { title: 'Série Bleue — Variation IV', ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
  // Thomas Renard
  { title: 'Seuil',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/703px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg' },
  { title: 'Silhouette #7',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/600px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg' },
  { title: "Architecture de l'Absence",
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Mardi_Gras.jpg/800px-Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Mardi_Gras.jpg' },
  { title: 'Équilibre',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/757px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' },
  { title: 'La Ville qui dort',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/800px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg' },
  { title: 'Texture III',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
  { title: 'Contre-jour',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Munch_The_Scream_lithograph.png/651px-Munch_The_Scream_lithograph.png' },
  { title: 'Espace Négatif',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg' },
  // Camille Laurent
  { title: 'Forme Tellurique I',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Pieta_Michelangelo.jpg/664px-Pieta_Michelangelo.jpg' },
  { title: 'Vase des Calanques',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg/800px-Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg' },
  { title: 'Série Ocre — III',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg/800px-Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg' },
  { title: 'Mémoire de Pierre',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/703px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg' },
  { title: 'Bol à thé, édition unique',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/757px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' },
  // Lucas Ferreira
  { title: 'Madonna Neon',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/800px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg' },
  { title: 'Saint Sébastien Tropical',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Munch_The_Scream_lithograph.png/651px-Munch_The_Scream_lithograph.png' },
  { title: 'Pietà Favela',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Pieta_Michelangelo.jpg/664px-Pieta_Michelangelo.jpg' },
  { title: 'Ex-voto Numérique #4',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
  // Sofia Marchetti
  { title: 'Côte Amalfitaine, août',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Berthe_Morisot%2C_The_Harbor_at_Lorient.jpg/800px-Berthe_Morisot%2C_The_Harbor_at_Lorient.jpg' },
  { title: 'Marché de Pigalle',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Mardi_Gras.jpg/800px-Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Mardi_Gras.jpg' },
  { title: 'Étude de Roses Jaunes',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg/683px-Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg' },
  { title: 'Nu à la Fenêtre',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Modigliani_-_Portrait_of_a_Girl.jpg/572px-Modigliani_-_Portrait_of_a_Girl.jpg' },
  { title: 'Jardin en Hiver',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg/800px-Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg' },
  { title: 'Soleil Couchant sur la Loire',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg' },
  // Karim Benali
  { title: 'Fatima, Tlemcen',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Vermeer_-_Girl_with_a_Pearl_Earring.jpg/778px-Vermeer_-_Girl_with_a_Pearl_Earring.jpg' },
  { title: 'Jeunesse de Tunis',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Modigliani_-_Portrait_of_a_Girl.jpg/572px-Modigliani_-_Portrait_of_a_Girl.jpg' },
  { title: "Café d'Alexandrie",
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Mardi_Gras.jpg/800px-Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Mardi_Gras.jpg' },
  { title: 'Hammam, Fès',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg/800px-Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg' },
  { title: 'Atlas, Neige',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/703px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg' },
  // Elena Volkov
  { title: "L'Enfant à l'Horloge",
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Munch_The_Scream_lithograph.png/651px-Munch_The_Scream_lithograph.png' },
  { title: 'Le Lac des Morts',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
  { title: 'Autoportrait au Renard',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/757px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' },
  { title: 'Chambre en Sibérie',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/800px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg' },
  { title: 'La Botaniste',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg/800px-Claude_Monet_-_The_Artist%27s_Garden_at_Giverny_-_W.1422_-_Mus%C3%A9e_d%27Orsay.jpg' },
  { title: 'Nuit Blanche à Moscou',
    ext: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/703px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg' },
];

// Convertir les URLs externes en URLs proxy local
let updated = 0;
let idx = 0;

function next() {
  if (idx >= ARTWORKS.length) {
    console.log(`\n✅ ${updated}/${ARTWORKS.length} URLs converties vers le proxy local`);
    db.close();
    return;
  }
  const { title, ext } = ARTWORKS[idx++];
  // URL via proxy local : /api/img?url={encoded}
  const proxyUrl = `${API_BASE}/api/img?url=${encodeURIComponent(ext)}`;
  db.run('UPDATE artworks SET image_url = ? WHERE title = ?', [proxyUrl, title], function(err) {
    if (err) console.error('❌', title, err.message);
    else if (this.changes > 0) { updated++; process.stdout.write('✓'); }
    next();
  });
}

console.log('🔄 Conversion des URLs vers le proxy local...');
next();
