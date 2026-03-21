import { motion } from 'framer-motion';

/**
 * Button JARVIS — Néon ripple effect
 */
export default function JarvisButton({ 
  children, 
  variant = 'default', 
  size = 'md',
  onClick,
  disabled = false,
  className = ''
}) {
  const baseStyles = "relative font-tech uppercase tracking-widest overflow-hidden transition-all duration-300 ";
  
  const variants = {
    default: "bg-transparent border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]",
    primary: "bg-cyan-400 text-black font-bold hover:bg-white hover:shadow-[0_0_30px_rgba(0,240,255,0.8)]",
    danger: "bg-transparent border border-pink-500/50 text-pink-500 hover:bg-pink-500/10 hover:shadow-[0_0_20px_rgba(255,0,110,0.5)]",
    ghost: "bg-transparent text-white/60 hover:text-cyan-400 hover:bg-cyan-400/5"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{ fontFamily: "'Orbitron', monospace" }}
    >
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 overflow-hidden">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      </span>
      
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
