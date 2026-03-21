# 🎭 ArtistProfilePage - Brief d'Intégration

## Fichier Créé
```
/src/pages/ArtistProfilePage.jsx
```

## Route à Ajouter

Dans `App.jsx`, ajouter la route:

```jsx
import ArtistProfilePage from './pages/ArtistProfilePage';

// Dans le composant Routes:
<Route path="/artist/:id" element={<PageTransition><ArtistProfilePage /></PageTransition>} />
```

## Props Attendues (API)

### Données Artiste
```typescript
interface Artist {
  id: string;
  name: string;
  verified: boolean;
  avatar?: string | null;
  location?: string;
  website?: string;
  bio: string;
  story: string;           // Histoire personnelle en italique
  medium: string;
  artworksCount: number;
  followers: number;
  following: number;
  styleSignature: string;  // 'geometric-organic' | 'classical' | 'brutalist' | 'minimal' | 'expressive'
  layoutType: string;      // 'grid' | 'masonry' | 'spotlight' | 'timeline'
  tags: string[];
  palette: string[];       // 6 couleurs hex
  social?: {
    instagram?: string;
    twitter?: string;
    behance?: string;
  }
}
```

### Données Œuvres
```typescript
interface Artwork {
  id: string;
  title: string;
  year: number;
  medium: string;
  price?: number;
  dimensions: string;
  image: string;          // URL image
  featured?: boolean;     // Pour spotlight layout
  date: string;           // ISO date pour timeline
}
```

## Layout Types Supportés

| Layout | Description | Use Case |
|--------|-------------|----------|
| `grid` | Grille uniforme 3 colonnes | Catalogue classique |
| `masonry` | Pinterest-style avec hauteurs variées | Portfolio artistique |
| `spotlight` | 1 œuvre phare + thumbnails | Mise en avant |
| `timeline` | Scroll horizontal chronologique | Parcours historique |

## Remplacer les Données Mock

Localiser ce bloc dans le fichier et remplacer par l'appel API:

```jsx
// ═══════════════════════════════════════════════════════════════
// MOCK DATA - Remplacer par appel API réel
// ═══════════════════════════════════════════════════════════════
const MOCK_ARTIST = { ... };
const MOCK_ARTWORKS = [ ... ];
```

Remplacer par:

```jsx
// ═══════════════════════════════════════════════════════════════
// APPEL API RÉEL
// ═══════════════════════════════════════════════════════════════
useEffect(() => {
  const fetchArtist = async () => {
    setLoading(true);
    try {
      const [artistRes, artworksRes] = await Promise.all([
        fetch(`/api/artists/${id}`),
        fetch(`/api/artists/${id}/artworks`)
      ]);
      
      const artistData = await artistRes.json();
      const artworksData = await artworksRes.json();
      
      setArtist(artistData);
      setArtworks(artworksData);
    } catch (error) {
      console.error('Error fetching artist:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (id) fetchArtist();
}, [id]);
```

## Dépendances Requises

Déjà présentes dans le projet:
- `framer-motion` - Animations
- `lucide-react` - Icônes
- `react-router-dom` - Routing

## Features Implémentées

### Header
- ✅ Photo profil avec placeholder gradient
- ✅ Nom + badge vérifié
- ✅ Bio avec typographie adaptée au `styleSignature`
- ✅ Story en italique avec bordure
- ✅ Tags cliquables
- ✅ Palette de couleurs (6 swatches interactives)

### Section Œuvres
- ✅ 4 layouts dynamiques selon `layoutType`
- ✅ Animations Framer Motion
- ✅ Hover effects avec infos
- ✅ Modal détail œuvre

### Actions
- ✅ Bouton "Suivre" avec toggle state
- ✅ Bouton "Contacter"
- ✅ Bouton "Partager"

### Design
- ✅ Glassmorphism Blue Cinis
- ✅ Dégradés orbes subtils
- ✅ Backdrop blur
- ✅ Responsive mobile-first

## Personnalisation

### Ajouter un nouveau styleSignature

Dans le composant, modifier `getTypographyStyle`:

```jsx
const getTypographyStyle = (styleSignature) => {
  const styles = {
    // ... existants
    'mon-nouveau-style': { 
      fontFamily: "'MaPolice', serif", 
      letterSpacing: '0.02em',
      fontWeight: 300
    },
  };
  return styles[styleSignature] || styles['geometric-organic'];
};
```

## Navigation depuis la Galerie

```jsx
// Dans un composant artwork card
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Au click
onClick={() => navigate(`/artist/${artist.id}`)}
```

## Tests Visuels

Le composant inclut:
1. **Données mockées complètes** - 9 œuvres avec images Unsplash
2. **Sélecteur de layout** - Boutons pour tester les 4 layouts
3. **Modal interactive** - Click sur une œuvre pour voir les détails

## Prochaines Étapes Suggérées

1. [ ] Connecter à l'API backend
2. [ ] Ajouter lazy loading des images
3. [ ] Implémenter "Suivre" persistant (API)
4. [ ] Ajouter partage social (Web Share API)
5. [ ] Optimiser images (WebP, srcset)
6. [ ] Ajouter skeleton loading
