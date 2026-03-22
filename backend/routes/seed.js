const express = require('express');
const { dbRun, dbGet, dbAll } = require('../db/database');
const router = express.Router();

// Données seed intégrées
const seedData = [
  {
    name: "Élise Moreau",
    slug: "elise-moreau",
    location: "Lyon, France",
    bio: "Artiste abstrait explorant la frontière entre le visible et l'invisible.",
    story: "Née en 1987 dans une famille d'ouvriers, Élise a grandi au milieu des usines désaffectées du Rhône.",
    style_tags: ["Abstrait", "Industriel", "Monumental"],
    color_palette: ["#2C2C2C", "#8B4513", "#D4A574", "#4A4A4A", "#E8E8E8"],
    image: "https://placehold.co/400x400/2C2C2C/D4A574?text=EM",
    artworks: [
      { title: "Mémoires d'Acier", medium: "Acrylique et rouille", price: 4500, year: 2023, status: "available", image: "https://placehold.co/800x1000/2C2C2C/D4A574" },
      { title: "Silence de Gris", medium: "Huile et bitume", price: 3800, year: 2024, status: "available", image: "https://placehold.co/800x1000/4A4A4A/E8E8E8" },
      { title: "Structure IX", medium: "Technique mixte", price: 2200, year: 2024, status: "sold", image: "https://placehold.co/800x800/8B4513/D4A574" }
    ]
  },
  {
    name: "Marcus Chen",
    slug: "marcus-chen",
    location: "Paris, France",
    bio: "Fusion esthétique numérique et traditions asiatiques.",
    story: "Né à Singapour en 1990, Marcus a étudié le design interactif à la RISD.",
    style_tags: ["Digital", "Cyberpunk", "Néon"],
    color_palette: ["#00F0FF", "#FF006E", "#1A1A2E", "#16213E", "#E94560"],
    image: "https://placehold.co/400x400/1A1A2E/00F0FF?text=MC",
    artworks: [
      { title: "Neon Dreams #42", medium: "Print aluminium LED", price: 6500, year: 2024, status: "available", image: "https://placehold.co/800x533/1A1A2E/00F0FF" },
      { title: "Data Portrait Alpha", medium: "Print dibond", price: 3200, year: 2023, status: "available", image: "https://placehold.co/800x800/16213E/E94560" },
      { title: "Glitch Garden", medium: "NFT + Print", price: 4800, year: 2024, status: "available", image: "https://placehold.co/800x533/1A1A2E/FF006E" },
      { title: "Void Signal", medium: "Installation lumineuse", price: 12000, year: 2023, status: "available", image: "https://placehold.co/800x600/000000/00F0FF" }
    ]
  },
  {
    name: "Sofia Andersson",
    slug: "sofia-andersson",
    location: "Marseille, France",
    bio: "Photographe minimaliste, paysages scandinaves.",
    story: "Ancienne ingénieure, elle a quitté son métier pour la photographie.",
    style_tags: ["Photographie", "Minimaliste", "Nature"],
    color_palette: ["#1A1A1A", "#4A4A4A", "#9A9A9A", "#D4D4D4", "#F5F5F5"],
    image: "https://placehold.co/400x400/1A1A1A/D4D4D4?text=SA",
    artworks: [
      { title: "Brume #7", medium: "Tirage argentique", price: 2800, year: 2023, status: "available", image: "https://placehold.co/1000x667/4A4A4A/9A9A9A" },
      { title: "Silence Arctique", medium: "Tirage pigmentaire", price: 1800, year: 2024, status: "available", image: "https://placehold.co/800x1200/1A1A1A/F5F5F5" },
      { title: "Eau et Pierre", medium: "Tirage argentique", price: 1200, year: 2023, status: "available", image: "https://placehold.co/600x900/4A4A4A/D4D4D4" }
    ]
  },
  {
    name: "Antoine Dubois",
    slug: "antoine-dubois",
    location: "Bruxelles, Belgique",
    bio: "Portrait expressionniste, intensité psychologique.",
    story: "Élève de l'atelier de Beaux-Arts de Rouen.",
    style_tags: ["Portrait", "Expressionnisme", "Figuratif"],
    color_palette: ["#8B0000", "#D2691E", "#1A1A1A", "#F4E4C1", "#CD853F"],
    image: "https://placehold.co/400x400/8B0000/F4E4C1?text=AD",
    artworks: [
      { title: "Le Regard #12", medium: "Huile sur toile", price: 15000, year: 2024, status: "available", image: "https://placehold.co/800x1000/8B0000/F4E4C1" },
      { title: "Mère", medium: "Huile et collage", price: 12000, year: 2023, status: "sold", image: "https://placehold.co/800x622/D2691E/F4E4C1" },
      { title: "Triptyque des Oublieux", medium: "Huile sur trois toiles", price: 25000, year: 2024, status: "available", image: "https://placehold.co/1200x500/1A1A1A/CD853F" }
    ]
  },
  {
    name: "Yuki Tanaka",
    slug: "yuki-tanaka",
    location: "Paris, France",
    bio: "Céramique contemporaine, formes organiques.",
    story: "Céramiste japonaise formée à Kyoto.",
    style_tags: ["Céramique", "Organique", "Minimaliste"],
    color_palette: ["#F5F5DC", "#D4C4B0", "#8B7355", "#4A4A4A", "#2F4F4F"],
    image: "https://placehold.co/400x400/F5F5DC/8B7355?text=YT",
    artworks: [
      { title: "Vagues de Terre I", medium: "Grès émaillé", price: 8500, year: 2024, status: "available", image: "https://placehold.co/1000x667/F5F5DC/D4C4B0" },
      { title: "Mousse Noire", medium: "Raku", price: 2200, year: 2023, status: "available", image: "https://placehold.co/800x800/2F4F4F/8B7355" },
      { title: "Érosion II", medium: "Porcelaine", price: 4800, year: 2024, status: "available", image: "https://placehold.co/800x1200/D4C4B0/8B7355" }
    ]
  }
];

