import InstitutionalHero from '../components/InstitutionalHero';
import InstitutionalGallery from '../components/InstitutionalGallery';

/**
 * Page d'accueil — Style Galerie Institutionnelle
 * Hauser & Wirth / White Cube style
 */
export default function HomePage() {
  const heroArtworks = [
    {
      id: 1,
      title: "Éther Flottant",
      artist: "Marie Dubois",
      year: "2025",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1920&q=90"
    },
    {
      id: 2,
      title: "Fragments de Mémoire",
      artist: "Jean Pierre",
      year: "2024",
      image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1920&q=90"
    },
    {
      id: 3,
      title: "Nature Morte No.7",
      artist: "Sophie Martin",
      year: "2026",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&q=90"
    },
    {
      id: 4,
      title: "Chroma Field",
      artist: "Lucas Bernard",
      year: "2025",
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=1920&q=90"
    }
  ];

  const galleryArtworks = [
    { id: 1, title: "Éther Flottant", artist: "Marie Dubois", year: "2025", image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800", height: "tall" },
    { id: 2, title: "Fragments", artist: "Jean Pierre", year: "2024", image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800", height: "normal" },
    { id: 3, title: "Nature Morte", artist: "Sophie Martin", year: "2026", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800", height: "normal" },
    { id: 4, title: "Chroma Field", artist: "Lucas Bernard", year: "2025", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800", height: "tall" },
    { id: 5, title: "Silhouettes", artist: "Emma Petit", year: "2024", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800", height: "normal" },
    { id: 6, title: "Flux", artist: "Thomas Moreau", year: "2026", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", height: "tall" },
    { id: 7, title: "Lumière", artist: "Claire Dubois", year: "2025", image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800", height: "normal" },
    { id: 8, title: "Ombre", artist: "Marc Lefebvre", year: "2024", image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800", height: "normal" },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Institutionnel */}
      <InstitutionalHero artworks={heroArtworks} />

      {/* Galerie */}
      <InstitutionalGallery artworks={galleryArtworks} />

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
