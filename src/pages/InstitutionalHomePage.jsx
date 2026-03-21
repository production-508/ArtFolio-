import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InstitutionalHero } from '../components/InstitutionalHero';
import { InstitutionalGallery } from '../components/InstitutionalGallery';
import SmartSearchBar from '../components/SmartSearchBar';

// Données d'œuvres pour le hero
const HERO_ARTWORKS = [
  {
    id: 1,
    title: "Éther Flottant",
    artist: "Marie Dubois",
    year: 2024,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1600&q=90"
  },
  {
    id: 2,
    title: "Fragments de Mémoire",
    artist: "Jean Pierre", 
    year: 2023,
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1600&q=90"
  },
  {
    id: 3,
    title: "Nature Morte No.7",
    artist: "Sophie Martin",
    year: 2024,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&q=90"
  }
];

/**
 * Page d'accueil - Style galerie institutionnelle
 * Hauser & Wirth / David Zwirner style
 */
export default function InstitutionalHomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero immersif fullscreen */}
      <InstitutionalHero artworks={HERO_ARTWORKS} />
      
      {/* Smart Search Section */}
      <section className="py-16 px-6 md:px-12 bg-black border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 
              className="text-white/80 text-xl mb-2"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Découvrez votre prochaine œuvre
            </h2>
            <p 
              className="text-white/40 text-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Recherchez par style, couleur, artiste ou téléchargez une image
            </p>
          </motion.div>
          
          <SmartSearchBar 
            onSearch={(params) => console.log('Search:', params)}
          />
        </div>
      </section>
      
      {/* Gallery section */}
      <InstitutionalGallery />
      
      {/* Footer institutionnel */}
      <footer className="bg-black py-20 px-6 md:px-12 lg:px-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 
                className="text-white text-lg tracking-wide mb-4"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                ArtFolio
              </h3>
              <p 
                className="text-white/40 text-sm leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Galerie contemporaine présentant les œuvres d'artistes émergents et établis.
              </p>
            </div>
            
            <div>
              <h4 
                className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Navigation
              </h4>
              <ul className="space-y-2">
                {['Œuvres', 'Artistes', 'Expositions', 'À propos'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-white/50 hover:text-white text-sm transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 
                className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Contact
              </h4>
              <p 
                className="text-white/50 text-sm"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                contact@artfolio.gallery
                <br />
                Paris, France
              </p>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p 
              className="text-white/30 text-xs tracking-wider"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              © 2025 ArtFolio Gallery. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
