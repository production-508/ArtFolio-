import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Input JARVIS — Underline néon avec focus animation
 */
export default function JarvisInput({ 
  placeholder = '',
  value,
  onChange,
  type = 'text',
  label,
  className = ''
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          className="block mb-2 text-xs uppercase tracking-[0.2em] text-white/50"
          style={{ fontFamily: "'Rajdhani', monospace" }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="
            w-full bg-transparent border-b border-cyan-400/30
            text-white py-3 px-0 outline-none
            placeholder:text-white/30
            transition-colors duration-300
          "
          style={{ fontFamily: "'Rajdhani', monospace" }}
        />
        
        {/* Animated underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 origin-left"
          style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.8)' }}
        />
        
        {/* Blinking cursor simulation when focused */}
        {isFocused && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-5 bg-cyan-400"
          />
        )}
      </div>
    </div>
  );
}
