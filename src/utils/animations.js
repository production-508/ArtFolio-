/**
 * Utilitaires d'animation réutilisables
 */

import { gsap } from 'gsap';

// Variants Framer Motion communs
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

// Configuration de transition par défaut
export const defaultTransition = {
  duration: 0.5,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// Stagger container
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Variants de hover
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 },
};

export const hoverLift = {
  y: -5,
  transition: { duration: 0.2 },
};

export const tapScale = {
  scale: 0.95,
};

/**
 * Classe pour l'effet de text scramble (glitch/decrypt)
 */
export class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;
    
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `\u003cspan class="text-scramble-char"\u003e${char}\u003c/span\u003e`;
      } else {
        output += from;
      }
    }
    
    this.el.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

/**
 * Animation de compteur (nombre qui monte)
 * @param {HTMLElement} element - Élément à animer
 * @param {number} target - Valeur cible
 * @param {number} duration - Durée en ms
 */
export function animateCounter(element, target, duration = 1000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing easeOutQuart
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (target - start) * easeProgress);
    
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Effet magnetic pour les boutons
 * @param {MouseEvent} e - Événement souris
 * @param {HTMLElement} element - Élément à animer
 * @param {number} strength - Force de l'aimant (défaut: 0.3)
 */
export function magneticEffect(e, element, strength = 0.3) {
  const rect = element.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  
  gsap.to(element, {
    x: x * strength,
    y: y * strength,
    duration: 0.3,
    ease: 'power2.out',
  });
}

/**
 * Reset magnetic effect
 * @param {HTMLElement} element - Élément à réinitialiser
 */
export function resetMagnetic(element) {
  gsap.to(element, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'elastic.out(1, 0.3)',
  });
}

/**
 * Crée un effet de ripple sur un bouton
 * @param {MouseEvent} e - Événement click
 * @param {HTMLElement} button - Bouton cible
 */
export function createRipple(e, button) {
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();
  
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.classList.add('ripple');

  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}
