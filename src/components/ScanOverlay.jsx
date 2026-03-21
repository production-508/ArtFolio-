import React, { useEffect, useState } from 'react';

export const ScanOverlay = ({ 
  intensity = 0.8, 
  scanSpeed = 2000,
  gridDensity = 20,
  color = '#00d4ff'
}) => {
  const [scanPosition, setScanPosition] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanPosition(prev => (prev + 1) % 100);
    }, scanSpeed / 50);

    return () => clearInterval(interval);
  }, [isScanning, scanSpeed]);

  return (
    <div 
      className="scan-overlay"
      style={{ 
        '--scan-color': color,
        '--scan-intensity': intensity 
      }}
    >
      {/* Scan Grid */}
      <div className="scan-grid">
        {Array.from({ length: gridDensity }).map((_, i) => (
          <div 
            key={`h-${i}`}
            className="grid-line horizontal"
            style={{ top: `${(i / gridDensity) * 100}%` }}
          />
        ))}
        {Array.from({ length: gridDensity }).map((_, i) => (
          <div 
            key={`v-${i}`}
            className="grid-line vertical"
            style={{ left: `${(i / gridDensity) * 100}%` }}
          />
        ))}
      </div>

      {/* Scan Line */}
      <div 
        className="scan-line"
        style={{ top: `${scanPosition}%` }}
      >
        <div className="scan-beam" />
        <div className="scan-glow" />
        <div className="scan-data">
          <span className="data-text">ANALYZING...</span>
          <span className="data-percentage">{scanPosition}%</span>
        </div>
      </div>

      {/* Scan Markers */}
      <div className="scan-markers">
        <div className="marker tl">
          <span className="marker-coords">X:000 Y:000</span>
        </div>
        <div className="marker tr">
          <span className="marker-coords">X:{gridDensity * 10} Y:000</span>
        </div>
        <div className="marker bl">
          <span className="marker-coords">X:000 Y:{gridDensity * 10}</span>
        </div>
        <div className="marker br">
          <span className="marker-coords">X:{gridDensity * 10} Y:{gridDensity * 10}</span>
        </div>
      </div>

      {/* Waveform Display */}
      <div className="waveform-container left">
        <div className="waveform-label">OPTICAL</div>
        <div className="waveform">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="wave-bar"
              style={{ 
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="waveform-container right">
        <div className="waveform-label">SPECTRAL</div>
        <div className="waveform">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="wave-bar spectral"
              style={{ 
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Data Readout */}
      <div className="data-readout">
        <div className="readout-item">
          <span className="readout-label">SCAN RES</span>
          <span className="readout-value">{gridDensity * 10}px</span>
        </div>
        <div className="readout-item">
          <span className="readout-label">DEPTH</span>
          <span className="readout-value">{(intensity * 100).toFixed(0)}%</span>
        </div>
        <div className="readout-item">
          <span className="readout-label">FREQ</span>
          <span className="readout-value">{(1000 / scanSpeed).toFixed(1)}Hz</span>
        </div>
      </div>

      {/* Corner Brackets */}
      <div className="corner-bracket tl" />
      <div className="corner-bracket tr" />
      <div className="corner-bracket bl" />
      <div className="corner-bracket br" />

      <style jsx>{`
        .scan-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* Scan Grid */
        .scan-grid {
          position: absolute;
          inset: 0;
        }

        .grid-line {
          position: absolute;
          background: var(--scan-color);
          opacity: calc(0.1 * var(--scan-intensity));
        }

        .grid-line.horizontal {
          width: 100%;
          height: 1px;
        }

        .grid-line.vertical {
          width: 1px;
          height: 100%;
        }

        /* Scan Line */
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          transition: top 0.05s linear;
        }

        .scan-beam {
          position: absolute;
          inset: 0;
          background: var(--scan-color);
          box-shadow: 
            0 0 10px var(--scan-color),
            0 0 20px var(--scan-color),
            0 0 40px var(--scan-color);
          animation: pulse 0.5s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          from { opacity: 0.8; }
          to { opacity: 1; }
        }

        .scan-glow {
          position: absolute;
          top: -20px;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(
            to bottom,
            transparent,
            var(--scan-color),
            transparent
          );
          opacity: 0.3;
        }

        .scan-data {
          position: absolute;
          right: 20px;
          top: -30px;
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(0, 0, 0, 0.8);
          padding: 5px 15px;
          border-radius: 4px;
          border: 1px solid var(--scan-color);
        }

        .data-text {
          font-size: 10px;
          letter-spacing: 2px;
          color: var(--scan-color);
        }

        .data-percentage {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          font-family: monospace;
          min-width: 40px;
          text-align: right;
        }

        /* Scan Markers */
        .scan-markers {
          position: absolute;
          inset: 0;
        }

        .marker {
          position: absolute;
          padding: 8px;
        }

        .marker.tl { top: 10px; left: 10px; }
        .marker.tr { top: 10px; right: 10px; }
        .marker.bl { bottom: 10px; left: 10px; }
        .marker.br { bottom: 10px; right: 10px; }

        .marker-coords {
          font-size: 9px;
          letter-spacing: 1px;
          color: var(--scan-color);
          opacity: 0.7;
          font-family: monospace;
        }

        /* Waveform */
        .waveform-container {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .waveform-container.left { left: 20px; }
        .waveform-container.right { right: 20px; }

        .waveform-label {
          font-size: 8px;
          letter-spacing: 2px;
          color: var(--scan-color);
          opacity: 0.6;
        }

        .waveform {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 60px;
          width: 40px;
        }

        .wave-bar {
          flex: 1;
          background: var(--scan-color);
          opacity: 0.6;
          animation: wave 0.5s ease-in-out infinite alternate;
          min-height: 5px;
        }

        .wave-bar.spectral {
          background: linear-gradient(to top, #f97316, #eab308);
        }

        @keyframes wave {
          from { opacity: 0.3; transform: scaleY(0.5); }
          to { opacity: 0.8; transform: scaleY(1); }
        }

        /* Data Readout */
        .data-readout {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 30px;
          background: rgba(0, 0, 0, 0.7);
          padding: 10px 25px;
          border-radius: 4px;
          border: 1px solid rgba(0, 212, 255, 0.3);
        }

        .readout-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .readout-label {
          font-size: 8px;
          letter-spacing: 1px;
          color: rgba(0, 212, 255, 0.5);
        }

        .readout-value {
          font-size: 12px;
          color: #fff;
          font-family: monospace;
        }

        /* Corner Brackets */
        .corner-bracket {
          position: absolute;
          width: 40px;
          height: 40px;
          border-color: var(--scan-color);
          border-style: solid;
          border-width: 0;
          opacity: 0.5;
        }

        .corner-bracket.tl {
          top: 20px;
          left: 20px;
          border-top-width: 2px;
          border-left-width: 2px;
        }

        .corner-bracket.tr {
          top: 20px;
          right: 20px;
          border-top-width: 2px;
          border-right-width: 2px;
        }

        .corner-bracket.bl {
          bottom: 20px;
          left: 20px;
          border-bottom-width: 2px;
          border-left-width: 2px;
        }

        .corner-bracket.br {
          bottom: 20px;
          right: 20px;
          border-bottom-width: 2px;
          border-right-width: 2px;
        }
      `}</style>
    </div>
  );
};

export default ScanOverlay;
