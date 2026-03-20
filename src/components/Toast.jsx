import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Info } from 'lucide-react';

/**
 * @typedef {Object} Toast
 * @property {string} id - Identifiant unique
 * @property {string} message - Message à afficher
 * @property {'success' | 'error' | 'info' | 'warning'} type - Type de toast
 * @property {number} [duration] - Durée en ms (défaut: 3000)
 */

/**
 * Système de notification toast avec animations
 * @returns {{toast: function, ToastContainer: React.Component}}
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = ({ message, type = 'info', duration = 3000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed bottom-8 right-8 z-[600] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  return { toast, ToastContainer };
}

/**
 * Composant d'un toast individuel
 */
function ToastItem({ toast, onRemove }) {
  const icons = {
    success: Check,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  };

  const colors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    info: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.25, 0.46, 0.45, 0.94],
        layout: { duration: 0.2 }
      }}
      className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl backdrop-blur-xl border min-w-[300px] max-w-[400px] shadow-lg ${colors[toast.type]}`}
    >
      <Icon size={20} />
      <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
      <button
        onClick={onRemove}
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export default useToast;
