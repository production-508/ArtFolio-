# 🎨 WebGL Hero - Guide d'Intégration

## Composant créé
**Fichier:** `/root/.openclaw/workspace/ArtFolio-main/src/components/WebGLHero.jsx`

## Installation des dépendances

```bash
cd /root/.openclaw/workspace/ArtFolio-main
npm install three @react-three/fiber@8.17.14 @react-three/drei@9.122.0 --legacy-peer-deps
```

## Props du composant

```typescript
interface WebGLHeroProps {
  artistPalette?: 'marie' | 'jean' | 'sophie' | 'lucas';  // Palette de couleurs
  artistName?: string;                                    // Nom de l'artiste
  artworkTitle?: string;                                  // Titre de l'œuvre
  className?: string;                                     // Classes CSS additionnelles
}
```

## Intégration dans HomePage.jsx

### 1. Remplacer le Hero existant

Dans `HomePage.jsx`, remplacez:
```jsx
import { BlueCinisHero } from '../components/BlueCinisHero';
```

Par:
```jsx
import { WebGLHero } from '../components/WebGLHero';
```

### 2. Utilisation basique

Remplacez:
```jsx
<BlueCinisHero artworks={heroArtworks} />
```

Par:
```jsx
<WebGLHero 
  artistPalette="marie"
  artistName="Marie Dubois"
  artworkTitle="Éther Flottant"
/>
```

### 3. Version dynamique avec carousel

Pour synchroniser avec le carousel existant:

```jsx
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const artistPalettes = ['marie', 'jean', 'sophie', 'lucas'];
  
  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Hero Section - WebGL */}
      <WebGLHero 
        artistPalette={artistPalettes[currentSlide]}
        artistName={heroArtworks[currentSlide].artist}
        artworkTitle={heroArtworks[currentSlide].title}
      />
      
      {/* Carousel Controls - positionné en absolute */}
      <div className="absolute top-1/2 right-8 z-20 flex flex-col gap-2">
        {heroArtworks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index 
                ? 'bg-cyan-400 w-6' 
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>
      
      {/* ... reste de la page ... */}
    </div>
  );
}
```

## Fonctionnalités

### 🎭 Particules WebGL
- **200 particules** flottantes en 3D
- Réaction au mouvement de la souris (répulsion)
- Changement de couleur selon la palette de l'artiste
- 60fps garanti avec RAF optimisé

### 🌊 Texte "ArtFolio"
- Effet de déformation liquide au scroll
- Shader personnalisé avec dégradé cyan/magenta/purple
- Glow dynamique

### 📱 Fallback CSS Mobile
- Détection automatique mobile/WebGL
- Animation CSS avec orbes flottants
- Même style visuel sans WebGL

### 🎨 Palettes de couleurs

| Artiste | Primary | Secondary | Accent |
|---------|---------|-----------|--------|
| Marie   | Cyan `#00ffff` | Magenta `#ff00ff` | Purple `#9d4edd` |
| Jean    | Orange `#ff6b35` | Peach `#f7c59f` | Teal `#2ec4b6` |
| Sophie  | Red `#e63946` | Cream `#f1faee` | Steel Blue `#457b9d` |
| Lucas   | Deep Purple `#7209b7` | Indigo `#3a0ca3` | Light Blue `#4cc9f0` |

## Performance

- ✅ 60fps minimum
- ✅ Disposal propre des ressources WebGL
- ✅ DPR adaptatif ([1, 2])
- ✅ RAF cancel sur unmount
- ✅ Geometries et materials réutilisés (useMemo)

## Personnalisation

### Ajouter une nouvelle palette

Dans `WebGLHero.jsx`, ajoutez dans `ARTIST_PALETTES`:

```jsx
const ARTIST_PALETTES = {
  // ... existants
  nouveau: {
    primary: new THREE.Color('#votre-couleur'),
    secondary: new THREE.Color('#votre-couleur'),
    accent: new THREE.Color('#votre-couleur'),
  },
};
```

### Modifier le nombre de particules

```jsx
const PARTICLE_COUNT = 300; // Augmenter pour plus de densité
```

### Ajuster la sensibilité souris

Dans `handleMouseMove`:
```jsx
const interactionStrength = mouseInfluence * 0.8; // Augmenter pour plus de réaction
```

## Compatibilité

| Navigateur | WebGL | Fallback |
|------------|-------|----------|
| Chrome 80+ | ✅ | - |
| Firefox 75+ | ✅ | - |
| Safari 14+ | ✅ | - |
| iOS Safari | ❌ | ✅ CSS |
| Chrome Android | ⚠️ | ✅ CSS |

## Troubleshooting

### Problème: "Cannot read property 'uniforms' of undefined"
**Solution:** Assurez-vous que drei est bien installé: `npm install @react-three/drei`

### Problème: Performance basse sur mobile
**Solution:** Le composant bascule automatiquement sur le fallback CSS sur mobile.

### Problème: Couleurs ne changent pas
**Solution:** Vérifiez que `artistPalette` correspond à une clé dans `ARTIST_PALETTES`.
