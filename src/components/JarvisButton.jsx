import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import './JarvisButton.css';

/**
 * JarvisButton - Bouton avec effet néon ripple
 * 
 * Style: Néon cyberpunk avec ripple effect au clic
 * Couleurs: Cyan #00f0ff, Magenta #ff006e
 * Effets: Glow, ripple, hover animations
 */

const JarvisButton = ({
  children,
  variant = 'primary',
  size = 'md',
  glow = true,
  ripple = true,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  // Génère un ripple au clic
  const handleClick = useCallback((e) => {
    if (disabled || loading) return;

    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple = {
        id: Date.now(),
        x,
        y,
        size,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Supprime le ripple après animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }

    onClick?.(e);
  }, [disabled, loading, ripple, onClick]);

  // Classes CSS dynamiques
  const buttonClasses = [
    'jarvis-button',
    `jarvis-button--${variant}`,
    `jarvis-button--${size}`,
    glow && 'jarvis-button--glow',
    disabled && 'jarvis-button--disabled',
    loading && 'jarvis-button--loading',
    fullWidth && 'jarvis-button--full-width',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Effet de scanline interne */}
      <span className="jarvis-button__scanline" />
      
      {/* Bordure néon animée */}
      <span className="jarvis-button__border" />
      
      {/* Contenu du bouton */}
      <span className="jarvis-button__content">
        {loading && (
          <span className="jarvis-button__spinner">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="31.416"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </span>
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="jarvis-button__icon jarvis-button__icon--left">
            {icon}
          </span>
        )}
        
        <span className="jarvis-button__text">{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="jarvis-button__icon jarvis-button__icon--right">
            {icon}
          </span>
        )}
      </span>

      {/* Ripples */}
      {ripples.map((rippleItem) => (
        <span
          key={rippleItem.id}
          className="jarvis-button__ripple"
          style={{
            left: rippleItem.x,
            top: rippleItem.y,
            width: rippleItem.size,
            height: rippleItem.size,
          }}
        />
      ))}
    </button>
  );
};

JarvisButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  glow: PropTypes.bool,
  ripple: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default JarvisButton;
