import JarvisNav from '../components/JarvisNav';
import JarvisArtworkViewer from '../components/JarvisArtworkViewer';
import { useParams } from 'react-router-dom';

/**
 * Page Visualiseur JARVIS HUD
 */
export default function JarvisArtworkViewerPage() {
  const { artworkId } = useParams();

  // Mock artwork data - à remplacer par fetch API
  const artworkData = {
    title: 'Éther Flottant',
    artist: 'Marie Dubois',
    year: '2024',
    medium: 'Huile sur toile',
    dimensions: '120 x 80 cm',
    style: 'Abstrait Contemporain',
    description: 'Une exploration des mouvements subtils de la lumière à travers des couches de peinture translucides. L\'artiste capture l\'éphémère dans une danse de couleurs qui évoquent les nuages au crépuscule.',
    estimatedValue: '€12,500',
    provenance: [
      'Atelier de l\'artiste (2024)',
      'Galerie Lumière, Paris (2024)',
      'Collection privée (2025)'
    ],
    exhibitionHistory: [
      'Salon d\'Automne 2024',
      'Biennale d\'Art Contemporain, Lyon'
    ],
    colorPalette: [
      { hex: '#0EA5E9', name: 'Cyan Profond', percentage: 35, rgb: '14, 165, 233' },
      { hex: '#F97316', name: 'Orange Crépusculaire', percentage: 25, rgb: '249, 115, 22' },
      { hex: '#1E293B', name: 'Slate Nuit', percentage: 20, rgb: '30, 41, 59' },
      { hex: '#EAB308', name: 'Or Brûlé', percentage: 15, rgb: '234, 179, 8' },
      { hex: '#EC4899', name: 'Rose Néon', percentage: 5, rgb: '236, 72, 153' }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <JarvisNav />
      <JarvisArtworkViewer 
        artworkUrl={`https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80`}
        artworkData={artworkData}
        onClose={() => window.history.back()}
      />
    </div>
  );
}
