import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Composant Cursor personnalisé avec effet de traînée et expansion au hover
 * Inspiré des sites awwwards et des expériences immersives
 */
export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorVariant, setCursorVariant] = useState('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Détecter si on est sur un device tactile
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    setIsVisible(true);

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Détecter les éléments interactifs
    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        target.classList.contains('interactive');
      
      if (isInteractive) {
        setIsHovering(true);
        const variant = target.dataset.cursor || 'hover';
        setCursorVariant(variant);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
      setCursorVariant('default');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!isVisible) return null;

  const variants = {
    default: {
      width: 20,
      height: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      mixBlendMode: 'difference',
    },
    hover: {
      width: 60,
      height: 60,
      backgroundColor: 'rgba(6, 182, 212, 0.3)',
      mixBlendMode: 'normal',
    },
    link: {
      width: 80,
      height: 80,
      backgroundColor: 'rgba(236, 72, 153, 0.2)',
      mixBlendMode: 'normal',
    },
  };

  return (
    <>
      {/* Curseur principal */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        animate={{
          x: position.x - (isHovering ? 30 : 10),
          y: position.y - (isHovering ? 30 : 10),
          ...variants[cursorVariant],
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
        style={{
          boxShadow: isHovering 
            ? '0 0 30px rgba(6, 182, 212, 0.5)' 
            : '0 0 20px rgba(255, 255, 255, 0.3)',
        }}
      />
      
      {/* Point central */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] w-1.5 h-1.5 bg-white rounded-full"
        animate={{
          x: position.x - 3,
          y: position.y - 3,
          scale: isHovering ? 0 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 1000,
          damping: 28,
        }}
      />

      {/* Traînée */}
      <TrailDot position={position} delay={0.05} />
      <TrailDot position={position} delay={0.1} />
      <TrailDot position={position} delay={0.15} />
    </>
  );
}

function TrailDot({ position, delay }) {
  const [trailPos, setTrailPos] = useState(position);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTrailPos(position);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [position, delay]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9998] w-2 h-2 rounded-full bg-cyan-500/30"
      animate={{
        x: trailPos.x - 4,
        y: trailPos.y - 4,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
    />
  );
}

export default CustomCursor;
