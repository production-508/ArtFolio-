import { motion } from 'framer-motion';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import FavoriteButton from '../components/FavoriteButton';
import InstitutionalNav from '../components/InstitutionalNav';

/**
 * Page des favoris / wishlist
 */
export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, favoritesCount } = useFavorites();

  return (
    <div className="min-h-screen bg-black">
      <InstitutionalNav />
      
      <header className="pt-32 pb-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 
                     transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span className="text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>Retour</span>
          </button>

          <div className="flex items-center gap-4">
            <Heart size={28} className="text-white/60" />
            <div>
              <h1 
                className="text-white text-3xl"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Vos favoris
              </h1>
              <p 
                className="text-white/40 text-sm mt-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {favoritesCount} œuvre{favoritesCount !== 1 && 's'} sauvegardée{favoritesCount !== 1 && 's'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={64} className="text-white/10 mx-auto mb-6" />
              <h2 
                className="text-white/60 text-xl mb-4"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Aucun favori pour le moment
              </h2>
              <p 
                className="text-white/30 text-sm mb-8 max-w-md mx-auto"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Parcourez la galerie et cliquez sur le cœur pour sauvegarder vos œuvres préférées.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white text-black text-sm
                         hover:bg-white/90 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Découvrir la galerie
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {favorites.map((artwork, index) => (
                <FavoriteCard 
                  key={artwork.id} 
                  artwork={artwork} 
                  index={index}
                  onClick={() => navigate(`/artwork/${artwork.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FavoriteCard({ artwork, index, onClick }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
        <img
          src={artwork.image || `/api/placeholder/400/533`}
          alt={artwork.title}
          className="w-full h-full object-cover transition-all duration-500
                   group-hover:brightness-110 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      flex flex-col justify-end p-4">
          <div className="flex items-center justify-between">
            <span 
              className="text-white text-lg"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {artwork.price?.toLocaleString('fr-FR')} €
            </span>
            
            <FavoriteButton 
              artwork={artwork} 
              size={20}
              className="bg-black/50"
            />
          </div>
        </div>

        {/* Favorite button always visible */}
        <div className="absolute top-4 right-4 opacity-100 group-hover:opacity-0 
                      transition-opacity duration-300">
          <FavoriteButton 
            artwork={artwork} 
            size={20}
            className="bg-black/50"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-4">
        <h3 
          className="text-white text-lg leading-tight mb-1
                   group-hover:text-white/80 transition-colors"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {artwork.title}
        </h3>
        <p 
          className="text-white/50 text-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {artwork.artist}
        </p>
      </div>
    </motion.article>
  );
}
