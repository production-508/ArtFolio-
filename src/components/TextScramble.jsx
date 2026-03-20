import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Effet de text scramble (glitch/decrypt) pour les titres
 * Le texte se "décrypte" lettre par lettre au chargement
 */
export function TextScramble({ 
  text, 
  className = '',
  delay = 0,
  duration = 2000,
  as: Component = 'span',
  trigger = true,
}) {
  const elementRef = useRef(null);
  const [displayText, setDisplayText] = useState('');
  const [hasAnimated, setHasAnimated] = useState(false);

  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    if (!trigger || hasAnimated) return;

    const timeout = setTimeout(() => {
      animateText();
      setHasAnimated(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [trigger, delay, text]);

  const animateText = () => {
    const finalText = text;
    const length = finalText.length;
    let frame = 0;
    const totalFrames = Math.floor(duration / 16); // ~60fps
    
    const animate = () => {
      let output = '';
      const progress = frame / totalFrames;
      
      for (let i = 0; i < length; i++) {
        // Décalage aléatoire pour chaque lettre
        const charDelay = (i / length) * 0.5;
        const charProgress = Math.max(0, Math.min(1, (progress - charDelay) / 0.5));
        
        if (charProgress >= 1 || finalText[i] === ' ') {
          output += finalText[i];
        } else if (charProgress > 0) {
          // Phase de "décryptage"
          const shouldShowReal = Math.random() < charProgress;
          output += shouldShowReal 
            ? finalText[i] 
            : `\u003cspan class="text-scramble-char opacity-50"\u003e${chars[Math.floor(Math.random() * chars.length)]}\u003c/span\u003e`;
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      setDisplayText(output);
      frame++;
      
      if (frame <= totalFrames) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  return (
    <Component
      ref={elementRef}
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: displayText || text }}
    />
  );
}

/**
 * Variante avec reveal au scroll
 */
export function TextScrambleReveal({ 
  text, 
  className = '',
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className}>
      <TextScramble text={text} trigger={isVisible} {...props} />
    </span>
  );
}

export default TextScramble;
