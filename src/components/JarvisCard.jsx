import { motion } from 'framer-motion';

/**
 * Card JARVIS — Glassmorphism avec border gradient animé
 */
export default function JarvisCard({ 
  children, 
  label,
  className = '',
  noGlow = false
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative bg-gradient-to-br from-cyan-500/5 to-pink-500/5
        backdrop-blur-xl border border-cyan-500/20
        p-6 overflow-hidden
        ${!noGlow && 'hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]'}
        transition-shadow duration-500
        ${className}
      `}
    >
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-none opacity-50">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 opacity-20 animate-pulse" />
      </div>
      
      {/* Label */}
      {label && (
        <div className="absolute -top-3 left-4 px-2 bg-[#0a0a0f]"
             style={{ fontFamily: "'Rajdhani', monospace" }}>
          <span className="text-xs text-cyan-400 uppercase tracking-[0.3em]">
            {label}
          </span>
        </div>
      )}
      
      {/* Corner HUD brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
