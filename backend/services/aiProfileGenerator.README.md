# AI Profile Generator - Exemples et Documentation

## 📋 Utilisation

```javascript
const { generateArtistProfile, previewPrompt, clearCache } = require('./services/aiProfileGenerator');

// Exemple d'œuvres
const artworks = [
  {
    title: "Échos du silence",
    description: "Une exploration des émotions enfouies, où la lumière danse avec les ombres pour créer une harmonie parfaite.",
    style: "Abstrait contemporain",
    price: 850,
    medium: "Acrylique sur toile",
    dimensions: "100x80cm",
    year: 2023
  },
  {
    title: "Métamorphose urbaine",
    description: "La ville en constante mutation, capturée dans un moment de grâce entre destruction et renaissance.",
    style: "Street art, Contemporain",
    price: 1200,
    medium: "Mixte sur métal",
    dimensions: "150x100cm",
    year: 2024
  },
  {
    title: "Fragments de mémoire",
    description: "Des bribes de souvenirs s'assemblent comme un puzzle, révélant une histoire intime et universelle.",
    style: "Expressionnisme",
    price: 650,
    medium: "Huile sur toile",
    dimensions: "60x60cm",
    year: 2023
  }
];

// Génération du profil
generateArtistProfile(artworks, { language: 'fr' })
  .then(profile => console.log(profile))
  .catch(err => console.error(err));
```

## 🎯 Exemples de Prompts

### Prompt Système (Français)

```
Tu es un expert en analyse artistique et en rédaction de profils créatifs. 
Ta mission est d'analyser un portfolio d'œuvres d'art et de générer un profil artistique complet et captivant.

Tu dois retourner UNIQUEMENT un objet JSON valide avec cette structure exacte:
{
  "bio": "narrative captivante de 2-3 phrases décrivant l'artiste et son univers",
  "story": "motivation artistique, parcours et vision en 4-5 phrases",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "colorPalette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "styleSignature": "nom unique et évocateur du style de l'artiste",
  "layoutType": "minimaliste|galerie|mosaique|immersion|narratif"
}

Règles:
- La bio doit être engageante et donner envie d'explorer l'œuvre
- L'histoire doit révéler l'âme et les inspirations de l'artiste
- Les tags doivent être pertinents pour la découverte (5 max)
- La palette doit refléter les couleurs dominantes suggérées
- Le styleSignature doit être mémorable et unique
- Le layoutType recommande la meilleure présentation
```

### Prompt Utilisateur (Exemple)

```
ANALYSE DE PORTFOLIO ARTISTIQUE

=== RÉSUMÉ ===
{
  "totalWorks": 3,
  "priceRange": "650€ - 1200€",
  "averagePrice": "900€",
  "detectedStyles": ["Abstrait contemporain", "Street art", "Contemporain", "Expressionnisme"],
  "mediums": ["Acrylique sur toile", "Mixte sur métal", "Huile sur toile"],
  "yearRange": "2023-2024"
}

=== ŒUVRES ===
[
  {
    "index": 1,
    "title": "Échos du silence",
    "description": "Une exploration des émotions enfouies...",
    "style": "Abstrait contemporain",
    "price": "850€",
    "medium": "Acrylique sur toile",
    "dimensions": "100x80cm",
    "year": "2023"
  },
  ...
]

Génère un profil artistique complet basé sur cette analyse. Sois créatif, authentique et percutant.
```

## 📤 Format de Réponse

```json
{
  "bio": "Artiste expressionniste audacieux qui transcende les frontières entre l'abstrait et le figuratif. Son univers visuel invite à une contemplation profonde où chaque œuvre devient une fenêtre ouverte sur l'âme humaine.",
  "story": "Son parcours artistique est marqué par une quête incessante de l'authenticité émotionnelle. Influencé par les maîtres de l'expressionnisme abstrait et les dynamiques urbaines contemporaines, il développe un langage visuel unique qui dialogue entre tradition et modernité. Chaque toile est le fruit d'une introspection profonde, où les couches de peinture révèlent progressivement des histoires intimes. Avec des œuvres présentées dans une fourchette de 650€ à 1200€, il démocratise l'art contemporain tout en maintenant une exigence technique irréprochable.",
  "tags": ["expressionniste", "abstrait", "contemporain", "émotionnel", "urbain"],
  "colorPalette": ["#1A1A2E", "#E94560", "#F4D03F", "#4A4E69", "#F2E9E4"],
  "styleSignature": "Expressionnisme Structuré",
  "layoutType": "galerie",
  "metadata": {
    "artworksAnalyzed": 3,
    "priceRange": "650€ - 1200€",
    "detectedStyles": ["Abstrait contemporain", "Street art", "Expressionnisme"],
    "generatedAt": "2024-03-22T12:00:00.000Z",
    "model": "gpt-4-turbo-preview",
    "language": "fr",
    "tokensUsed": 892
  },
  "fromCache": false
}
```

## 🔧 Configuration

### Variables d'environnement

```bash
# Requis
OPENAI_API_KEY=sk-...

# Optionnel
OPENAI_MODEL=gpt-4-turbo-preview  # ou gpt-4o, gpt-4, etc.
```

### Options de génération

```javascript
const options = {
  language: 'fr',           // 'fr' | 'en' | autres
  model: 'gpt-4-turbo-preview'  // Modèle OpenAI
};

generateArtistProfile(artworks, options);
```

## 🛡️ Gestion des Erreurs

Le service inclut une gestion robuste des erreurs :

1. **Validation des entrées** : Vérifie que le tableau d'œuvres est valide
2. **Retry automatique** : 3 tentatives en cas d'erreur réseau
3. **Timeout** : 30 secondes maximum par requête
4. **Fallback local** : Génération locale si l'API échoue
5. **Cache** : Évite les appels répétés (TTL: 24h)

## 📝 Cache

```javascript
const { clearCache, getCacheStats } = require('./services/aiProfileGenerator');

// Vider le cache manuellement
clearCache();

// Voir les statistiques
const stats = getCacheStats();
console.log(stats);
```

## 🔍 Debug

```javascript
const { previewPrompt } = require('./services/aiProfileGenerator');

// Prévisualiser le prompt sans appeler l'API
const promptPreview = previewPrompt(artworks, 'fr');
console.log(promptPreview.system);
console.log(promptPreview.user);
console.log(`Estimation tokens: ${promptPreview.estimatedTokens}`);
```

## 🎨 Layout Types

| Type | Description | Recommandation |
|------|-------------|----------------|
| `minimaliste` | Épuré, focus sur l'œuvre | 1-3 œuvres |
| `galerie` | Grille classique | 4+ œuvres |
| `mosaique` | Disposition organique | Œuvres variées |
| `immersion` | Pleine largeur | Grandes œuvres |
| `narratif` | Séquencé | Séries thématiques |

## 📦 Dépendances

```json
{
  "openai": "^4.x",
  "node-cache": "^5.x"
}
```

## 🔗 Intégration Express

```javascript
const express = require('express');
const { generateArtistProfile } = require('./services/aiProfileGenerator');
const router = express.Router();

// POST /api/ai/generate-profile
router.post('/generate-profile', async (req, res) => {
  try {
    const { artworks, language } = req.body;
    
    if (!artworks || !Array.isArray(artworks) || artworks.length === 0) {
      return res.status(400).json({ 
        error: 'artworks array is required' 
      });
    }
    
    const profile = await generateArtistProfile(artworks, { language });
    res.json(profile);
    
  } catch (error) {
    console.error('Profile generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate profile',
      message: error.message 
    });
  }
});

module.exports = router;
```