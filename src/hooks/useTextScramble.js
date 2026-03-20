import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour créer un effet de texte scramble (décryptage)
 * Inspiré de Kinetic Typography et les effets de hacking
 * 
 * @param {string} text - Le texte final à afficher
 * @param {object} options - Options de configuration
 * @returns {string} - Le texte en cours de scramble
 */
export function useTextScramble(text, options = {}) {
  const {
    duration = 1200,
    delay = 0,
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
    trigger = true,
  } = options;

  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);

  const scramble = useCallback(() => {
    if (!trigger || !text) return;
    
    setIsAnimating(true);
    const originalText = text;
    const length = originalText.length;
    const iterations = Math.ceil(duration / 50);
    let frame = 0;

    const interval = setInterval(() => {
      const progress = frame / iterations;
      const revealedCount = Math.floor(progress * length);
      
      let result = '';
      for (let i = 0; i < length; i++) {
        if (originalText[i] === ' ') {
          result += ' ';
        } else if (i < revealedCount) {
          result += originalText[i];
        } else {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      setDisplayText(result);
      frame++;
      
      if (frame > iterations) {
        clearInterval(interval);
        setDisplayText(originalText);
        setIsAnimating(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text, duration, chars, trigger]);

  useEffect(() => {
    if (delay > 0) {
      const timeout = setTimeout(scramble, delay);
      return () => clearTimeout(timeout);
    }
    return scramble();
  }, [scramble, delay]);

  return { displayText, isAnimating, scramble };
}

/**
 * Composant TextScramble pour usage direct
 */
export function TextScramble({ 
  children, 
  className = '', 
  as: Component = 'span',
  ...options 
}) {
  const { displayText } = useTextScramble(children, options);
  
  return (
    <Component className={className}>
      {displayText}
    </Component>
  );
}

export default useTextScramble;
