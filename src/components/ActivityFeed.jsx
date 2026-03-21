import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityFeed = ({ activities }) => {
  const [visibleActivities, setVisibleActivities] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Animation progressive des activités
    const showActivities = async () => {
      for (let i = 0; i < activities.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setVisibleActivities(prev => [...prev, activities[i]]);
      }
    };
    showActivities();
  }, [activities]);

  const filters = [
    { id: 'all', label: 'TOUT', color: 'cyan' },
    { id: 'sale', label: 'VENTES', color: 'emerald' },
    { id: 'release', label: 'SORTIES', color: 'purple' },
    { id: 'event', label: 'ÉVÉNEMENTS', color: 'orange' },
    { id: 'growth', label: 'CROISSANCE', color: 'blue' },
  ];

  const filteredActivities = selectedFilter === 'all' 
    ? visibleActivities 
    : visibleActivities.filter(a => a.type === selectedFilter);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale': return '💰';
      case 'release': return '🎵';
      case 'event': return '🎤';
      case 'growth': return '📈';
      default: return '✨';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sale': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
      case 'release': return 'border-purple-500/50 bg-purple-500/10 text-purple-400';
      case 'event': return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
      case 'growth': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      default: return 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400';
    }
  };

  const getGlowColor = (type) => {
    switch (type) {
      case 'sale': return 'shadow-emerald-500/20';
      case 'release': return 'shadow-purple-500/20';
      case 'event': return 'shadow-orange-500/20';
      case 'growth': return 'shadow-blue-500/20';
      default: return 'shadow-cyan-500/20';
    }
  };

  return (
    <motion.div
      className="h-full flex flex-col rounded-lg border border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20">
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full" />
          <h2 className="text-lg font-bold text-cyan-100 tracking-wide">
            ACTIVITÉ EN DIRECT
          </h2>
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <motion.button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all duration-300 ${
                selectedFilter === filter.id
                  ? `bg-${filter.color}-500/30 text-${filter.color}-300 border border-${filter.color}-500/50`
                  : 'bg-slate-800/50 text-cyan-400/50 border border-cyan-500/20 hover:border-cyan-500/40'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Liste des activités */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.9 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.03,
                type: "spring",
                stiffness: 200
              }}
              className={`relative p-3 rounded-lg border ${getTypeColor(activity.type)} ${getGlowColor(activity.type)} hover:shadow-lg transition-shadow duration-300 cursor-pointer group`}
            >
              {/* Ligne temporelle connectée */}
              {index < filteredActivities.length - 1 && (
                <motion.div
                  className="absolute left-6 top-full w-px h-3 bg-gradient-to-b from-current to-transparent opacity-30"
                  initial={{ height: 0 }}
                  animate={{ height: 12 }}
                  transition={{ delay: 0.3 }}
                />
              )}

              <div className="flex items-start gap-3">
                {/* Icône avec animation */}
                <motion.div
                  className="relative w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-lg border border-current"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {getTypeIcon(activity.type)}
                  
                  {/* Pulse effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-current"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-cyan-100 truncate">
                      {activity.artist}
                    </h4>
                    <span className="text-xs font-mono text-cyan-400/50 whitespace-nowrap">
                      {activity.timeAgo}
                    </span>
                  </div>
                  
                  <p className="text-xs text-cyan-300/70 mt-1">
                    {activity.event}
                  </p>

                  {/* Valeur si présente */}
                  {(activity.type === 'sale' || activity.type === 'growth') && (
                    <motion.div
                      className="mt-2 text-sm font-bold font-mono"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {activity.type === 'sale' ? '+' : ''}
                      {activity.value.toLocaleString('fr-FR')}
                      {activity.type === 'sale' ? ' €' : ''}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Effet hover scan */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Message si vide */}
        {filteredActivities.length === 0 && (
          <motion.div
            className="text-center py-8 text-cyan-400/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">Aucune activité pour ce filtre</p>
          </motion.div>
        )}
      </div>

      {/* Footer avec statistiques */}
      <div className="p-4 border-t border-cyan-500/20 bg-slate-900/30">
        <div className="grid grid-cols-2 gap-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-xs text-cyan-400/50 uppercase tracking-wider">Total Aujourd'hui</div>
            <div className="text-xl font-bold text-cyan-300 font-mono">
              {visibleActivities.length}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-xs text-cyan-400/50 uppercase tracking-wider">En Direct</div>
            <div className="flex items-center justify-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xl font-bold text-green-400 font-mono">
                ACTIF
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animation nouvelle activité */}
      <motion.div
        className="absolute top-4 right-4"
        animate={{ 
          opacity: [0, 1, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5
        }}
      >
        <div className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-xs text-cyan-300">
          +1 nouvelle activité
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActivityFeed;
