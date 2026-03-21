import React, { useState } from 'react';

export const ColorPaletteHUD = ({ 
  colors = [],
  showPercentages = true,
  showLabels = true,
  onColorSelect,
  extractMode = 'dominant'
}) => {
  const [hoveredColor, setHoveredColor] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const handleColorClick = (color) => {
    setSelectedColor(color.hex === selectedColor ? null : color.hex);
    if (onColorSelect) onColorSelect(color);
  };

  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000' : '#fff';
  };

  const extractModes = [
    { id: 'dominant', label: 'DOMINANT', icon: '◈' },
    { id: 'vibrant', label: 'VIBRANT', icon: '◉' },
    { id: 'muted', label: 'MUTED', icon: '○' }
  ];

  return (
    <div className="color-palette-hud">
      {/* Header */}
      <div className="palette-header">
        <span className="header-icon">◉</span>
        <span className="header-title">COLOR PALETTE</span>
        <span className="header-count">{colors.length} COLORS</span>
      </div>

      {/* Extract Mode Selector */}
      <div className="extract-modes">
        {extractModes.map(mode => (
          <button
            key={mode.id}
            className={`mode-btn ${extractMode === mode.id ? 'active' : ''}`}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Color Swatches */}
      <div className="color-swatches">
        {colors.length > 0 ? (
          colors.map((color, index) => (
            <div
              key={index}
              className={`swatch-container ${selectedColor === color.hex ? 'selected' : ''}`}
              onMouseEnter={() => setHoveredColor(color)}
              onMouseLeave={() => setHoveredColor(null)}
              onClick={() => handleColorClick(color)}
            >
              {/* Color Bar */}
              <div 
                className="color-bar"
                style={{ 
                  backgroundColor: color.hex,
                  height: showPercentages ? `${Math.max(color.percentage || 10, 15)}%` : '40px'
                }}
              >
                {/* Percentage Label */}
                {showPercentages && (
                  <span 
                    className="percentage-label"
                    style={{ color: getContrastColor(color.hex) }}
                  >
                    {color.percentage}%
                  </span>
                )}
              </div>

              {/* Color Info */}
              {showLabels && (
                <div className="color-info">
                  <span className="color-name">{color.name}</span>
                  <span className="color-hex">{color.hex}</span>
                </div>
              )}

              {/* Hover Tooltip */}
              {hoveredColor?.hex === color.hex && (
                <div className="color-tooltip">
                  <div 
                    className="tooltip-preview"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="tooltip-details">
                    <span className="tooltip-name">{color.name}</span>
                    <span className="tooltip-hex">{color.hex}</span>
                    <span className="tooltip-rgb">
                      {color.rgb || 'RGB: --'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-colors">
            <span className="no-colors-icon">◌</span>
            <span>No colors extracted</span>
          </div>
        )}
      </div>

      {/* Color Distribution Bar */}
      <div className="distribution-bar">
        {colors.map((color, index) => (
          <div
            key={index}
            className="distribution-segment"
            style={{ 
              backgroundColor: color.hex,
              width: `${color.percentage || 20}%`
            }}
            title={`${color.name}: ${color.percentage}%`}
          />
        ))}
      </div>

      {/* Selected Color Details */}
      {selectedColor && (
        <div className="selected-color-panel">
          <div className="selected-header">
            <span>SELECTED COLOR</span>
            <button 
              className="close-btn"
              onClick={() => setSelectedColor(null)}
            >
              ×
            </button>
          </div>
          {colors.filter(c => c.hex === selectedColor).map(color => (
            <div key={color.hex} className="selected-details">
              <div 
                className="selected-preview"
                style={{ backgroundColor: color.hex }}
              />
              <div className="selected-info">
                <div className="info-row">
                  <span className="info-label">HEX</span>
                  <span className="info-value">{color.hex}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">NAME</span>
                  <span className="info-value">{color.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">DOMINANCE</span>
                  <span className="info-value">{color.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Color Analysis Stats */}
      <div className="palette-stats">
        <div className="stat-item">
          <span className="stat-label">TEMP</span>
          <div className="stat-bar">
            <div className="stat-fill warm" style={{ width: '65%' }} />
          </div>
          <span className="stat-value">WARM</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">SAT</span>
          <div className="stat-bar">
            <div className="stat-fill saturation" style={{ width: '80%' }} />
          </div>
          <span className="stat-value">HIGH</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">BRI</span>
          <div className="stat-bar">
            <div className="stat-fill brightness" style={{ width: '45%' }} />
          </div>
          <span className="stat-value">MED</span>
        </div>
      </div>

      <style jsx>{`
        .color-palette-hud {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 6px;
          padding: 15px;
          font-family: 'Rajdhani', monospace;
        }

        /* Header */
        .palette-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        .header-icon {
          color: #00d4ff;
          font-size: 12px;
        }

        .header-title {
          flex: 1;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(0, 212, 255, 0.8);
        }

        .header-count {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Extract Modes */
        .extract-modes {
          display: flex;
          gap: 5px;
          margin-bottom: 15px;
        }

        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px;
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 3px;
          color: rgba(0, 212, 255, 0.6);
          font-size: 8px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-btn:hover {
          background: rgba(0, 212, 255, 0.1);
          border-color: rgba(0, 212, 255, 0.4);
        }

        .mode-btn.active {
          background: rgba(0, 212, 255, 0.2);
          border-color: #00d4ff;
          color: #00d4ff;
        }

        .mode-icon {
          font-size: 10px;
        }

        /* Color Swatches */
        .color-swatches {
          display: flex;
          gap: 8px;
          min-height: 100px;
          margin-bottom: 15px;
        }

        .swatch-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          position: relative;
          transition: transform 0.2s;
        }

        .swatch-container:hover {
          transform: translateY(-3px);
        }

        .swatch-container.selected {
          transform: scale(1.05);
        }

        .color-bar {
          width: 100%;
          min-height: 40px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
          position: relative;
        }

        .swatch-container:hover .color-bar {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .percentage-label {
          font-size: 10px;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .color-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .color-name {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
        }

        .color-hex {
          font-size: 8px;
          color: rgba(0, 212, 255, 0.6);
          font-family: monospace;
        }

        /* Tooltip */
        .color-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(10, 15, 30, 0.95);
          border: 1px solid #00d4ff;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 10px;
          z-index: 100;
          min-width: 120px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .color-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: #00d4ff;
        }

        .tooltip-preview {
          width: 100%;
          height: 40px;
          border-radius: 3px;
          margin-bottom: 8px;
        }

        .tooltip-details {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .tooltip-name {
          font-size: 11px;
          color: #fff;
          font-weight: 500;
        }

        .tooltip-hex {
          font-size: 10px;
          color: #00d4ff;
          font-family: monospace;
        }

        .tooltip-rgb {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.5);
        }

        /* No Colors */
        .no-colors {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 30px;
          color: rgba(255, 255, 255, 0.3);
          font-size: 11px;
        }

        .no-colors-icon {
          font-size: 24px;
          opacity: 0.5;
        }

        /* Distribution Bar */
        .distribution-bar {
          display: flex;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 15px;
          background: rgba(255, 255, 255, 0.05);
        }

        .distribution-segment {
          height: 100%;
          transition: all 0.3s;
        }

        .distribution-segment:hover {
          filter: brightness(1.2);
        }

        /* Selected Color Panel */
        .selected-color-panel {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 15px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .selected-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          letter-spacing: 1px;
          color: rgba(0, 212, 255, 0.7);
          margin-bottom: 10px;
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 16px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #ff4757;
        }

        .selected-details {
          display: flex;
          gap: 12px;
        }

        .selected-preview {
          width: 50px;
          height: 50px;
          border-radius: 4px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .selected-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
        }

        .info-label {
          color: rgba(0, 212, 255, 0.5);
        }

        .info-value {
          color: rgba(255, 255, 255, 0.9);
          font-family: monospace;
        }

        /* Palette Stats */
        .palette-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 212, 255, 0.1);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stat-label {
          font-size: 8px;
          letter-spacing: 1px;
          color: rgba(0, 212, 255, 0.5);
          width: 30px;
        }

        .stat-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .stat-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .stat-fill.warm {
          background: linear-gradient(90deg, #f97316, #eab308);
        }

        .stat-fill.saturation {
          background: linear-gradient(90deg, #64748b, #ec4899);
        }

        .stat-fill.brightness {
          background: linear-gradient(90deg, #1e293b, #f8fafc);
        }

        .stat-value {
          font-size: 8px;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.6);
          width: 40px;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default ColorPaletteHUD;
