import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group, Transformer } from 'react-konva';
import html2canvas from 'html2canvas';
import { 
  Move, 
  Maximize2, 
  Frame, 
  Sun, 
  Upload, 
  Download, 
  Ruler, 
  User, 
  Sofa,
  Image as ImageIcon,
  X
} from 'lucide-react';

// Images de murs prédéfinies
const DEFAULT_WALLS = [
  {
    id: 'white-living',
    name: 'Salon Blanc',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&q=60'
  },
  {
    id: 'brick-wall',
    name: 'Brique Industrielle',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&q=60'
  },
  {
    id: 'gallery-white',
    name: 'Galerie Blanche',
    url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=200&q=60'
  },
  {
    id: 'concrete-modern',
    name: 'Béton Moderne',
    url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=200&q=60'
  },
  {
    id: 'warm-beige',
    name: 'Beige Chaleureux',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=60'
  }
];

// Types de cadres
const FRAME_TYPES = [
  { id: 'none', name: 'Sans cadre', color: null, width: 0 },
  { id: 'wood', name: 'Bois naturel', color: '#8B6F47', width: 8 },
  { id: 'white', name: 'Blanc', color: '#FFFFFF', width: 8 },
  { id: 'black', name: 'Noir', color: '#1a1a1a', width: 8 },
  { id: 'gold', name: 'Doré', color: '#D4AF37', width: 10 }
];

// Références de taille
const SIZE_REFERENCES = {
  sofa: { name: 'Canapé', width: 200, height: 85, icon: Sofa },
  person: { name: 'Personne', width: 45, height: 170, icon: User }
};

