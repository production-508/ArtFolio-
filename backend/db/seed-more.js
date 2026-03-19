/**
 * Script pour injecter des artistes et œuvres supplémentaires dans la BDD.
 * Usage : node db/seed-more.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'artfolio.db');
const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function seed() {
  await run('PRAGMA foreign_keys = ON');

  const password = bcrypt.hashSync('demo1234', 10);

  const artists = [
    {
      name: 'Camille Laurent',
      email: 'camille@artfolio.art',
      plan: 'pro',
      avatar_url: 'https://api.dicebear.com/8.x/lorelei/svg?seed=camille',
      bio: 'Sculptrice céramiste basée à Marseille, Camille travaille l\'argile comme matière vivante.',
      location: 'Marseille, France',
      website: 'https://camillelaurent.fr',
      instagram: '@camille.ceramique',
      ai_bio: 'Camille Laurent est une sculptrice et céramiste dont l\'œuvre interroge le rapport de l\'homme à la terre. Formée à l\'École des Arts Décoratifs de Marseille, elle développe un langage plastique ancré dans le territoire méditerranéen, entre forme organique et abstraction poétique.',
      ai_statement: 'L\'argile garde la mémoire de mes mains — chaque pièce est un dialogue entre ma volonté et la résistance de la matière. Je ne façonne pas, je négocie.',
      ai_style_tags: JSON.stringify(['Céramique', 'Organique', 'Contemporain', 'Méditerranée']),
      artworks: [
        ['Forme Tellurique I', 'Sculpture', 'Contemporain', 'Grès chamotté et glaçure cendres. La terre garde l\'empreinte du feu.', 1400, 1, 2024, '30 × 20 × 20 cm', 1],
        ['Vase des Calanques', 'Sculpture', 'Réalisme', 'Porcelaine fine émaillée, inspirée des formes marines des calanques marseillaises.', 680, 1, 2024, '35 × 18 cm', 0],
        ['Série Ocre — III', 'Sculpture', 'Minimalisme', 'Terre de Vallauris, engobe ocre et or. Troisième pièce d\'une série de sept.', 920, 1, 2023, '25 × 25 × 12 cm', 1],
        ['Mémoire de Pierre', 'Sculpture', 'Abstrait', 'Raku noir. Cette pièce raconte l\'érosion — celle du temps sur la pierre, des années sur les visages.', 1800, 0, 2022, '40 × 30 × 25 cm', 0],
        ['Bol à thé, édition unique', 'Sculpture', 'Minimalisme', 'Porcelaine translucide, glaçure céladon. Pour ralentir, enfin.', 380, 1, 2024, 'Ø 14 cm', 0],
      ]
    },
    {
      name: 'Lucas Ferreira',
      email: 'lucas@artfolio.art',
      plan: 'starter',
      avatar_url: 'https://api.dicebear.com/8.x/lorelei/svg?seed=lucas',
      bio: 'Artiste numérique et illustrateur franco-brésilien, Lucas mêle culture pop et iconographie baroque.',
      location: 'Bordeaux, France',
      website: 'https://lucasferreira.art',
      instagram: '@lucas.ferreira.art',
      ai_bio: 'Lucas Ferreira est un artiste numérique et illustrateur dont l\'œuvre fusionne l\'iconographie baroque européenne et la culture visuelle brésilienne. Né à São Paulo, il développe depuis Bordeaux un style hybride et coloré qui questionne les notions d\'identité, de métissage culturel et de sacré contemporain.',
      ai_statement: 'Je place des saints baroques dans des décors de favela, des madonnes en néon dans des jungles tropicales. C\'est ma façon de réconcilier les deux moitiés de mon âme.',
      ai_style_tags: JSON.stringify(['Art numérique', 'Baroque', 'Pop Art', 'Hybride']),
      artworks: [
        ['Madonna Neon', 'Acrylique', 'Surréalisme', 'Madone baroque recomposée à la lumière des enseignes au néon de São Paulo la nuit.', 1100, 1, 2024, '60 × 80 cm', 1],
        ['Saint Sébastien Tropical', 'Photographie', 'Contemporain', 'Tirage fine art, impression UV sur aluminium. Saint Sébastien dans une jungle de Bahia.', 850, 1, 2023, '50 × 70 cm — édition 3/10', 0],
        ['Pietà Favela', 'Dessin', 'Réalisme', 'Encre de Chine et aquarelle. La Pietà réinterprétée dans une favela de Rio.', 620, 1, 2023, '42 × 59 cm', 0],
        ['Ex-voto Numérique #4', 'Acrylique', 'Abstrait', 'Impression giclée sur toile, retravaillée à l\'acrylique. Vœu adressé à un saint de synthèse.', 490, 1, 2024, '40 × 40 cm', 0],
      ]
    },
    {
      name: 'Sofia Marchetti',
      email: 'sofia@artfolio.art',
      plan: 'pro',
      avatar_url: 'https://api.dicebear.com/8.x/lorelei/svg?seed=sofia',
      bio: 'Peintre italienne établie à Paris, Sofia explore la lumière et la couleur dans une veine néo-impressionniste.',
      location: 'Paris, France',
      website: 'https://sofiamarchetti.com',
      instagram: '@sofia.marchetti.peinture',
      ai_bio: 'Sofia Marchetti est une peintre italienne installée à Paris dont les toiles célèbrent la lumière comme matière première de la perception. Héritière d\'une tradition visuelle méditerranéenne, elle dialogue avec les impressionnistes tout en affirmant un langage pictural décidément contemporain.',
      ai_statement: 'Je peins la lumière qui reste après que la scène a disparu. Pas le coucher de soleil, mais ce que l\'œil gardera en mémoire une heure plus tard — cette couleur impossible, légèrement fausse, infiniment vraie.',
      ai_style_tags: JSON.stringify(['Néo-impressionnisme', 'Lumière', 'Méditerranée', 'Peinture']),
      artworks: [
        ['Côte Amalfitaine, août', 'Huile sur toile', 'Impressionnisme', 'Peint sur place, en trois sessions. Le bleu de la Méditerranée à l\'heure où le ciel et la mer deviennent indiscernables.', 4200, 1, 2023, '90 × 60 cm', 1],
        ['Marché de Pigalle', 'Huile sur toile', 'Réalisme', 'Une scène matinale au marché, saisie à la lumière rasante de septembre.', 2800, 1, 2024, '70 × 50 cm', 1],
        ['Étude de Roses Jaunes', 'Aquarelle', 'Impressionnisme', 'Aquarelle sur papier Arches 300g. Une étude de lumière à travers des pétales translucides.', 650, 1, 2024, '30 × 40 cm', 0],
        ['Nu à la Fenêtre', 'Huile sur toile', 'Réalisme', 'Contre-jour intime. La lumière d\'une fenêtre parisienne dessine un corps en silence.', 5500, 0, 2022, '100 × 80 cm', 0],
        ['Jardin en Hiver', 'Acrylique', 'Impressionnisme', 'Les Tuileries sous la neige — le gris et le blanc, une symphonie presque monochrome.', 1900, 1, 2023, '60 × 60 cm', 0],
        ['Soleil Couchant sur la Loire', 'Aquarelle', 'Impressionnisme', 'Série de voyage. La Loire à Amboise à l\'heure d\'or, en trois coups de pinceau.', 480, 1, 2024, '21 × 29 cm', 0],
      ]
    },
    {
      name: 'Karim Benali',
      email: 'karim@artfolio.art',
      plan: 'pro',
      avatar_url: 'https://api.dicebear.com/8.x/lorelei/svg?seed=karim',
      bio: 'Photographe documentaire et portraitiste, Karim sillonne le monde arabe pour capturer les visages de la modernité.',
      location: 'Lyon, France',
      website: 'https://karimbenali.photos',
      instagram: '@karim.benali.photos',
      ai_bio: 'Karim Benali est un photographe documentaire franco-algérien dont le travail dresse un portrait intime et politique du monde arabe contemporain. Lauréat du Prix Leica Oskar Barnack en 2021, il collabore avec Le Monde, GEO et National Geographic.',
      ai_statement: 'Je photographie les visages que l\'histoire n\'a pas retenus. Ces femmes de Tlemcen, ces jeunes de Tunis, ces vieux d\'Alexandrie — ils portent un siècle dans leurs yeux. Je veux juste que vous les regardiez.',
      ai_style_tags: JSON.stringify(['Photographie documentaire', 'Portrait', 'Monde arabe', 'Humaniste']),
      artworks: [
        ['Fatima, Tlemcen', 'Photographie', 'Réalisme', 'Portrait argentique. Fatima, 78 ans, tisseuse de tapis depuis soixante ans. Son regard est un roman.', 1600, 1, 2023, '50 × 70 cm — édition 2/7', 1],
        ['Jeunesse de Tunis', 'Photographie', 'Contemporain', 'Série de 5 tirages. La jeunesse tunisienne entre tradition et modernité, filmée en Kodak Porta.', 3200, 1, 2022, '40 × 60 cm — édition 1/5', 1],
        ['Café d\'Alexandrie', 'Photographie', 'Réalisme', 'Gélatine argentique. Un vieil homme joue au tawla dans un café fondé en 1923.', 1100, 0, 2021, '60 × 40 cm — édition 3/7', 0],
        ['Hammam, Fès', 'Photographie', 'Contemporain', 'Lumière naturelle uniquement. La vapeur du hammam comme voile entre deux mondes.', 980, 1, 2023, '40 × 40 cm — édition 5/10', 0],
        ['Atlas, Neige', 'Photographie', 'Réalisme', 'Un berger berbère dans la neige de l\'Atlas marocain — stoïcisme et beauté brute.', 1300, 1, 2024, '50 × 70 cm — édition 4/7', 0],
      ]
    },
    {
      name: 'Elena Volkov',
      email: 'elena@artfolio.art',
      plan: 'galerie',
      avatar_url: 'https://api.dicebear.com/8.x/lorelei/svg?seed=elena',
      bio: 'Peintre russo-française, Elena Volkov explore les territoires du surréalisme à travers une peinture onirique et précise.',
      location: 'Paris, France',
      website: 'https://elenavolkov.art',
      instagram: '@elena.volkov.art',
      ai_bio: 'Elena Volkov est une peintre russo-française dont les œuvres habitent un espace intérieur entre rêve lucide et mémoire personnelle. Récompensée par le Prix de la FIAC en 2020, elle expose régulièrement en Europe et en Asie.',
      ai_statement: 'Mes tableaux sont des rêves que j\'ai appris à peindre plutôt qu\'à oublier. Chaque figure, chaque paysage appartient à une géographie mentale qui n\'existe que dans la peinture.',
      ai_style_tags: JSON.stringify(['Surréalisme', 'Onirique', 'Précision', 'Symbolisme']),
      artworks: [
        ['L\'Enfant à l\'Horloge', 'Huile sur toile', 'Surréalisme', 'Une enfant tient une horloge dont les aiguilles tournent à l\'envers. Temps et mémoire.', 8500, 1, 2023, '110 × 90 cm', 1],
        ['Le Lac des Morts', 'Huile sur toile', 'Surréalisme', 'Un lac immobile sous un ciel de midi. Sur les eaux, des visages que l\'on reconnaît sans jamais les avoir vus.', 6200, 1, 2022, '90 × 70 cm', 1],
        ['Autoportrait au Renard', 'Huile sur toile', 'Surréalisme', 'Elle et le renard se regardent. Lequel est le masque de l\'autre ?', 4800, 1, 2024, '80 × 80 cm', 1],
        ['Chambre en Sibérie', 'Acrylique', 'Surréalisme', 'Une chambre d\'enfant dans un immeuble soviétique. Par la fenêtre, une forêt infinie de bouleaux.', 3600, 0, 2021, '70 × 55 cm', 0],
        ['La Botaniste', 'Huile sur toile', 'Réalisme', 'Portrait d\'une femme qui examine une plante inconnue. La science et le mystère, face à face.', 5100, 1, 2023, '95 × 75 cm', 0],
        ['Nuit Blanche à Moscou', 'Aquarelle', 'Impressionnisme', 'La neige et les lumières de Moscou à 3h du matin — une solitude heureuse.', 900, 1, 2024, '40 × 55 cm', 0],
      ]
    },
  ];

  let totalArtists = 0;
  let totalArtworks = 0;

  for (const artist of artists) {
    // Vérifier si l'artiste existe déjà
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [artist.email], (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });

    if (existing) {
      console.log(`⏭️  ${artist.name} existe déjà, ignoré.`);
      continue;
    }

    const result = await run(
      `INSERT INTO users (name, email, password_hash, role, plan, avatar_url, bio, location, website, instagram, ai_bio, ai_statement, ai_style_tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [artist.name, artist.email, password, 'artist', artist.plan,
       artist.avatar_url, artist.bio, artist.location, artist.website, artist.instagram,
       artist.ai_bio, artist.ai_statement, artist.ai_style_tags]
    );

    const artistId = result.lastID;
    totalArtists++;

    for (const [title, medium, style, description, price, available, year, dimensions, featured] of artist.artworks) {
      await run(
        `INSERT INTO artworks (artist_id, title, medium, style, description, price, available, image_url, year, dimensions, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [artistId, title, medium, style, description, price, available,
         `https://picsum.photos/seed/${title.replace(/\s+/g, '')}/800/600`,
         year, dimensions, featured]
      );
      totalArtworks++;
    }

    console.log(`✅ ${artist.name} ajouté·e (${artist.artworks.length} œuvres)`);
  }

  console.log(`\n🎨 Terminé : +${totalArtists} artistes, +${totalArtworks} œuvres`);
  db.close();
}

seed().catch(err => {
  console.error('❌ Erreur:', err.message);
  db.close();
  process.exit(1);
});
