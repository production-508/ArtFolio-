import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

/**
 * Bouton avec effet magnetic (aimant) au hover
 * Le bouton attire le curseur quand on s'approche
 */
export function MagneticButton({ 
  children, 
  className = '', 
  strength = 0.3,
  onClick,
  ...props 
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    setPosition({
      x: distanceX * strength,
      y: distanceY * strength,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(position, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
      onUpdate: () => setPosition({ ...position }),
    });
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e) => {
    // Effet ripple
    const button = buttonRef.current;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();
    
    circle.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      width: ${diameter}px;
      height: ${diameter}px;
      left: ${e.clientX - rect.left - radius}px;
      top: ${e.clientY - rect.top - radius}px;
      pointer-events: none;
      transform: scale(0);
      animation: ripple-effect 0.6s ease-out;
    `;
    
    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
    
    onClick?.(e);
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <style>{`
        @keyframes ripple-effect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </motion.button>
  );
}

/**
 * Wrapper magnetic pour n'importe quel élément
 */
export function Magnetic({ 
  children, 
  strength = 0.3,
  className = '' 
}) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setPosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

export default MagneticButton;
