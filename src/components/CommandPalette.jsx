import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CommandPalette.css';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const commands = [
    { id: 'home', label: 'Go to Home', shortcut: 'G H', icon: '⌂', category: 'Navigation' },
    { id: 'systems', label: 'System Overview', shortcut: 'G S', icon: '◈', category: 'Navigation' },
    { id: 'analytics', label: 'Analytics Dashboard', shortcut: 'G A', icon: '◉', category: 'Navigation' },
    { id: 'network', label: 'Network Status', shortcut: 'G N', icon: '◊', category: 'Navigation' },
    { id: 'settings', label: 'Settings', shortcut: 'G ,', icon: '◐', category: 'Navigation' },
    { id: 'ai-assist', label: 'AI Assistant', shortcut: '⌘ I', icon: '🤖', category: 'AI' },
    { id: 'predict', label: 'Run Predictions', shortcut: '⌘ P', icon: '◉', category: 'AI' },
    { id: 'train', label: 'Train Models', shortcut: '⌘ T', icon: '⚡', category: 'AI' },
    { id: 'dark-mode', label: 'Toggle Dark Mode', shortcut: '⌘ D', icon: '◐', category: 'Preferences' },
    { id: 'notifications', label: 'Show Notifications', shortcut: '⌘ N', icon: '◉', category: 'Preferences' },
    { id: 'fullscreen', label: 'Toggle Fullscreen', shortcut: 'F11', icon: '⛶', category: 'Preferences' },
    { id: 'logout', label: 'Logout', shortcut: '⌘ Q', icon: '→', category: 'System' },
    { id: 'restart', label: 'Restart System', shortcut: '⌘ R', icon: '↻', category: 'System' },
    { id: 'shutdown', label: 'Shutdown', shortcut: '⌘ ⌫', icon: '◉', category: 'System' },
  ];

  // Filter commands based on query
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Flatten for keyboard navigation
  const flatCommands = filteredCommands;

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < flatCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatCommands[selectedIndex]) {
          executeCommand(flatCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  }, [isOpen, flatCommands, selectedIndex, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Cmd+K shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // Open command palette
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  const executeCommand = (cmd) => {
    console.log('Executing:', cmd.label);
    onClose();
    setQuery('');
    
    // Add execution animation
    const toast = document.createElement('div');
    toast.className = 'command-toast';
    toast.innerHTML = `
      <span class="toast-icon">${cmd.icon}</span>
      <span class="toast-text">${cmd.label}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div 
        className="command-palette" 
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
      >
        {/* Header with animated border */}
        <div className="palette-header">
          <div className="palette-border-anim" />
          <div className="search-icon">⌘</div>
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="palette-hint">
            <span className="key-hint">↑↓</span>
            <span>navigate</span>
            <span className="key-hint">↵</span>
            <span>select</span>
            <span className="key-hint">esc</span>
            <span>close</span>
          </div>
        </div>

        {/* Results */}
        <div className="palette-results">
          {filteredCommands.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">◉</span>
              <p>No commands found</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="command-group">
                <div className="group-header">
                  <span className="group-line" />
                  <span className="group-label">{category}</span>
                  <span className="group-line" />
                </div>
                {cmds.map((cmd) => {
                  const globalIndex = flatCommands.findIndex(c => c.id === cmd.id);
                  const isSelected = globalIndex === selectedIndex;
                  
                  return (
                    <div
                      key={cmd.id}
                      className={`command-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <span className="command-icon">{cmd.icon}</span>
                      <span className="command-label">{cmd.label}</span>
                      <span className="command-shortcut">
                        {cmd.shortcut.split(' ').map((key, i) => (
                          <span key={i} className="shortcut-key">{key}</span>
                        ))}
                      </span>
                      
                      {/* Selection glow */}
                      {isSelected && <div className="selection-glow" />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Decorative footer */}
        <div className="palette-footer">
          <div className="footer-text">J.A.R.V.I.S. Command Interface v2.0</div>
          <div className="footer-anim">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
