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
      setLoading(true);
      
      // En production sur Railway, utiliser l'URL relative
      // En dev, utiliser localhost
      const isLocalhost = window.location.hostname === 'localhost';
      const baseUrl = isLocalhost ? 'http://localhost:3001' : '';
      
      console.log('Fetching artworks from:', `${baseUrl}/api/artworks?limit=24`);
      
      const res = await fetch(`${baseUrl}/api/artworks?limit=24`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Artworks loaded:', data.artworks?.length || 0);
      
      if (!data.artworks || data.artworks.length === 0) {
        setArtworks([]);
        return;
      }
      
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
    return artwork.id % 3 === 0 ? 'portrait' : artwork.id % 2 === 0 ? 'square' : 'landscape';
  };

  // Fallback artworks si l'API échoue
  const fallbackArtworks = [
    { id: 1, title: "Éther Flottant", artist: "Marie Dubois", year: 2025, medium: "Huile sur toile", image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800", aspectRatio: "portrait" },
    { id: 2, title: "Fragments", artist: "Jean Pierre", year: 2024, medium: "Acrylique", image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800", aspectRatio: "square" },
    { id: 3, title: "Nature Morte", artist: "Sophie Martin", year: 2026, medium: "Huile", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800", aspectRatio: "landscape" },
    { id: 4, title: "Chroma Field", artist: "Lucas Bernard", year: 2025, medium: "Mixte", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800", aspectRatio: "landscape" },
    { id: 5, title: "Silhouettes", artist: "Emma Petit", year: 2024, medium: "Photo", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800", aspectRatio: "portrait" },
    { id: 6, title: "Flux", artist: "Thomas Moreau", year: 2026, medium: "Encre", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", aspectRatio: "portrait" },
  ];

  // Hero avec les 4 premières œuvres (réelles ou fallback)
  const displayArtworks = artworks.length > 0 ? artworks : fallbackArtworks;
  const heroArtworks = displayArtworks.slice(0, 4).map(art => ({
    id: art.id,
    title: art.title,
    artist: art.artist,
    year: String(art.year),
    image: art.image
  }));

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Institutionnel */}
      <InstitutionalHero artworks={heroArtworks} />

      {/* Galerie */}
      {loading ? (
        <div className="py-20 px-8 text-center text-white/50">
          <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          Chargement des œuvres...
        </div>
      ) : error ? (
        <div className="py-20 px-8 text-center">
          <p className="text-red-400 mb-4">Erreur: {error}</p>
          <button 
            onClick={fetchArtworks}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <InstitutionalGallery artworks={displayArtworks} />
      )}

      {/* Footer */}
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
