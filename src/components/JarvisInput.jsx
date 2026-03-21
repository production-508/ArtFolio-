import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import './JarvisInput.css';

/**
 * JarvisInput - Input avec effet underline néon
 * 
 * Style: Underline néon animé, glassmorphism background
 * Effets: Glow au focus, label flottant, validation states
 */

const JarvisInput = forwardRef(({
  label,
  placeholder,
  type = 'text',
  variant = 'default',
  size = 'md',
  glow = 'cyan',
  error = null,
  helperText = null,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  required = false,
  className = '',
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  const inputClasses = [
    'jarvis-input',
    `jarvis-input--${variant}`,
    `jarvis-input--${size}`,
    `jarvis-input--glow-${glow}`,
    isFocused && 'jarvis-input--focused',
    hasValue && 'jarvis-input--has-value',
    error && 'jarvis-input--error',
    disabled && 'jarvis-input--disabled',
    icon && `jarvis-input--icon-${iconPosition}`,
    fullWidth && 'jarvis-input--full-width',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={inputClasses}>
      {/* Label flottant */}
      {label && (
        <label className="jarvis-input__label">
          {label}
          {required && <span className="jarvis-input__required"> *</span>}
        </label>
      )}
      
      {/* Container de l'input */}
      <div className="jarvis-input__container">
        {/* Icône */}
        {icon && (
          <span className={`jarvis-input__icon jarvis-input__icon--${iconPosition}`}>
            {icon}
          </span>
        )}
        
        {/* Champ input */}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className="jarvis-input__field"
          {...props}
        />
        
        {/* Underline néon */}
        <div className="jarvis-input__underline">
          <span className="jarvis-input__underline-bg" />
          <span className="jarvis-input__underline-glow" />
        </div>
        
        {/* Effet de focus */}
        <div className="jarvis-input__focus-effect" />
        
        {/* Indicateur de validation */}
        {error && (
          <span className="jarvis-input__error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
        )}
      </div>
      
      {/* Helper text ou message d'erreur */}
      {(helperText || error) && (
        <div className={`jarvis-input__helper ${error ? 'jarvis-input__helper--error' : ''}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

JarvisInput.displayName = 'JarvisInput';

JarvisInput.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url', 'search']),
  variant: PropTypes.oneOf(['default', 'filled', 'outlined', 'underlined']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  glow: PropTypes.oneOf(['cyan', 'magenta']),
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
};

export default JarvisInput;
