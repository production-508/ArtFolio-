import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const defaultMeta = {
  title: 'ArtFolio — Galerie d\'art premium | Portfolios IA & Commerce',
  description: 'Découvrez et collectionnez des œuvres d\'art uniques. Analyse IA, galeries immersives, paiement sécurisé.',
  image: 'https://artfolio-production-ca66.up.railway.app/og-image.jpg',
};

const routeMeta = {
  '/': {
    title: 'ArtFolio — Galerie d\'art premium',
    description: 'Découvrez et collectionnez des œuvres d\'art uniques. Analyse IA, galeries immersives, paiement sécurisé.',
  },
  '/galerie': {
    title: 'Galerie — ArtFolio',
    description: 'Explorez notre collection d\'œuvres contemporaines. Peintures, sculptures, photographies et art numérique.',
  },
  '/recherche': {
    title: 'Recherche — ArtFolio',
    description: 'Recherchez des œuvres par style, prix, artiste ou couleur. Notre IA vous aide à trouver votre coup de cœur.',
  },
  '/favoris': {
    title: 'Mes Favoris — ArtFolio',
    description: 'Votre sélection personnelle d\'œuvres d\'art. Sauvegardez et partagez vos coups de cœur.',
  },
  '/analyze': {
    title: 'Analyse IA — ArtFolio',
    description: 'Analysez vos œuvres avec notre IA. Palette de couleurs, estimation de prix, description SEO automatique.',
  },
  '/checkout': {
    title: 'Paiement — ArtFolio',
    description: 'Finalisez votre achat en toute sécurité. Paiement sécurisé par Stripe.',
  },
};

export function useSEO() {
  const location = useLocation();
  
  useEffect(() => {
    const meta = routeMeta[location.pathname] || defaultMeta;
    
    // Update title
    document.title = meta.title;
    
    // Update meta description
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute('content', meta.description);
    }
    
    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    
    if (ogTitle) ogTitle.setAttribute('content', meta.title);
    if (ogDescription) ogDescription.setAttribute('content', meta.description);
    
    // Update Twitter
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    
    if (twitterTitle) twitterTitle.setAttribute('content', meta.title);
    if (twitterDescription) twitterDescription.setAttribute('content', meta.description);
    
  }, [location]);
}

export default function SEO({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = title;
    
    if (description) {
      const tag = document.querySelector('meta[name="description"]');
      if (tag) tag.setAttribute('content', description);
    }
  }, [title, description, image]);
  
  return null;
}
