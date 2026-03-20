# ArtworkAnalyzer

Composant React ultra-moderne pour l'analyse d'œuvres d'art par IA.

## 🎨 Features

- **Palette de couleurs** : 5 swatches interactifs avec codes hex copiables
- **Tags IA** : Badges de style avec animations d'apparition
- **Estimation prix** : Fourchette basse/haute avec barre de confiance animée
- **Description SEO** : Champ textarea éditable pré-rempli par l'IA
- **Style détecté** : Carte visuelle avec icône et nom du style

## 🚀 Installation

Les dépendances sont déjà incluses :
```bash
npm install framer-motion lucide-react
```

Tailwind CSS doit être configuré (déjà fait dans ce projet).

## 📖 Utilisation

### Basique

```jsx
import { ArtworkAnalyzer } from './components/ArtworkAnalyzer';

function ArtworkPage({ artworkId }) {
  return (
    <ArtworkAnalyzer 
      artworkId={artworkId}
      onAnalysisComplete={() => console.log('Analyse terminée')}
    />
  );
}
```

### Avec callback d'upload

```jsx
<ArtworkAnalyzer 
  artworkId={artworkId}
  onUploadRequest={() => setShowUploadModal(true)}
/>
```

### Test avec données mock

```jsx
import { mockAnalysisData, mockAnalyzeAPI } from './components/ArtworkAnalyzer/mockData';

// Utiliser les données mock pour tester l'UI
const data = mockAnalysisData;
```

## 🔌 API Endpoints

Le composant attend les endpoints suivants :

### POST /api/artworks/:id/analyze
Lance l'analyse et retourne :
```json
{
  "success": true,
  "analysis": {
    "palette": ["#FF6B35", "#F7C59F", "#2EC4B6", "#011627", "#E71D36"],
    "tags": ["Impressionniste", "Portrait", "Huile"],
    "style": "Impressionnisme",
    "priceEstimate": {
      "low": 450,
      "high": 800,
      "confidence": 0.85
    },
    "seoDescription": "Portrait impressionniste aux teintes chaudes...",
    "confidence": 0.87
  }
}
```

### GET /api/artworks/:id/analysis
Récupère une analyse existante (même format).

## 🎭 États

Le composant gère 4 états :
- **Empty** : Avant analyse, invitation à lancer l'analyse
- **Loading** : Animation pendant l'analyse (3-5s)
- **Success** : Affichage complet des résultats
- **Error** : Message d'erreur avec bouton retry

## 🎯 Design

- **Glassmorphism** : backdrop-blur, bg-white/5, border-white/10
- **Animations** : Framer Motion avec stagger, hover effects
- **Responsive** : Mobile (stack) / Desktop (grid 2 colonnes)
- **Palette** : S'adapte aux couleurs de l'œuvre analysée

## 📁 Structure

```
ArtworkAnalyzer/
├── index.jsx           # Composant principal
├── ColorSwatch.jsx     # Swatch de couleur interactif
├── ConfidenceBar.jsx   # Barre de confiance animée
├── StyleCard.jsx       # Carte de style détecté
└── mockData.js         # Données de test
```

## 🛠️ Props

| Prop | Type | Description |
|------|------|-------------|
| `artworkId` | string | ID de l'œuvre à analyser |
| `apiBaseUrl` | string | URL de base de l'API (optionnel) |
| `onAnalysisComplete` | () => void | Callback quand l'analyse est terminée |
| `onUploadRequest` | () => void | Callback pour demander un upload |

## 📝 Notes

- Pas de `console.log` en production
- Gestion des erreurs API robuste
- Les couleurs de la palette s'adaptent à l'œuvre
- Toast de confirmation lors de la copie d'une couleur
- Description SEO éditable avec sauvegarde
