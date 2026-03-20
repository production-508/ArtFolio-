/**
 * Demo/Test file pour ArtworkAnalyzer
 * 
 * Importez ce fichier dans App.jsx pour tester le composant :
 * 
 * import { ArtworkAnalyzerDemo } from './components/ArtworkAnalyzer/ArtworkAnalyzerDemo';
 * 
 * function App() {
 *   return <ArtworkAnalyzerDemo />;
 * }
 */

import { useState } from 'react';
import { ArtworkAnalyzer } from './index';
import { mockAnalysisData, mockAbstractData, mockRealismData } from './mockData';

/**
 * Composant de démonstration avec contrôles de test
 */
export function ArtworkAnalyzerDemo() {
  const [selectedMock, setSelectedMock] = useState('impressionist');
  const [key, setKey] = useState(0);

  const mockOptions = [
    { id: 'impressionist', label: 'Impressionnisme', data: mockAnalysisData },
    { id: 'abstract', label: 'Abstrait', data: mockAbstractData },
    { id: 'realism', label: 'Réalisme', data: mockRealismData },
  ];

  const handleRestart = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          ArtworkAnalyzer Demo
        </h1>
        <p className="text-white/60">
          Testez le composant avec différents styles d'œuvres
        </p>
      </div>

      {/* Contrôles */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Style : </span>
          <select
            value={selectedMock}
            onChange={(e) => {
              setSelectedMock(e.target.value);
              handleRestart();
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            {mockOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
        >
          Relancer
        </button>
      </div>

      {/* Mock API Provider */}
      <div className="max-w-6xl mx-auto">
        <MockArtworkAnalyzer 
          key={key}
          artworkId={selectedMock}
          mockData={mockOptions.find(o => o.id === selectedMock)?.data}
        />
      </div>

      {/* Preview des données */}
      <div className="max-w-6xl mx-auto mt-8 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <h3 className="text-lg font-semibold text-white mb-4">Données utilisées</h3>
        <pre className="text-xs text-white/60 overflow-auto">
          {JSON.stringify(mockOptions.find(o => o.id === selectedMock)?.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * Wrapper qui mock les appels API
 */
function MockArtworkAnalyzer({ artworkId, mockData }) {
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState('empty');

  // Simuler l'API
  const mockAPI = {
    analyze: () => {
      setStatus('loading');
      setTimeout(() => {
        setAnalysis(mockData);
        setStatus('success');
      }, 2500);
    },
    getAnalysis: () => {
      // Simuler qu'il n'y a pas d'analyse existante
      return Promise.resolve({ success: false });
    },
  };

  return (
    <div className="border border-white/10 rounded-[2rem] overflow-hidden">
      <ArtworkAnalyzer 
        artworkId={artworkId}
        apiBaseUrl="" // Mocké
        onAnalysisComplete={() => console.log('Analyse complète !')}
      />
    </div>
  );
}

export default ArtworkAnalyzerDemo;
