import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SalesChart = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    // Animation progressive des données
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data || data.length === 0) return null;

  // Calculer les dimensions du graphique
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };
  const width = 1000;
  const height = 350;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculer les échelles
  const maxSales = Math.max(...data.map(d => d.sales)) * 1.1;
  const maxStreams = Math.max(...data.map(d => d.streams)) * 1.1;

  const xScale = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
  const yScaleSales = (value) => padding.top + chartHeight - (value / maxSales) * chartHeight;
  const yScaleStreams = (value) => padding.top + chartHeight - (value / maxStreams) * chartHeight;

  // Générer les paths SVG
  const salesPath = data.map((d, i) => {
    const x = xScale(i);
    const y = yScaleSales(d.sales);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const streamsPath = data.map((d, i) => {
    const x = xScale(i);
    const y = yScaleStreams(d.streams);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Path pour l'aire sous la courbe (gradient)
  const salesAreaPath = `${salesPath} L ${xScale(data.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
  const streamsAreaPath = `${streamsPath} L ${xScale(data.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  return (
    <motion.div
      className="relative p-6 rounded-lg border border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full" />
          <div>
            <h2 className="text-xl font-bold text-cyan-100 tracking-wide">
              ANALYSE DES PERFORMANCES
            </h2>
            <p className="text-cyan-400/50 text-sm">
              Évolution sur 30 jours
            </p>
          </div>
        </motion.div>

        {/* Légende */}
        <motion.div
          className="flex items-center gap-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
            <span className="text-cyan-300 text-sm">Ventes (€)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
            <span className="text-purple-300 text-sm">Streams</span>
          </div>
        </motion.div>
      </div>

      {/* Graphique SVG */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[800px]"
          style={{ filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.1))' }}
        >
          {/* Définitions des gradients et filtres */}
          <defs>
            {/* Gradient pour les ventes */}
            <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </linearGradient>

            {/* Gradient pour les streams */}
            <linearGradient id="streamsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
            </linearGradient>

            {/* Filtre glow néon */}
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Pattern grille */}
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Fond grille */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            fill="url(#grid)"
          />

          {/* Lignes de grille horizontales */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={padding.top + chartHeight * ratio}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight * ratio}
              stroke="rgba(6, 182, 212, 0.15)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Aire sous les courbes */}
          <motion.path
            d={salesAreaPath}
            fill="url(#salesGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: animatedData.length > 0 ? 1 : 0 }}
            transition={{ duration: 1 }}
          />
          <motion.path
            d={streamsAreaPath}
            fill="url(#streamsGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: animatedData.length > 0 ? 0.6 : 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          />

          {/* Lignes principales avec effet néon */}
          <motion.path
            d={salesPath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            filter="url(#neonGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: animatedData.length > 0 ? 1 : 0, 
              opacity: animatedData.length > 0 ? 1 : 0 
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d={streamsPath}
            fill="none"
            stroke="#a855f7"
            strokeWidth="3"
            filter="url(#neonGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: animatedData.length > 0 ? 1 : 0, 
              opacity: animatedData.length > 0 ? 1 : 0 
            }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
          />

          {/* Points de données interactifs */}
          {data.map((d, i) => (
            <g key={i}>
              {/* Points ventes */}
              <motion.circle
                cx={xScale(i)}
                cy={yScaleSales(d.sales)}
                r="6"
                fill="#06b6d4"
                stroke="#0891b2"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: animatedData.length > 0 ? 1 : 0, 
                  opacity: animatedData.length > 0 ? 1 : 0 
                }}
                transition={{ duration: 0.3, delay: 1.5 + i * 0.02 }}
                whileHover={{ scale: 1.5, r: 8 }}
                onMouseEnter={() => setHoveredPoint({ index: i, type: 'sales', data: d })}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              />
              
              {/* Halo animé autour des points */}
              <motion.circle
                cx={xScale(i)}
                cy={yScaleSales(d.sales)}
                r="12"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.5, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.1 
                }}
              />

              {/* Points streams */}
              <motion.circle
                cx={xScale(i)}
                cy={yScaleStreams(d.streams)}
                r="4"
                fill="#a855f7"
                stroke="#9333ea"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: animatedData.length > 0 ? 1 : 0, 
                  opacity: animatedData.length > 0 ? 1 : 0 
                }}
                transition={{ duration: 0.3, delay: 1.7 + i * 0.02 }}
                whileHover={{ scale: 1.5, r: 6 }}
                onMouseEnter={() => setHoveredPoint({ index: i, type: 'streams', data: d })}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              />
            </g>
          ))}

          {/* Axe X */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#06b6d4"
            strokeWidth="1"
          />

          {/* Labels X (tous les 5 jours) */}
          {data.filter((_, i) => i % 5 === 0).map((d, i) => {
            const originalIndex = i * 5;
            return (
              <text
                key={i}
                x={xScale(originalIndex)}
                y={padding.top + chartHeight + 25}
                fill="#06b6d4"
                fontSize="12"
                textAnchor="middle"
                className="font-mono"
              >
                {d.date}
              </text>
            );
          })}

          {/* Axe Y gauche (ventes) */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#06b6d4"
            strokeWidth="1"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <text
              key={i}
              x={padding.left - 10}
              y={padding.top + chartHeight * (1 - ratio) + 5}
              fill="#06b6d4"
              fontSize="11"
              textAnchor="end"
              className="font-mono"
            >
              {Math.round(maxSales * ratio).toLocaleString('fr-FR')}€
            </text>
          ))}

          {/* Axe Y droit (streams) */}
          <line
            x1={padding.left + chartWidth}
            y1={padding.top}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#a855f7"
            strokeWidth="1"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <text
              key={i}
              x={padding.left + chartWidth + 10}
              y={padding.top + chartHeight * (1 - ratio) + 5}
              fill="#a855f7"
              fontSize="11"
              textAnchor="start"
              className="font-mono"
            >
              {(maxStreams * ratio / 1000).toFixed(0)}k
            </text>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <motion.div
            className="absolute bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3 pointer-events-none z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              left: '50%',
              top: '20%',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-cyan-300 text-sm font-mono mb-1">
              {hoveredPoint.data.date}
            </div>
            <div className={`text-lg font-bold ${
              hoveredPoint.type === 'sales' ? 'text-cyan-400' : 'text-purple-400'
            }`}>
              {hoveredPoint.type === 'sales' 
                ? `${hoveredPoint.data.sales.toLocaleString('fr-FR')} €`
                : `${hoveredPoint.data.streams.toLocaleString('fr-FR')} streams`
              }
            </div>
          </motion.div>
        )}
      </div>

      {/* Indicateurs de statistiques */}
      <motion.div
        className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-cyan-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <div className="text-center">
          <div className="text-cyan-400/60 text-xs uppercase tracking-wider mb-1">Moyenne Journalière</div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">
            {Math.round(data.reduce((a, b) => a + b.sales, 0) / data.length).toLocaleString('fr-FR')} €
          </div>
        </div>
        <div className="text-center">
          <div className="text-purple-400/60 text-xs uppercase tracking-wider mb-1">Pic de Streams</div>
          <div className="text-2xl font-bold text-purple-300 font-mono">
            {Math.max(...data.map(d => d.streams)).toLocaleString('fr-FR')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-emerald-400/60 text-xs uppercase tracking-wider mb-1">Tendance</div>
          <div className="text-2xl font-bold text-emerald-300 font-mono">
            +{(data[data.length - 1].sales / data[0].sales * 100 - 100).toFixed(1)}%
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SalesChart;