const RoomPreview = ({ 
  artworkUrl, 
  artworkTitle = 'Œuvre',
  defaultWidth = 60,
  defaultHeight = 80,
  onExport,
  onBuy
}) => {
  // États
  const [selectedWall, setSelectedWall] = useState(DEFAULT_WALLS[0]);
  const [customWallUrl, setCustomWallUrl] = useState(null);
  const [artworkSize, setArtworkSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [selectedFrame, setSelectedFrame] = useState(FRAME_TYPES[1]);
  const [lighting, setLighting] = useState(100);
  const [showReference, setShowReference] = useState(null);
  const [scale, setScale] = useState(4); // pixels per cm
  const [isExporting, setIsExporting] = useState(false);
  
  // États Konva
  const [wallImage, setWallImage] = useState(null);
  const [artworkImage, setArtworkImage] = useState(null);
  const [artworkPos, setArtworkPos] = useState({ x: 300, y: 200 });
  const [artworkScale, setArtworkScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const transformerRef = useRef(null);
  const artworkRef = useRef(null);

  const stageWidth = 800;
  const stageHeight = 600;

  // Charger les images
  useEffect(() => {
    const wallImg = new window.Image();
    wallImg.crossOrigin = 'Anonymous';
    wallImg.src = customWallUrl || selectedWall.url;
    wallImg.onload = () => setWallImage(wallImg);
  }, [selectedWall, customWallUrl]);

  useEffect(() => {
    if (artworkUrl) {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = artworkUrl;
      img.onload = () => {
        setArtworkImage(img);
        // Centrer l'œuvre
        setArtworkPos({
          x: (stageWidth - (artworkSize.width * scale)) / 2,
          y: (stageHeight - (artworkSize.height * scale)) / 2
        });
      };
    }
  }, [artworkUrl, artworkSize.width, artworkSize.height, scale]);

  // Gérer le transformer
  useEffect(() => {
    if (transformerRef.current && artworkRef.current) {
      transformerRef.current.nodes([artworkRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [artworkImage]);

  // Calculer la taille affichée basée sur les dimensions réelles
  const displayedWidth = artworkSize.width * scale;
  const displayedHeight = artworkSize.height * scale;

  // Gestion du drag
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = (e) => {
    setIsDragging(false);
    setArtworkPos({ x: e.target.x(), y: e.target.y() });
  };

  // Gestion du resize
  const handleTransform = useCallback(() => {
    if (artworkRef.current) {
      const node = artworkRef.current;
      const newScaleX = node.scaleX();
      const newScaleY = node.scaleY();
      
      // Garder les proportions
      const uniformScale = Math.max(newScaleX, newScaleY);
      node.scaleX(uniformScale);
      node.scaleY(uniformScale);
      
      setArtworkScale(uniformScale);
    }
  }, []);

  // Upload d'image personnalisée
  const handleWallUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomWallUrl(url);
    }
  };

  // Export de l'image
  const handleExport = async () => {
    if (!containerRef.current) return;
    
    setIsExporting(true);
    try {
      // Masquer temporairement les contrôles
      setShowControls(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      
      // Télécharger
      const link = document.createElement('a');
      link.download = `artfolio-${artworkTitle.replace(/\s+/g, '-').toLowerCase()}-room-view.png`;
      link.href = dataUrl;
      link.click();
      
      if (onExport) onExport(dataUrl);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setShowControls(true);
    }
  };

  // Calculer la taille réelle approximative
  const getRealDimensions = () => {
    const realWidth = Math.round((displayedWidth * artworkScale) / scale);
    const realHeight = Math.round((displayedHeight * artworkScale) / scale);
    return { width: realWidth, height: realHeight };
  };

  const realDims = getRealDimensions();

  return (
    <div className="room-preview-container">
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative rounded-xl overflow-hidden shadow-2xl"
        style={{ 
          width: stageWidth, 
          height: stageHeight,
          background: '#1a1a1a'
        }}
      >
        <Stage 
          ref={stageRef}
          width={stageWidth} 
          height={stageHeight}
          style={{ filter: `brightness(${lighting}%)` }}
        >
          <Layer>
            {/* Mur */}
            {wallImage && (
              <KonvaImage
                image={wallImage}
                width={stageWidth}
                height={stageHeight}
                x={0}
                y={0}
              />
            )}

            {/* Référence de taille */}
            {showReference && (
              <Group x={50} y={stageHeight - 150}>
                <Rect
                  width={SIZE_REFERENCES[showReference].width * scale * 0.5}
                  height={SIZE_REFERENCES[showReference].height * scale * 0.5}
                  fill="rgba(100,100,100,0.3)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth={1}
                  dash={[5, 5]}
                />
                <KonvaImage />
              </Group>
            )}

            {/* Œuvre avec cadre */}
            {artworkImage && (
              <Group
                ref={artworkRef}
                x={artworkPos.x}
                y={artworkPos.y}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onTransform={handleTransform}
              >
                {/* Cadre */}
                {selectedFrame.width > 0 && (
                  <Rect
                    width={displayedWidth + selectedFrame.width * 2}
                    height={displayedHeight + selectedFrame.width * 2}
                    x={-selectedFrame.width}
                    y={-selectedFrame.width}
                    fill={selectedFrame.color}
                    shadowColor="black"
                    shadowBlur={10}
                    shadowOpacity={0.3}
                    shadowOffsetY={5}
                  />
                )}
                
                {/* Œuvre */}
                <KonvaImage
                  image={artworkImage}
                  width={displayedWidth}
                  height={displayedHeight}
                  shadowColor="black"
                  shadowBlur={selectedFrame.width > 0 ? 0 : 15}
                  shadowOpacity={0.2}
                  shadowOffsetY={selectedFrame.width > 0 ? 0 : 8}
                />
              </Group>
            )}

            {/* Transformer pour resize */}
            {artworkImage && showControls && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limiter la taille minimum
                  if (newBox.width < 50 || newBox.height < 50) {
                    return oldBox;
                  }
                  return newBox;
                }}
                anchorStyleFunc={(anchor) => {
                  anchor.fill('#ffffff');
                  anchor.stroke('#000000');
                  anchor.strokeWidth(1);
                }}
              />
            )}
          </Layer>
        </Stage>

        {/* Overlay de chargement */}
        {isExporting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Bouton fermer (pour modal) */}
        <button 
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          onClick={() => window.history.back()}
        >
          <X size={20} />
        </button>
      </div>

      {/* Contrôles */}
      {showControls && (
        <div className="mt-6 space-y-4">
          {/* Sélection de mur */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <ImageIcon size={14} />
              Environnement
            </label>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_WALLS.map(wall => (
                <button
                  key={wall.id}
                  onClick={() => {
                    setSelectedWall(wall);
                    setCustomWallUrl(null);
                  }}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedWall.id === wall.id && !customWallUrl
                      ? 'border-white ring-2 ring-white/30' 
                      : 'border-transparent hover:border-white/30'
                  }`}
                >
                  <img src={wall.thumbnail} alt={wall.name} className="w-full h-full object-cover" />
                </button>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-white/30 hover:border-white/60 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Upload size={16} />
                <span className="text-[10px]">Perso</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleWallUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dimensions */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <Ruler size={14} />
                Dimensions réelles (cm)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={artworkSize.width}
                  onChange={(e) => setArtworkSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                  className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                  placeholder="L"
                />
                <span className="text-gray-500 self-center">×</span>
                <input
                  type="number"
                  value={artworkSize.height}
                  onChange={(e) => setArtworkSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                  placeholder="H"
                />
              </div>
              <p className="text-xs text-gray-500">
                Affiché: {realDims.width} × {realDims.height} cm
              </p>
            </div>

            {/* Cadre */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <Frame size={14} />
                Cadre
              </label>
              <select
                value={selectedFrame.id}
                onChange={(e) => setSelectedFrame(FRAME_TYPES.find(f => f.id === e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
              >
                {FRAME_TYPES.map(frame => (
                  <option key={frame.id} value={frame.id}>{frame.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lumière et référence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <Sun size={14} />
                Luminosité
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={lighting}
                onChange={(e) => setLighting(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Référence</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReference(showReference === 'sofa' ? null : 'sofa')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${
                    showReference === 'sofa' 
                      ? 'bg-white text-black' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Sofa size={14} />
                  Canapé
                </button>
                <button
                  onClick={() => setShowReference(showReference === 'person' ? null : 'person')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${
                    showReference === 'person' 
                      ? 'bg-white text-black' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <User size={14} />
                  Personne
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/15 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} />
              {isExporting ? 'Export...' : 'Exporter'}
            </button>
            {onBuy && (
              <button
                onClick={onBuy}
                className="flex-1 px-4 py-3 bg-white text-black rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors font-medium"
              >
                Acheter cette œuvre
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
            <span className="flex items-center gap-1">
              <Move size={12} />
              Glisser pour déplacer
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 size={12} />
              Poignées pour redimensionner
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPreview;
