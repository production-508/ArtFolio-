import { useState, useEffect } from 'react';

/**
 * Hook pour tracker la position de la souris
 * Utilisé pour les effets magnetic et parallax
 * @returns {{x: number, y: number, normalizedX: number, normalizedY: number}}
 */
export function useMousePosition() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      setPosition({
        x: clientX,
        y: clientY,
        normalizedX: (clientX / innerWidth) * 2 - 1, // -1 à 1
        normalizedY: (clientY / innerHeight) * 2 - 1, // -1 à 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return position;
}

/**
 * Hook pour tracker la position relative à un élément
 * @param {React.RefObject} ref - Référence de l'élément
 * @returns {{x: number, y: number, isInside: boolean}}
 */
export function useRelativeMousePosition(ref) {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    isInside: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPosition({
        x: x - rect.width / 2, // Centre comme origine
        y: y - rect.height / 2,
        isInside: 
          x >= 0 && x <= rect.width && y >= 0 && y <= rect.height,
      });
    };

    const handleMouseLeave = () => {
      setPosition(prev => ({ ...prev, isInside: false }));
    };

    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);

  return position;
}
