import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Orbes flottantes en arrière-plan pour effet spatial
 * Style Apple Vision Pro / spatial UI
 */
export function GradientOrbs({ 
  count = 3,
  colors = ['#2EC4B6', '#9B5DE5', '#F15BB5'],
  className = '' 
}) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <FloatingOrb 
          key={i} 
          color={colors[i % colors.length]}
          index={i}
          total={count}
        />
      ))}
    </div>
  );
}

/**
 * Orb individuelle avec animation flottante
 */
function FloatingOrb({ color, index, total }) {
  // Position initiale aléatoire mais répartie
  const initialX = 20 + (index * (60 / total)) + Math.random() * 10;
  const initialY = 20 + Math.random() * 60;

  return (
    <motion.div
      className="absolute rounded-full blur-[100px] opacity-20"
      style={{
        width: '40vw',
        height: '40vw',
        backgroundColor: color,
        left: `${initialX}%`,
        top: `${initialY}%`,
      }}
      animate={{
        x: [0, 50, -30, 0],
        y: [0, -30, 50, 0],
        scale: [1, 1.2, 0.9, 1],
      }}
      transition={{
        duration: 15 + index * 5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: index * 2,
      }}
    />
  );
}

/**
 * Version simplifiée pour les cartes/sections
 */
export function CardGlow({ color = '#2EC4B6', className = '' }) {
  return (
    <div 
      className={`absolute -inset-1 rounded-3xl blur-2xl opacity-20 -z-10 ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}

/**
 * Particules subtiles en arrière-plan
 */
export function ParticleField({ count = 20 }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </div>
  );
}

function Particle({ index }) {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const size = 2 + Math.random() * 4;
  const duration = 20 + Math.random() * 20;

  return (
    <motion.div
      className="absolute rounded-full bg-white/10"
      style={{
        width: size,
        height: size,
        left: `${randomX}%`,
        top: `${randomY}%`,
      }}
      animate={{
        y: [0, -100, 0],
        opacity: [0, 0.5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
        delay: index * 0.5,
      }}
    />
  );
}

export default GradientOrbs;
