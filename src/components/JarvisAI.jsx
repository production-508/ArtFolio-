import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './JarvisAI.css';

/**
 * JARVIS AI Assistant pour ArtFolio
 * Assistant IA style futuriste avec voice simulation et visualisations
 */

const QUICK_ACTIONS = [
  { id: 'blue-abstract', label: 'Œuvres bleues abstraites', icon: '🎨' },
  { id: 'sculpture-price', label: 'Prix moyen sculptures', icon: '💰' },
  { id: 'new-week', label: 'Nouveautés de la semaine', icon: '✨' },
  { id: 'compare', label: 'Comparer deux œuvres', icon: '⚖️' },
];

const JARVIS_PHRASES = {
  greeting: "Bonjour. Je suis votre assistant ArtFolio.",
  thinking: "Analyse en cours...",
  processing: "PROCESSING...",
  results: (count) => `J'ai trouvé ${count} œuvres correspondant à vos critères.`,
};

const MOCK_RESPONSES = {
  'blue-abstract': {
    text: "J'ai trouvé 12 œuvres bleues abstraites. Les plus populaires incluent 'Océan Céleste' par Marie L., et 'Bleu Profond' par Jean D.",
    data: { count: 12, avgPrice: '€2,450', category: 'Abstrait' },
    images: [
      { id: 1, title: 'Océan Céleste', price: '€3,200', color: '#1e3a5f' },
      { id: 2, title: 'Bleu Profond', price: '€1,800', color: '#0f2744' },
      { id: 3, title: 'Azure Dreams', price: '€2,900', color: '#2e5c8a' },
    ],
  },
  'sculpture-price': {
    text: "Le prix moyen des sculptures sur ArtFolio est de €4,850. Les sculptures en bronze tendent vers €8,000+, tandis que les pièces contemporaines en résine moyennent €2,200.",
    data: { avgPrice: '€4,850', min: '€450', max: '€25,000' },
    chart: [
      { label: 'Bronze', value: 8000, color: '#cd7f32' },
      { label: 'Résine', value: 2200, color: '#2ec4b6' },
      { label: 'Bois', value: 3500, color: '#8b4513' },
      { label: 'Marbre', value: 12000, color: '#f0f0f0' },
    ],
  },
  'new-week': {
    text: "Cette semaine, 8 nouvelles œuvres ont été ajoutées. Découvrez la collection 'Horizons' de l'artiste émergent Alex Chen.",
    data: { newCount: 8, trending: 'Horizons by Alex Chen' },
    images: [
      { id: 4, title: 'Horizon I', price: '€1,500', color: '#e63946' },
      { id: 5, title: 'Horizon II', price: '€1,500', color: '#f4a261' },
    ],
  },
  'compare': {
    text: "Pour comparer deux œuvres, veuillez sélectionner les pièces que vous souhaitez analyser. Je peux comparer les prix, dimensions, techniques, et styles.",
    data: { ready: true },
  },
};

