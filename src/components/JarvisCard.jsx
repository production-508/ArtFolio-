import React from 'react';
import PropTypes from 'prop-types';
import './JarvisCard.css';

/**
 * JarvisCard - Carte avec effet glassmorphism et bordure gradient
 * 
 * Style: Glassmorphism avec bordure néon gradient
 * Effets: Glow, hover lift, gradient animé
 */

const JarvisCard = ({
  children,
  variant = 'default',
  glow = 'cyan',
  hover = true,
  padding = 'md',
  header = null,
  footer = null,
  className = '',
  style = {},
  ...props
}) => {
  const cardClasses = [
    'jarvis-card',
    `jarvis-card--${variant}`,
    `jarvis-card--${padding}`,
    glow && `jarvis-card--glow-${glow}`,
    hover && 'jarvis-card--hover',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} style={style} {...props}>
      {/* Couches d'arrière-plan pour effets */}
      <div className="jarvis-card__bg" />
      <div className="jarvis-card__glow" />
      <div className="jarvis-card__border" />
      
      {/* Contenu de la carte */}
      <div className="jarvis-card__content">
        {header && (
          <div className="jarvis-card__header">
            {typeof header === 'string' ? (
              <h3 className="jarvis-card__title">{header}</h3>
            ) : (
              header
            )}
          </div>
        )}
        
        <div className="jarvis-card__body">
          {children}
        </div>
        
        {footer && (
          <div className="jarvis-card__footer">
            {footer}
          </div>
        )}
      </div>
      
      {/* Effet de scanline */}
      <div className="jarvis-card__scanline" />
    </div>
  );
};

JarvisCard.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'flat']),
  glow: PropTypes.oneOf(['cyan', 'magenta', 'none']),
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  header: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default JarvisCard;
