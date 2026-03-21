import { motion } from 'framer-motion';
import JarvisCard from './JarvisCard';
import JarvisButton from './JarvisButton';

/**
 * Dashboard JARVIS — HUD interface with stats
 */
export default function JarvisDashboard() {
  // Mock data
  const stats = [
    { label: 'Ventes Totales', value: '€47,290', change: '+12%', positive: true },
    { label: 'Œuvres Vendues', value: '128', change: '+8%', positive: true },
    { label: 'Nouveaux Artistes', value: '24', change: '+15%', positive: true },
    { label: 'Visiteurs', value: '3,847', change: '-3%', positive: false },
  ];

  const recentSales = [
    { artwork: 'Éther Flottant', artist: 'Marie Dubois', price: '€2,400', time: '2m' },
    { artwork: 'Fragments', artist: 'Jean Pierre', price: '€1,800', time: '15m' },
    { artwork: 'Nature Morte No.7', artist: 'Sophie Martin', price: '€3,200', time: '1h' },
    { artwork: 'Blue Horizon', artist: 'Elena Vostrova', price: '€4,500', time: '2h' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-12 px-6">
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px)'
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 
            className="text-4xl text-cyan-400 mb-2"
            style={{ fontFamily: "'Orbitron', monospace", textShadow: '0 0 20px rgba(0,240,255,0.5)' }}
          >
            TABLEAU DE BORD
          </h1>
          <p className="text-white/40" style={{ fontFamily: "'Rajdhani', monospace" }}>
            SYS.01 // INTERFACE DE CONTRÔLE
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <JarvisCard label={stat.label}>
                <div className="flex items-end justify-between">
                  <span 
                    className="text-3xl text-white"
                    style={{ fontFamily: "'Orbitron', monospace" }}
                  >
                    {stat.value}
                  </span>
                  <span className={`text-sm ${stat.positive ? 'text-cyan-400' : 'text-pink-500'}`}
                        style={{ fontFamily: "'Rajdhani', monospace" }}>
                    {stat.change}
                  </span>
                </div>
              </JarvisCard>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Sales */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <JarvisCard label="Ventes Récentes">
              <div className="space-y-4">
                {recentSales.map((sale, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-cyan-400/10 last:border-0"
                  >
                    <div>
                      <p className="text-white font-medium">{sale.artwork}</p>
                      <p className="text-white/40 text-sm">{sale.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold"
                         style={{ fontFamily: "'Orbitron', monospace" }}>
                        {sale.price}
                      </p>
                      <p className="text-white/30 text-xs">{sale.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </JarvisCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <JarvisCard label="Actions Rapides">
              <div className="space-y-4">
                <JarvisButton variant="primary" className="w-full">
                  + Nouvelle Œuvre
                </JarvisButton>
                
                <JarvisButton className="w-full">
                  Gérer les Artistes
                </JarvisButton>
                
                <JarvisButton className="w-full">
                  Voir les Commandes
                </JarvisButton>
                
                <JarvisButton variant="ghost" className="w-full">
                  Rapports Analytics
                </JarvisButton>
              </div>
            </JarvisCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
