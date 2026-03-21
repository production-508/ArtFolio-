import React, { useState, useEffect, useCallback } from 'react';
import { ScanOverlay } from './ScanOverlay';
import { ColorPaletteHUD } from './ColorPaletteHUD';

export const JarvisArtworkViewer = ({ 
  artworkUrl, 
  artworkData = {}, 
  onClose,
  onARToggle 
}) => {
  const [scanMode, setScanMode] = useState(false);
  const [arMode, setArMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [hudVisible, setHudVisible] = useState(true);

  const {
    title = 'Unknown Artwork',
    artist = 'Unknown Artist',
    year = '----',
    medium = 'Unknown Medium',
    dimensions = '--- x --- cm',
    style = 'Unknown Style',
    description = 'No description available',
    estimatedValue = '---',
    provenance = [],
    exhibitionHistory = []
  } = artworkData;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [artworkUrl]);

  const handleARToggle = useCallback(() => {
    const newArMode = !arMode;
    setArMode(newArMode);
    if (onARToggle) onARToggle(newArMode);
  }, [arMode, onARToggle]);

  const handleZoneClick = (zone) => {
    setSelectedZone(zone === selectedZone ? null : zone);
  };

  return (
    <div className={`jarvis-viewer ${arMode ? 'ar-mode' : ''}`}>
      {/* Background Grid */}
      <div className="hud-grid" />
      
      {/* Main Container */}
      <div className="viewer-container">
        
        {/* Top HUD Bar */}
        <div className="hud-top-bar">
          <div className="hud-section left">
            <span className="hud-label">J.A.R.V.I.S.</span>
            <span className="hud-status online">● ONLINE</span>
          </div>
          <div className="hud-section center">
            <span className="hud-title">ARTWORK ANALYSIS SYSTEM</span>
          </div>
          <div className="hud-section right">
            <span className="hud-time">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <button className="hud-btn close" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Left Info Panel */}
        <div className={`hud-panel left-panel ${hudVisible ? 'visible' : ''}`}>
          <div className="panel-header">
            <span className="panel-icon">◈</span>
            <span>ARTWORK DATA</span>
          </div>
          
          <div className="data-section">
            <div className="data-row primary">
              <span className="label">TITLE</span>
              <span className="value highlight">{title}</span>
            </div>
            <div className="data-row">
              <span className="label">ARTIST</span>
              <span className="value">{artist}</span>
            </div>
            <div className="data-row">
              <span className="label">YEAR</span>
              <span className="value">{year}</span>
            </div>
            <div className="data-row">
              <span className="label">STYLE</span>
              <span className="value tag">{style}</span>
            </div>
          </div>

          <div className="divider" />

          <div className="data-section">
            <div className="data-row">
              <span className="label">MEDIUM</span>
              <span className="value">{medium}</span>
            </div>
            <div className="data-row">
              <span className="label">DIMENSIONS</span>
              <span className="value">{dimensions}</span>
            </div>
            <div className="data-row">
              <span className="label">EST. VALUE</span>
              <span className="value value-currency">{estimatedValue}</span>
            </div>
          </div>

          <div className="divider" />

          <div className="data-section">
            <span className="section-title">DESCRIPTION</span>
            <p className="description-text">{description}</p>
          </div>
        </div>

        {/* Center - Artwork Display */}
        <div className="artwork-display">
          <div className={`artwork-frame ${scanMode ? 'scanning' : ''}`}>
            {loading ? (
              <div className="loading-container">
                <div className="loading-ring" />
                <span className="loading-text">ANALYZING ARTWORK...</span>
              </div>
            ) : (
              <>
                <img 
                  src={artworkUrl} 
                  alt={title}
                  className="artwork-image"
                />
                
                {/* Interactive Zones */}
                <div className="interaction-zones">
                  <button 
                    className={`zone-marker ${selectedZone === 'center' ? 'active' : ''}`}
                    style={{ top: '50%', left: '50%' }}
                    onClick={() => handleZoneClick('center')}
                  >
                    <span className="marker-ring" />
                    <span className="marker-dot" />
                  </button>
                  <button 
                    className={`zone-marker ${selectedZone === 'tl' ? 'active' : ''}`}
                    style={{ top: '25%', left: '25%' }}
                    onClick={() => handleZoneClick('tl')}
                  >
                    <span className="marker-ring" />
                    <span className="marker-dot" />
                  </button>
                  <button 
                    className={`zone-marker ${selectedZone === 'br' ? 'active' : ''}`}
                    style={{ top: '75%', left: '75%' }}
                    onClick={() => handleZoneClick('br')}
                  >
                    <span className="marker-ring" />
                    <span className="marker-dot" />
                  </button>
                </div>

                {/* Scan Overlay */}
                {scanMode && <ScanOverlay intensity={0.8} />}
              </>
            )}
          </div>

          {/* Frame Corners */}
          <div className="frame-corners">
            <div className="corner tl" />
            <div className="corner tr" />
            <div className="corner bl" />
            <div className="corner br" />
          </div>
        </div>

        {/* Right Info Panel */}
        <div className={`hud-panel right-panel ${hudVisible ? 'visible' : ''}`}>
          <div className="panel-header">
            <span className="panel-icon">◉</span>
            <span>ANALYSIS</span>
          </div>

          {/* Color Palette */}
          <ColorPaletteHUD 
            colors={artworkData.colorPalette || [
              { hex: '#0EA5E9', name: 'Cyan', percentage: 35 },
              { hex: '#F97316', name: 'Orange', percentage: 25 },
              { hex: '#1E293B', name: 'Slate', percentage: 20 },
              { hex: '#EAB308', name: 'Gold', percentage: 15 },
              { hex: '#EC4899', name: 'Pink', percentage: 5 }
            ]}
          />

          <div className="divider" />

          {/* Technical Analysis */}
          <div className="data-section">
            <span className="section-title">TECHNICAL DATA</span>
            <div className="tech-grid">
              <div className="tech-item">
                <span className="tech-label">RESOLUTION</span>
                <span className="tech-value">4K UHD</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">COLOR DEPTH</span>
                <span className="tech-value">32-bit</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">BRIGHTNESS</span>
                <span className="tech-value">98%</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">CONTRAST</span>
                <span className="tech-value">High</span>
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Provenance */}
          <div className="data-section">
            <span className="section-title">PROVENANCE</span>
            <ul className="provenance-list">
              {(provenance.length > 0 ? provenance : [
                'Artist Studio (2020)',
                'Private Collection (2021)',
                'Current Owner (2023)'
              ]).map((item, i) => (
                <li key={i} className="provenance-item">
                  <span className="bullet">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="hud-bottom-bar">
          <div className="control-group">
            <button 
              className={`hud-control ${scanMode ? 'active' : ''}`}
              onClick={() => setScanMode(!scanMode)}
            >
              <span className="control-icon">⚡</span>
              <span>SCAN MODE</span>
            </button>
            
            <button 
              className={`hud-control ${arMode ? 'active' : ''}`}
              onClick={handleARToggle}
            >
              <span className="control-icon">◈</span>
              <span>AR VIEW</span>
            </button>
            
            <button 
              className={`hud-control ${hudVisible ? '' : 'inactive'}`}
              onClick={() => setHudVisible(!hudVisible)}
            >
              <span className="control-icon">◉</span>
              <span>HUD</span>
            </button>
          </div>

          <div className="system-status">
            <div className="status-item">
              <span className="status-indicator active" />
              <span>OPTICAL</span>
            </div>
            <div className="status-item">
              <span className="status-indicator active" />
              <span>SPECTRAL</span>
            </div>
            <div className="status-item">
              <span className="status-indicator" />
              <span>THERMAL</span>
            </div>
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="hud-corner tl">
          <div className="corner-line horizontal" />
          <div className="corner-line vertical" />
        </div>
        <div className="hud-corner tr">
          <div className="corner-line horizontal" />
          <div className="corner-line vertical" />
        </div>
        <div className="hud-corner bl">
          <div className="corner-line horizontal" />
          <div className="corner-line vertical" />
        </div>
        <div className="hud-corner br">
          <div className="corner-line horizontal" />
          <div className="corner-line vertical" />
        </div>
      </div>

      <style jsx>{`
        .jarvis-viewer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
          color: #00d4ff;
          font-family: 'Rajdhani', 'Segoe UI', monospace;
          overflow: hidden;
          z-index: 1000;
        }

        .jarvis-viewer.ar-mode {
          background: transparent;
        }

        .hud-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }

        .viewer-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-rows: 60px 1fr 80px;
          grid-template-columns: 320px 1fr 320px;
          gap: 20px;
          padding: 20px;
          box-sizing: border-box;
        }

        /* Top Bar */
        .hud-top-bar {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          background: linear-gradient(90deg, 
            rgba(0, 212, 255, 0.1) 0%, 
            rgba(0, 212, 255, 0.05) 50%, 
            rgba(0, 212, 255, 0.1) 100%);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 4px;
          position: relative;
        }

        .hud-top-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            #00d4ff 20%, 
            #00d4ff 80%, 
            transparent 100%);
        }

        .hud-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .hud-label {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #00d4ff;
        }

        .hud-status {
          font-size: 11px;
          letter-spacing: 1px;
        }

        .hud-status.online {
          color: #00ff88;
        }

        .hud-title {
          font-size: 16px;
          letter-spacing: 4px;
          color: rgba(255, 255, 255, 0.8);
        }

        .hud-time {
          font-size: 14px;
          font-family: monospace;
          color: rgba(0, 212, 255, 0.8);
        }

        .hud-btn {
          background: rgba(255, 71, 87, 0.2);
          border: 1px solid rgba(255, 71, 87, 0.5);
          color: #ff4757;
          width: 30px;
          height: 30px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.3s;
        }

        .hud-btn:hover {
          background: rgba(255, 71, 87, 0.4);
        }

        /* Side Panels */
        .hud-panel {
          background: rgba(10, 15, 30, 0.85);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 8px;
          padding: 20px;
          overflow-y: auto;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateX(-20px);
        }

        .hud-panel.right-panel {
          transform: translateX(20px);
        }

        .hud-panel.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          letter-spacing: 2px;
          color: rgba(0, 212, 255, 0.7);
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        .panel-icon {
          color: #00d4ff;
          font-size: 14px;
        }

        .data-section {
          margin-bottom: 20px;
        }

        .section-title {
          display: block;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(0, 212, 255, 0.6);
          margin-bottom: 10px;
        }

        .data-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 212, 255, 0.05);
        }

        .data-row.primary {
          padding: 12px 0;
        }

        .data-row .label {
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(0, 212, 255, 0.5);
        }

        .data-row .value {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          text-align: right;
        }

        .data-row .value.highlight {
          color: #00d4ff;
          font-size: 16px;
          font-weight: 600;
        }

        .data-row .value.tag {
          background: rgba(0, 212, 255, 0.15);
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid rgba(0, 212, 255, 0.3);
          font-size: 11px;
        }

        .value-currency {
          color: #fbbf24 !important;
          font-weight: 600;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(0, 212, 255, 0.3) 50%, 
            transparent 100%);
          margin: 15px 0;
        }

        .description-text {
          font-size: 12px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        /* Artwork Display */
        .artwork-display {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .artwork-frame {
          position: relative;
          max-width: 100%;
          max-height: 100%;
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 
            0 0 60px rgba(0, 212, 255, 0.1),
            inset 0 0 60px rgba(0, 0, 0, 0.5);
        }

        .artwork-frame.scanning {
          border-color: rgba(249, 115, 22, 0.5);
          box-shadow: 
            0 0 60px rgba(249, 115, 22, 0.2),
            inset 0 0 60px rgba(0, 0, 0, 0.5);
        }

        .artwork-image {
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
          display: block;
        }

        .loading-container {
          width: 400px;
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .loading-ring {
          width: 60px;
          height: 60px;
          border: 3px solid rgba(0, 212, 255, 0.2);
          border-top-color: #00d4ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 12px;
          letter-spacing: 3px;
          color: rgba(0, 212, 255, 0.7);
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Interactive Zones */
        .interaction-zones {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .zone-marker {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .marker-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(0, 212, 255, 0.5);
          border-radius: 50%;
          animation: ripple 2s ease-out infinite;
        }

        @keyframes ripple {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .marker-dot {
          width: 8px;
          height: 8px;
          background: #00d4ff;
          border-radius: 50%;
          box-shadow: 0 0 10px #00d4ff;
        }

        .zone-marker.active .marker-ring {
          border-color: #f97316;
        }

        .zone-marker.active .marker-dot {
          background: #f97316;
          box-shadow: 0 0 10px #f97316;
        }

        /* Frame Corners */
        .frame-corners {
          position: absolute;
          inset: 10px;
          pointer-events: none;
        }

        .corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #00d4ff;
          border-style: solid;
          border-width: 0;
        }

        .corner.tl {
          top: 0;
          left: 0;
          border-top-width: 2px;
          border-left-width: 2px;
        }

        .corner.tr {
          top: 0;
          right: 0;
          border-top-width: 2px;
          border-right-width: 2px;
        }

        .corner.bl {
          bottom: 0;
          left: 0;
          border-bottom-width: 2px;
          border-left-width: 2px;
        }

        .corner.br {
          bottom: 0;
          right: 0;
          border-bottom-width: 2px;
          border-right-width: 2px;
        }

        /* Technical Grid */
        .tech-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .tech-item {
          background: rgba(0, 212, 255, 0.05);
          padding: 10px;
          border-radius: 4px;
          border: 1px solid rgba(0, 212, 255, 0.1);
        }

        .tech-label {
          display: block;
          font-size: 9px;
          letter-spacing: 1px;
          color: rgba(0, 212, 255, 0.5);
          margin-bottom: 4px;
        }

        .tech-value {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        /* Provenance */
        .provenance-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .provenance-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 6px 0;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
        }

        .bullet {
          color: #00d4ff;
        }

        /* Bottom Bar */
        .hud-bottom-bar {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          background: rgba(0, 0, 0, 0.5);
          border-top: 1px solid rgba(0, 212, 255, 0.2);
        }

        .control-group {
          display: flex;
          gap: 15px;
        }

        .hud-control {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 4px;
          color: rgba(0, 212, 255, 0.8);
          font-size: 11px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .hud-control:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: rgba(0, 212, 255, 0.5);
        }

        .hud-control.active {
          background: rgba(249, 115, 22, 0.2);
          border-color: rgba(249, 115, 22, 0.5);
          color: #f97316;
        }

        .hud-control.inactive {
          opacity: 0.5;
        }

        .control-icon {
          font-size: 14px;
        }

        .system-status {
          display: flex;
          gap: 20px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.5);
        }

        .status-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
        }

        .status-indicator.active {
          background: #00ff88;
          box-shadow: 0 0 6px #00ff88;
        }

        /* Corner Decorations */
        .hud-corner {
          position: fixed;
          width: 100px;
          height: 100px;
          pointer-events: none;
        }

        .hud-corner.tl { top: 0; left: 0; }
        .hud-corner.tr { top: 0; right: 0; transform: rotate(90deg); }
        .hud-corner.bl { bottom: 0; left: 0; transform: rotate(-90deg); }
        .hud-corner.br { bottom: 0; right: 0; transform: rotate(180deg); }

        .corner-line {
          position: absolute;
          background: #00d4ff;
        }

        .corner-line.horizontal {
          width: 60px;
          height: 2px;
          top: 20px;
          left: 20px;
        }

        .corner-line.vertical {
          width: 2px;
          height: 60px;
          top: 20px;
          left: 20px;
        }
      `}</style>
    </div>
  );
};

export default JarvisArtworkViewer;
