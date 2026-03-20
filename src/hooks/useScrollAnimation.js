import { useEffect, useRef, useState } from 'react';

/**
 * Hook pour animer les éléments au scroll (scroll reveal)
 * @param {Object} options - Options de l'intersection observer
 * @returns {[React.RefObject, boolean]}
 */
export function useScrollAnimation(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
    ...options,
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (defaultOptions.triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!defaultOptions.triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold: defaultOptions.threshold,
        rootMargin: defaultOptions.rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [defaultOptions.threshold, defaultOptions.rootMargin, defaultOptions.triggerOnce]);

  return [ref, isVisible];
}

/**
 * Hook pour le parallax scroll
 * @param {number} speed - Vitesse du parallax (0.1 à 1)
 * @returns {[React.RefObject, number]}
 */
export function useParallax(speed = 0.5) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.innerHeight - rect.top;
      
      if (scrolled > 0 && rect.bottom > 0) {
        setOffset(scrolled * speed * 0.1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return [ref, offset];
}

/**
 * Hook pour tracker la progression du scroll
 * @returns {{progress: number, scrollY: number, direction: 'up' | 'down' | null}}
 */
export function useScrollProgress() {
  const [state, setState] = useState({
    progress: 0,
    scrollY: 0,
    direction: null,
  });
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      
      setState({
        progress: Math.min(Math.max(progress, 0), 1),
        scrollY,
        direction: scrollY > lastScrollY.current ? 'down' : 'up',
      });
      
      lastScrollY.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return state;
}
