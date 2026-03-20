import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Image, 
  Heart, 
  Eye, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { TextScramble } from '../components/TextScramble';
import { MagneticButton } from '../components/MagneticButton';

// Données de statistiques
const stats = [
  { 
    label: 'Œuvres uploadées', 
    value: 24, 
    change: '+3', 
    changeType: 'positive',
    icon: Image,
    color: 'cyan'
  },
  { 
    label: 'Vues totales', 
    value: 12543, 
    change: '+18%', 
    changeType: 'positive',
    icon: Eye,
    color: 'purple'
  },
  { 
    label: 'J\'aimes reçus', 
    value: 2847, 
    change: '+12%', 
    changeType: 'positive',
    icon: Heart,
    color: 'pink'
  },
  { 
    label: 'Valeur estimée', 
    value: '45,200€', 
    change: '+5%', 
    changeType: 'positive',
    icon: DollarSign,
    color: 'green'
  },
];

const recentActivity = [
  { type: 'analysis', text: 'Portrait de lumière analysé', time: '2 min', icon: Activity },
  { type: 'view', text: '+156 vues sur Formes abstraites', time: '15 min', icon: Eye },
  { type: 'like', text: '+23 J\'aimes sur Nature morte', time: '1h', icon: Heart },
  { type: 'upload', text: 'Nouvelle œuvre uploadée', time: '3h', icon: Image },
];

const artworks = [
  { title: 'Portrait de lumière', views: 1205, likes: 234, status: 'analyzed' },
  { title: 'Formes abstraites', views: 892, likes: 189, status: 'analyzed' },
  { title: 'Nature morte', views: 1543, likes: 312, status: 'analyzed' },
  { title: 'Éclats de couleur', views: 678, likes: 156, status: 'pending' },
];

/**
 * Dashboard artiste avec stats et activité
 */
export function ArtistDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              <TextScramble text="Dashboard" delay={200} />
            </h1>
            <p className="text-white/60">
              Bienvenue, Marie. Voici vos statistiques.
            </p>
          </div>

          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${timeRange === range 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }
                `}
              >
                {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '3 mois'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Graphique (placeholder stylisé) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Évolution des vues</h3>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <TrendingUp size={16} />
                <span>+24%</span>
              </div>
            </div>

            {/* Graphique stylisé */}
            <div className="relative h-48 flex items-end gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-500/50 to-cyan-500/20 hover:from-cyan-500 hover:to-cyan-400 transition-colors cursor-pointer"
                />
              ))}
            </div>

            <div className="flex justify-between mt-4 text-xs text-white/40">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </motion.div>

          {/* Activité récente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08]"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Activité récente</h3>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0"
                    >
                      <Icon size={14} className="text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm truncate">{activity.text}</p>
                      <p className="text-white/40 text-xs">{activity.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Tableau des œuvres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Vos œuvres</h3>
            <MagneticButton className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white transition-colors">
              Voir tout
            </MagneticButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-sm font-medium text-white/60">Titre</th>
                  <th className="text-left py-3 text-sm font-medium text-white/60">Vues</th>
                  <th className="text-left py-3 text-sm font-medium text-white/60">J'aimes</th>
                  <th className="text-left py-3 text-sm font-medium text-white/60">Statut</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map((artwork, index) => (
                  <motion.tr
                    key={artwork.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 text-white font-medium">{artwork.title}</td>
                    <td className="py-4 text-white/60">{artwork.views.toLocaleString()}</td>
                    <td className="py-4 text-white/60">{artwork.likes}</td>
                    <td className="py-4">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${artwork.status === 'analyzed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-amber-500/20 text-amber-400'
                        }
                      `}>
                        {artwork.status === 'analyzed' ? 'Analysé' : 'En attente'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Carte de statistique individuelle
 */
function StatCard({ stat, index }) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
  const Icon = stat.icon;

  const colors = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
    pink: 'from-pink-500/20 to-pink-500/5 text-pink-400',
    green: 'from-green-500/20 to-green-500/5 text-green-400',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      className={`
        p-6 rounded-2xl bg-gradient-to-br ${colors[stat.color]}
        border border-white/[0.08] backdrop-blur-sm
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
        >
          <Icon size={20} />
        </div>
        <div className={`
          flex items-center gap-1 text-sm font-medium
          ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}
        `}>
          {stat.changeType === 'positive' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {stat.change}
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-1">
        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
      </div>
      <div className="text-sm text-white/60">{stat.label}</div>
    </motion.div>
  );
}

export default ArtistDashboard;