export default function JarvisAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle, listening, thinking, speaking
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typewriterTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Keyboard shortcut: Cmd+K or Ctrl+Space
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey && e.key === 'k') || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault();
        toggleWidget();
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Add initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessageWithTypewriter('jarvis', JARVIS_PHRASES.greeting);
    }
  }, [isOpen, messages.length]);

  // Cleanup typewriter on unmount
  useEffect(() => {
    return () => {
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
    };
  }, []);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  const handleDragStart = (e) => {
    if (e.target.closest('.jarvis-header')) {
      setIsDragging(true);
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setDragStart({
        x: clientX - position.x,
        y: clientY - position.y,
      });
    }
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove]);

  const addMessageWithTypewriter = (sender, text, data = null) => {
    const messageId = Date.now();
    setMessages(prev => [...prev, { id: messageId, sender, text: '', fullText: text, isTyping: true, data }]);
    setStatus('speaking');

    let charIndex = 0;
    const typeChar = () => {
      setMessages(prev => {
        const msg = prev.find(m => m.id === messageId);
        if (!msg || charIndex >= text.length) {
          setStatus('idle');
          return prev.map(m => m.id === messageId ? { ...m, isTyping: false, text: text } : m);
        }
        return prev.map(m => {
          if (m.id !== messageId) return m;
          const newText = text.slice(0, charIndex + 1);
          return { ...m, text: newText };
        });
      });

      charIndex++;
      if (charIndex < text.length) {
        const delay = Math.random() * 30 + 20; // Variable typing speed
        typewriterTimeoutRef.current = setTimeout(typeChar, delay);
      } else {
        setStatus('idle');
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isTyping: false } : m));
      }
    };

    typeChar();
  };

  const handleQuickAction = (actionId) => {
    const action = QUICK_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: action.label }]);
    setStatus('thinking');

    // Simulate processing delay
    setTimeout(() => {
      const response = MOCK_RESPONSES[actionId];
      if (response) {
        addMessageWithTypewriter('jarvis', response.text, response.data);
      }
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setStatus('thinking');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Je comprends. Laissez-moi chercher cette information pour vous...",
        "Intéressant. Analysons les données disponibles...",
        "Je peux vous aider avec cela. Voici ce que j'ai trouvé...",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessageWithTypewriter('jarvis', randomResponse);
    }, 1000);
  };

  const highlightKeywords = (text) => {
    const keywords = ['€', 'ArtFolio', 'œuvres', 'sculptures', 'abstrait', 'bleu', 'prix', 'comparer'];
    let highlighted = text;
    keywords.forEach(keyword => {
      highlighted = highlighted.replace(
        new RegExp(`(${keyword})`, 'gi'),
        '<span class="jarvis-keyword">$1</span>'
      );
    });
    return highlighted;
  };

  const renderVisualization = (data) => {
    if (!data) return null;

    if (data.chart) {
      const maxValue = Math.max(...data.chart.map(d => d.value));
      return (
        <div className="jarvis-chart">
          <div className="chart-title">Prix moyen par matériau</div>
          <div className="chart-bars">
            {data.chart.map((item, i) => (
              <div key={i} className="chart-bar-container">
                <motion.div
                  className="chart-bar"
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / maxValue) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  style={{ backgroundColor: item.color }}
                />
                <span className="chart-label">{item.label}</span>
                <span className="chart-value">€{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (data.images) {
      return (
        <div className="jarvis-images">
          {data.images.map((img, i) => (
            <motion.div
              key={img.id}
              className="jarvis-image-thumb"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="thumb-placeholder" style={{ backgroundColor: img.color }}>
                <span className="thumb-icon">🎨</span>
              </div>
              <div className="thumb-info">
                <span className="thumb-title">{img.title}</span>
                <span className="thumb-price">{img.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Floating Activation Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="jarvis-activator"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleWidget}
          >
            <div className="activator-glow" />
            <div className="activator-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <div className="activator-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            className={`jarvis-widget ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
              right: position.x === 0 ? '24px' : 'auto',
              bottom: position.y === 0 ? '24px' : 'auto',
              transform: position.x !== 0 || position.y !== 0 
                ? `translate(${position.x}px, ${position.y}px)` 
                : 'none',
            }}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header / Drag Handle */}
            <div 
              className="jarvis-header"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div className="jarvis-avatar">
                <div className={`avatar-ring ${status}`}>
                  <div className="avatar-core" />
                </div>
                {status === 'speaking' && (
                  <div className="waveform">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="waveform-bar"
                        animate={{
                          height: [4, 20, 4],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="jarvis-title">
                <span className="title-name">JARVIS</span>
                <span className={`title-status ${status}`}>
                  {status === 'idle' && 'En ligne'}
                  {status === 'listening' && 'Écoute...'}
                  {status === 'thinking' && 'Réflexion...'}
                  {status === 'speaking' && 'Parle...'}
                </span>
              </div>
              <div className="jarvis-controls">
                <button 
                  className="control-btn minimize"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? '□' : '−'}
                </button>
                <button 
                  className="control-btn close"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Chat Container */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  className="jarvis-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Messages */}
                  <div className="jarvis-messages">
                    {messages.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-icon">🤖</div>
                        <p>Comment puis-je vous aider aujourd'hui ?</p>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        className={`message ${msg.sender}`}
                        initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="message-bubble">
                          <div 
                            className="message-text"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightKeywords(msg.text) 
                            }}
                          />
                          {msg.isTyping && (
                            <span className="typing-cursor">_</span>
                          )}
                        </div>
                        {msg.data && renderVisualization(msg.data)}
                      </motion.div>
                    ))}

                    {status === 'thinking' && (
                      <motion.div
                        className="message jarvis thinking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="processing-indicator">
                          <span className="processing-text">PROCESSING</span>
                          <div className="processing-bar">
                            <motion.div
                              className="processing-progress"
                              animate={{ width: ['0%', '100%'] }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                ease: 'easeInOut' 
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Actions */}
                  {messages.length <= 2 && (
                    <div className="quick-actions">
                      {QUICK_ACTIONS.map((action) => (
                        <motion.button
                          key={action.id}
                          className="quick-action-chip"
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(46, 196, 182, 0.2)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickAction(action.id)}
                        >
                          <span className="chip-icon">{action.icon}</span>
                          <span className="chip-label">{action.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <form className="jarvis-input" onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder=""
                        disabled={status === 'thinking'}
                      />
                      {!inputValue && (
                        <span className="input-placeholder">
                          Tapez votre message<span className="blinking-cursor">_</span>
                        </span>
                      )}
                    </div>
                    <motion.button
                      type="submit"
                      className="send-btn"
                      disabled={!inputValue.trim() || status === 'thinking'}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9" />
                      </svg>
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcut hint */}
      <AnimatePresence>
        {isOpen && !isMinimized && messages.length < 2 && (
          <motion.div
            className="jarvis-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
          >
            <span>Presser </span>
            <kbd>Cmd</kbd>
            <span> + </span>
            <kbd>K</kbd>
            <span> pour basculer</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