// POST /api/seed - Initialiser la DB avec les données beta
router.post('/seed', async (req, res) => {
  try {
    // Vérifier si des données existent déjà
    const existing = await dbGet('SELECT COUNT(*) as count FROM users WHERE email LIKE ?', ['%@artfolio.demo']);
    
    if (existing.count > 0) {
      return res.json({ 
        status: 'already_seeded', 
        message: `${existing.count} artistes déjà importés`,
        artists: existing.count 
      });
    }

    let artistCount = 0;
    let artworkCount = 0;

    for (const artistData of seedData) {
      const email = `${artistData.slug}@artfolio.demo`;
      
      // Insérer user
      const userResult = await dbRun(
        `INSERT INTO users (name, email, password_hash, role, plan, location, bio, avatar_url, ai_bio, ai_style_tags) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          artistData.name, email, 'demo_hash', 'artist', 'pro', 
          artistData.location, artistData.bio, artistData.image,
          artistData.bio, JSON.stringify(artistData.style_tags)
        ]
      );

      const userId = userResult.lastID;

      // Insérer artist profile
      await dbRun(
        `INSERT INTO artists (userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, artistData.name, email, artistData.bio, artistData.story,
          JSON.stringify(artistData.style_tags),
          JSON.stringify(artistData.color_palette),
          artistData.style_tags[0], 'masonry'
        ]
      );

      // Insérer œuvres
      for (const artwork of artistData.artworks) {
        await dbRun(
          `INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, featured) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            artwork.title, userId, artwork.medium, artistData.style_tags[0],
            `${artwork.title} - Œuvre de ${artistData.name}`,
            artwork.price, artwork.status === 'available' ? 1 : 0,
            artwork.image, artwork.year, Math.random() > 0.7 ? 1 : 0
          ]
        );
        artworkCount++;
      }
      artistCount++;
    }

    res.json({
      status: 'success',
      message: 'Données beta importées',
      artists: artistCount,
      artworks: artworkCount
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/seed/status - Vérifier le statut
router.get('/seed/status', async (req, res) => {
  try {
    const artists = await dbGet('SELECT COUNT(*) as count FROM users WHERE email LIKE ?', ['%@artfolio.demo']);
    const artworks = await dbGet('SELECT COUNT(*) as count FROM artworks WHERE artist_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%@artfolio.demo']);
    
    res.json({
      seeded: artists.count > 0,
      artists: artists.count,
      artworks: artworks.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
