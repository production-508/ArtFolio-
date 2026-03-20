# Animations ArtFolio

Ce document liste toutes les animations implémentées dans l'application.

## 🎭 Animations Globales

### Page Transitions
- **Fichier**: `App.jsx`
- **Description**: Transition fluide entre les pages avec fade + slide
- **Animation**: `opacity: 0→1, y: 20→0` sur 400ms
- **Lib**: Framer Motion `AnimatePresence`

### Custom Cursor
- **Fichier**: `components/CustomCursor.jsx`
- **Description**: Curseur personnalisé qui s'agrandit au hover des éléments interactifs
- **Animations**:
  - Suivi fluide avec spring physics
  - Scale: 12px → 60px au hover
  - Glow cyan qui suit le curseur
  - Mix-blend-mode: difference pour contraste

### Gradient Orbs
- **Fichier**: `components/GradientOrbs.jsx`
- **Description**: Orbes flottantes en arrière-plan (style spatial UI)
- **Animations**:
  - Mouvement flottant aléatoire (x, y, scale)
  - Durée: 15-20s par cycle
  - Blur 100px pour effet de profondeur

### Particules
- **Fichier**: `components/GradientOrbs.jsx` (ParticleField)
- **Description**: Particules subtiles qui montent
- **Animations**:
  - Déplacement vertical continu
  - Fade in/out
  - Random positioning

---

## 🔘 Composants Interactifs

### Magnetic Button
- **Fichier**: `components/MagneticButton.jsx`
- **Description**: Bouton qui attire le curseur (effet aimant)
- **Animations**:
  - Déplacement x,y basé sur la position relative de la souris
  - Spring physics pour le retour
  - Effet ripple au clic
  - Scale 0.95 au tap

### Text Scramble
- **Fichier**: `components/TextScramble.jsx`
- **Description**: Effet de "décryptage" des titres
- **Animations**:
  - Lettres qui changent aléatoirement
  - Progression lettre par lettre
  - Durée: 2000ms par défaut
  - Caractères spéciaux: `!<>-_\/[]{}—=+*^?#`

### Toast Notifications
- **Fichier**: `components/Toast.jsx`
- **Description**: Système de notification avec animations
- **Animations**:
  - Slide-in depuis la droite
  - Scale 0.9 → 1
  - Auto-dismiss avec fade-out
  - Layout animation pour empilement

---

## 📜 Scroll Animations

### Scroll Reveal
- **Hook**: `hooks/useScrollAnimation.js` (useScrollAnimation)
- **Description**: Éléments qui apparaissent au scroll
- **Animations**:
  - Intersection Observer API
  - Fade + slide up
  - Trigger once ou repeat
  - Configurable threshold

### Parallax
- **Hook**: `hooks/useScrollAnimation.js` (useParallax)
- **Description**: Éléments qui bougent à différentes vitesses
- **Animations**:
  - Offset calculé basé sur le scroll
  - Vitesse configurable (0.1 à 1)

### Progress Bar
- **Hook**: `hooks/useScrollAnimation.js` (useScrollProgress)
- **Description**: Track la progression du scroll
- **Retourne**: Progress 0-1, direction (up/down), scrollY

---

## 🎨 Pages & Sections

### HomePage
- **Hero**: Fade-in stagger des éléments
- **Badge**: Scale + pulse animation
- **Titre**: Text scramble effect
- **Scroll indicator**: Bounce animation

### UploadPage
- **Drop zone**: 
  - Wave effect au hover
  - Cercles concentriques animés
  - Scale 1.02 au drag
- **Image preview**: 
  - Zoom scale 1.1 au hover
  - Gradient overlay
- **Bouton analyse**: 
  - Pulse quand prêt
  - Spinner rotation pendant analyse

### GalleryPage
- **Grid**: 
  - Masonry layout avec AnimatePresence
  - Filter animation (layout)
- **Cards**: 
  - 3D tilt effect au hover (rotateX/Y)
  - Image zoom
  - Badge + actions fade-in
- **Modal**: 
  - Scale-in depuis le centre
  - Backdrop blur
  - Close avec fade-out

### ArtistDashboard
- **Stats cards**: 
  - Stagger reveal
  - Hover lift + glow
- **Graph**: 
  - Bars height animation
  - Sequential delay
- **Table rows**: 
  - Fade-in stagger

---

## 🖼️ ArtworkAnalyzer

### Loading State
- Double cercle rotation inversée
- Pulsation au centre
- Barre de progression shimmer

### Success State
- **Palette**: 
  - Swatches scale-in stagger
  - Glow effect au hover
  - Copy feedback
- **Tags**: 
  - Fade-in un par un
  - Stagger delay 0.08s
- **Confidence bar**: 
  - Width animation 0 → value%
  - Spring easing
  - Glow sur la barre
- **Style card**: 
  - Flip-in 3D
  - Icon rotation
  - Gradient orb pulsant

---

## ⚡ Utilitaires

### animations.js
Fonctions utilitaires pour GSAP et Framer Motion:

- `fadeInUp`: Variants Framer Motion
- `scaleIn`: Variants Framer Motion
- `staggerContainer`: Container avec stagger
- `TextScramble`: Classe pour effet decrypt
- `animateCounter`: Animation de nombre
- `magneticEffect`: Effet aimant GSAP
- `createRipple`: Effet ripple au clic

---

## 🎯 Performance

### Optimisations
- `will-change: transform, opacity` sur les éléments animés
- `transform` et `opacity` uniquement (pas de layout)
- `requestAnimationFrame` pour les animations JS
- Intersection Observer pour lazy animations
- `passive: true` sur les event listeners de scroll

### Réduction sur mobile
- Parallax désactivé sur mobile
- Particles réduits
- Magnetic effect désactivé (touch)

---

## 📱 Responsive

- **Desktop**: Toutes les animations actives
- **Tablet**: Parallax réduit
- **Mobile**: 
  - Pas de custom cursor
  - Pas d'effet magnetic
  - Animations simplifiées
  - Pas de 3D tilt

---

## 🛠️ Comment ajouter une animation

```jsx
// 1. Utiliser les variants
import { fadeInUp } from '../utils/animations';

<motion.div
  variants={fadeInUp}
  initial="initial"
  animate="animate"
/>

// 2. Scroll reveal
const [ref, isVisible] = useScrollAnimation();

<motion.div
  ref={ref}
  animate={isVisible ? { opacity: 1, y: 0 } : {}}
/>

// 3. Text scramble
<TextScramble text="Mon titre" delay={200} />

// 4. Magnetic button
<MagneticButton>Cliquez-moi</MagneticButton>
```
