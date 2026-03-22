# 🚀 Guide d'Import Base de Données ArtFolio Beta

## Résumé du Contenu Généré

### 15 Artistes Créés
| # | Artiste | Style | Œuvres | Prix moyen |
|---|---------|-------|--------|------------|
| 1 | Élise Moreau | Abstrait industriel | 3 | €3 500 |
| 2 | Marcus Chen | Art numérique néon | 4 | €6 125 |
| 3 | Sofia Andersson | Photo minimaliste | 3 | €1 933 |
| 4 | Antoine Dubois | Portrait expressionniste | 3 | €17 000 |
| 5 | Yuki Tanaka | Céramique organique | 3 | €5 167 |
| 6 | Lucas Martínez | Street art | 3 | €4 833 |
| 7 | Camille Lefèvre | Art textile | 3 | €5 467 |
| 8 | Omar Hassan | Calligraphie abstraite | 3 | €4 500 |
| 9 | Nina Petrova | Photo documentaire | 3 | €2 400 |
| 10 | Jean-Paul Rousseau | Paysage impressionniste | 3 | €5 833 |
| 11 | Maya Cohen | Sculpture verre | 2 | €11 250 |
| 12 | Théo Bernard | Relief abstrait | 2 | €5 500 |
| 13 | Léa Martin | Illustration onirique | 2 | €1 650 |
| 14 | Daniel Okafor | Sculpture africaine | 2 | €9 250 |
| 15 | Anna Schmidt | Art cinétique | 2 | €20 000 |

**Total : 15 artistes, 41 œuvres, prix entre €1500 et €25000**

## Fichiers Source
- `content/seed_data_part1.json` — Artistes 1-5
- `content/seed_data_part2.json` — Artistes 6-10
- `content/seed_data_part3.json` — Artistes 11-15

## Commandes SQL d'Import

### 1. Créer un script Node.js d'import
```javascript
// scripts/seed-database.js
const fs = require('fs');
const path = require('path');
const { Artist, Artwork } = require('../backend/models');

const seedData = [
  ...require('../content/seed_data_part1.json').artists,
  ...require('../content/seed_data_part2.json').artists,
  ...require('../content/seed_data_part3.json').artists
];

async function seedDatabase() {
  for (const artistData of seedData) {
    // Créer l'artiste
    const artist = await Artist.create({
      name: artistData.name,
      slug: artistData.slug,
      bio: artistData.bio,
      location: artistData.location,
      specialty: artistData.specialty,
      image: artistData.image
    });
    
    // Créer les œuvres
    for (const artwork of artistData.artworks) {
      await Artwork.create({
        ...artwork,
        artist_id: artist.id
      });
    }
  }
  console.log(`Imported ${seedData.length} artists`);
}

seedDatabase();
```

### 2. Ou insérer directement en SQLite
```bash
cd /root/.openclaw/workspace/ArtFolio-main/backend
node -e "
const db = require('./db/database');
const data = require('../content/seed_data_part1.json');
// ... insert logic
"
```

## Images
Les images utilisent placehold.co avec les couleurs de la palette de chaque artiste. En production, remplacer par des images réelles.

## Prochaines Étapes
1. [ ] Créer le script d'import automatique
2. [ ] Exécuter l'import en DB
3. [ ] Vérifier l'affichage sur le site
4. [ ] Remplacer les placeholders par vraies images
