import { useState, useEffect } from 'react';
import InstitutionalHero from '../components/InstitutionalHero';
import InstitutionalGallery from '../components/InstitutionalGallery';

/**
 * Page d'accueil — Style Galerie Institutionnelle
 * Hauser & Wirth / White Cube style
 */
export default function HomePage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      // Utiliser une URL relative en production, ou localhost en dev
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/artworks?limit=24`);
      
      if (!res.ok) throw new Error('Erreur de chargement');
      
      const data = await res.json();
      
      // Transformer les données pour InstitutionalGallery
      const formatted = data.artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist_name || 'Artiste',
        year: artwork.year || new Date().getFullYear(),
        medium: artwork.medium || 'Technique mixte',
        dimensions: artwork.dimensions || '',
        image: artwork.image_url || 'https://placehold.co/800x600/1a1a1a/666?text=Artwork',
        aspectRatio: getAspectRatio(artwork)
      }));
      
      setArtworks(formatted);
    } catch (err) {
      console.error('Erreur chargement œuvres:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAspectRatio = (artwork) => {
    // Détecte le ratio d'aspect basé sur les dimensions si disponibles
    if (artwork.dimensions) {
      const match = artwork.dimensions.match(/(\d+)\s*×\s*(\d+)/);
      if (match) {
        const width = parseInt(match[1]);
        const height = parseInt(match[2]);
        const ratio = width / height;
        if (ratio > 1.2) return 'landscape';
        if (ratio < 0.8) return 'portrait';
      }
    }
    // Alternance pour la masonry
    return artwork.id % 3 === 0 ? 'portrait' : artwork.id % 2 === 0 ? 'square' : 'landscape';
  };

  // Hero avec les 4 premières œuvres
  const heroArtworks = artworks.slice(0, 4).map(art => ({
    id: art.id,
    title: art.title,
    artist: art.artist,
    year: String(art.year),
    image: art.image
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p>Erreur de chargement : {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Institutionnel */}
      <InstitutionalHero artworks={heroArtworks.length > 0 ? heroArtworks : []} />

      {/* Galerie avec vraies données */}
      <InstitutionalGallery artworks={artworks} />

      {/* Footer minimal */}
      <footer className="py-16 px-8 md:px-16 bg-black border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <p 
              className="font-serif text-2xl font-semibold text-white mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              ArtFolio
            </p>
            <p className="text-white/50 text-sm">
              Galerie contemporaine en ligne
            </p>
          </div>
          
          <div className="flex gap-8 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        
        <p className="mt-12 text-xs text-white/30">
          © 2025 ArtFolio. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
