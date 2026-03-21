# 🖼️ Système de Visualisation Murale (Room View)

## Composants créés

### 1. `src/components/RoomPreview.jsx`
Composant principal de visualisation interactive.

**Features:**
- **Canvas Konva** : Rendu performant avec drag & drop
- **Positionnement** : Glisser-déposer l'œuvre sur le mur
- **Redimensionnement** : Poignées de transformation avec maintien des proportions
- **Cadres** : 5 styles (sans, bois, blanc, noir, doré)
- **Environnements** : 5 murs prédéfinis + upload personnalisé
- **Dimensions** : Input taille réelle (cm) avec échelle automatique
- **Comparateur** : Canapé ou personne pour référence d'échelle
- **Luminosité** : Ajustement 50-150%
- **Export** : PNG haute résolution via html2canvas

**Props:**
```jsx
<RoomPreview
  artworkUrl={string}        // URL de l'image de l'œuvre
  artworkTitle={string}      // Titre pour le nom de fichier
  defaultWidth={number}      // Largeur réelle en cm (défaut: 60)
  defaultHeight={number}     // Hauteur réelle en cm (défaut: 80)
  onExport={(dataUrl) => {}} // Callback après export
  onBuy={() => {}}           // Callback bouton achat
/>
```

### 2. `src/pages/RoomViewPage.jsx`
Page complète avec route `/visualiser/:artworkId`.

**Features:**
- Récupération des données d'œuvre (mock API)
- Sélecteur d'œuvres si pas d'ID
- Panel d'information avec prix et détails
- Conseils d'accrochage
- Modal de partage social (Twitter, Facebook, Pinterest)
- Intégration Stripe-ready pour l'achat

### 3. `src/styles/room-preview.css`
Styles spécifiques pour les inputs et le canvas.

---

## Routes ajoutées

```jsx
<Route path="/visualiser/:artworkId" element={<RoomViewPage />} />
<Route path="/visualiser" element={<RoomViewPage />} />
```

---

## Dépendances installées

```bash
npm install react-konva@18.2.10 konva html2canvas --legacy-peer-deps
```

- **react-konva** : Canvas React interactif
- **konva** : Moteur de rendu 2D
- **html2canvas** : Export PNG

---

## Utilisation

### Lien vers la visualisation
```jsx
// Depuis une galerie ou page œuvre
<Link to={`/visualiser/${artwork.id}`}>
  Voir sur un mur
</Link>
```

### Composant autonome
```jsx
import RoomPreview from './components/RoomPreview';

function MyPage() {
  return (
    <RoomPreview
      artworkUrl="https://..."
      artworkTitle="Mon Œuvre"
      defaultWidth={100}
      defaultHeight={80}
      onBuy={() => console.log('Achat!')}
    />
  );
}
```

---

## Configuration des murs

Modifier `DEFAULT_WALLS` dans `RoomPreview.jsx` :

```jsx
const DEFAULT_WALLS = [
  {
    id: 'mon-mur',
    name: 'Mon Mur',
    url: '/images/walls/mon-mur.jpg',
    thumbnail: '/images/walls/mon-mur-thumb.jpg'
  },
  // ...
];
```

---

## Personnalisation des cadres

Modifier `FRAME_TYPES` dans `RoomPreview.jsx` :

```jsx
const FRAME_TYPES = [
  { id: 'none', name: 'Sans cadre', color: null, width: 0 },
  { id: 'custom', name: 'Personnalisé', color: '#FF0000', width: 12 },
  // ...
];
```

---

## Intégration API

Remplacer `MOCK_ARTWORKS` dans `RoomViewPage.jsx` par l'appel API réel :

```jsx
useEffect(() => {
  const loadArtwork = async () => {
    const response = await fetch(`/api/artworks/${artworkId}`);
    const data = await response.json();
    setArtwork(data);
  };
  loadArtwork();
}, [artworkId]);
```

---

## Prochaines améliorations possibles

1. **3D Preview** : Intégrer Three.js pour une vue 3D réaliste
2. **AR Mode** : Utiliser l'API WebXR pour voir l'œuvre chez soi
3. **Multi-œuvres** : Positionner plusieurs œuvres sur le même mur
4. **Galerie murale** : Templates préconfigurés (triptyque, grid...)
5. **Sauvegarde** : Enregistrer les compositions utilisateur
6. **Partage direct** : Upload de l'image exportée sur les réseaux

---

## Design System

- Interface minimaliste, focus sur l'œuvre
- Contrôles discrets (transparence 50-70%)
- Animations fluides avec framer-motion
- Responsive (mobile: empilé, desktop: side-by-side)
- Thème sombre cohérent avec ArtFolio
