import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subValue, icon, delay, color = "cyan" }) => {
  const colorClasses = {
    cyan: {
      border: 'border-cyan-500/30',
      bg: 'from-cyan-500/10 to-cyan-900/5',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/20',
      icon: 'text-cyan-300'
    },
    purple: {
      border: 'border-purple-500/30',
      bg: 'from-purple-500/10 to-purple-900/5',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/20',
      icon: 'text-purple-300'
    },
    green: {
      border: 'border-emerald-500/30',
      bg: 'from-emerald-500/10 to-emerald-900/5',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
      icon: 'text-emerald-300'
    },
    orange: {
      border: 'border-orange-500/30',
      bg: 'from-orange-500/10 to-orange-900/5',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/20',
      icon: 'text-orange-300'
    }
  };

  const colors = colorClasses[color];

  // Animation compteur
  const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: delay + 0.3 }}
        >
          {value.toLocaleString('fr-FR')}
        </motion.span>
        {suffix}
      </motion.span>
    );
  };

  return (
    <motion.div
      className={`relative p-6 rounded-lg border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-sm overflow-hidden group`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 0 30px ${color === 'cyan' ? 'rgba(6,182,212,0.3)' : 
                                   color === 'purple' ? 'rgba(168,85,247,0.3)' :
                                   color === 'green' ? 'rgba(16,185,129,0.3)' : 'rgba(249,115,22,0.3)'}`,
      }}
    >
      {/* Effet de scan au survol */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-b ${colors.bg} opacity-0 group-hover:opacity-100`}
        initial={{ y: '-100%' }}
        whileHover={{ y: '100%' }}
        transition={{ duration: 0.8 }}
      />

      {/* Coins néon */}
      <div className={`absolute top-0 left-0 w-4 h-4 border-t border-l ${colors.border.replace('/30', '/60')}`} />
      <div className={`absolute top-0 right-0 w-4 h-4 border-t border-r ${colors.border.replace('/30', '/60')}`} />
      <div className={`absolute bottom-0 left-0 w-4 h-4 border-b border-l ${colors.border.replace('/30', '/60')}`} />
      <div className={`absolute bottom-0 right-0 w-4 h-4 border-b border-r ${colors.border.replace('/30', '/60')}`} />

      {/* Ligne animée en haut */}
      <motion.div
        className={`absolute top-0 left-0 h-px ${colors.text.replace('text', 'bg')}`}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.5, delay: delay + 0.5, ease: "easeInOut" }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyan-200/60 text-sm uppercase tracking-wider font-medium">
            {title}
          </h3>
          <motion.div
            className={`text-2xl ${colors.icon}`}
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              delay: delay + 1
            }}
          >
            {icon}
          </motion.div>
        </div>

        <div className={`text-4xl font-bold ${colors.text} mb-2 font-mono tracking-tight`}>
          <AnimatedCounter value={value} />
        </div>

        {subValue && (
          <motion.div
            className="text-cyan-400/50 text-sm flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.6 }}
          >
            <motion.span
              className="text-emerald-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ▲
            </motion.span>
            {subValue}
          </motion.div>
        )}

        {/* Barre de progression décorative */}
        <div className="mt-4 h-1 bg-cyan-900/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${colors.text.replace('text', 'bg')}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.random() * 40 + 60}%` }}
            transition={{ duration: 1.5, delay: delay + 0.8 }}
          />
        </div>
      </div>

      {/* Particules flottantes */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${colors.text.replace('text', 'bg')} opacity-40`}
          style={{
            left: `${20 + i * 30}%`,
            bottom: '10%',
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.div>
  );
};

const StatsGrid = ({ stats }) => {
  const cards = [
    {
      title: 'Ventes Totales',
      value: stats.totalSales,
      subValue: '+12.5% ce mois',
      icon: '💰',
      color: 'cyan',
    },
    {
      title: 'Streams',
      value: stats.totalStreams,
      subValue: '+8.3% cette semaine',
      icon: '🎵',
      color: 'purple',
    },
    {
      title: 'Artistes Actifs',
      value: stats.activeArtists,
      subValue: '100% actifs',
      icon: '🎤',
      color: 'green',
    },
    {
      title: 'Croissance Mensuelle',
      value: stats.monthlyGrowth,
      subValue: 'vs mois dernier',
      icon: '📈',
      color: 'orange',
      suffix: '%'
    },
  ];

  return (
    <div className="space-y-4">
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
        <h2 className="text-xl font-bold text-cyan-100 tracking-wide">
          STATISTIQUES EN TEMPS RÉEL
        </h2>
        <motion.div
          className="flex gap-1 ml-4"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <StatCard
            key={card.title}
            {...card}
            delay={index * 0.15}
          />
        ))}
      </div>

      {/* Ligne d'information supplémentaire */}
      <motion.div
        className="mt-6 p-4 rounded-lg border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-cyan-400/60">VENTES AUJOURD'HUI:</span>
            <span className="text-cyan-300 font-mono font-bold">
              {stats.todaySales.toLocaleString('fr-FR')} €
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-cyan-400/60">STREAMS CETTE SEMAINE:</span>
            <span className="text-purple-300 font-mono font-bold">
              {stats.weekStreams.toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsGrid;
