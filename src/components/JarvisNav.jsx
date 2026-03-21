import React, { useState, useEffect } from 'react';
import './JarvisNav.css';

const JarvisNav = ({ onCommandPalette, onNotifications }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'HOME', icon: '⌂' },
    { id: 'systems', label: 'SYSTEMS', icon: '◈' },
    { id: 'analytics', label: 'ANALYTICS', icon: '◉' },
    { id: 'network', label: 'NETWORK', icon: '◊' },
    { id: 'settings', label: 'SETTINGS', icon: '◐' },
  ];

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className={`jarvis-nav ${scrolled ? 'scrolled' : ''}`}>
        {/* Animated gradient border */}
        <div className="nav-border-gradient" />
        
        {/* Logo */}
        <div className="nav-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 40 40" className="logo-svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#0099ff" />
                  <stop offset="100%" stopColor="#6610f2" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="16" fill="none" stroke="url(#logoGrad)" strokeWidth="2" />
              <circle cx="20" cy="20" r="8" fill="url(#logoGrad)" opacity="0.8" />
              <path d="M20 4 L20 12 M20 28 L20 36 M4 20 L12 20 M28 20 L36 20" stroke="url(#logoGrad)" strokeWidth="2" />
            </svg>
          </div>
          <span className="logo-text">J.A.R.V.I.S.</span>
        </div>

        {/* Navigation Items */}
        <ul className="nav-items">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => setActiveItem(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              
              {/* Glow effect on hover */}
              {hoveredItem === item.id && (
                <div className="nav-item-glow" />
              )}
              
              {/* Active indicator */}
              {activeItem === item.id && (
                <div className="nav-active-line" />
              )}
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Search */}
          <button 
            className="nav-action-btn search-btn"
            onClick={onCommandPalette}
            title="Command Palette (Cmd+K)"
          >
            <span className="action-icon">⌘</span>
            <span className="action-shortcut">K</span>
          </button>

          {/* Notifications */}
          <button 
            className="nav-action-btn notif-btn"
            onClick={onNotifications}
          >
            <span className="action-icon">◉</span>
            <span className="notif-badge">3</span>
          </button>

          {/* User Avatar */}
          <div className="nav-user">
            <div className="user-avatar">
              <span>T</span>
              <div className="avatar-status online" />
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen Menu Overlay */}
      <FullscreenMenu 
        isOpen={activeItem === 'menu'} 
        onClose={() => setActiveItem('home')}
      />
    </>
  );
};

// Fullscreen Menu Component
const FullscreenMenu = ({ isOpen, onClose }) => {
  const menuSections = [
    {
      title: 'SYSTEM CONTROL',
      items: ['Dashboard', 'Monitoring', 'Diagnostics', 'Logs'],
      color: '#00d4ff'
    },
    {
      title: 'INTELLIGENCE',
      items: ['AI Models', 'Predictions', 'Analysis', 'Reports'],
      color: '#ff006e'
    },
    {
      title: 'SECURITY',
      items: ['Access Control', 'Encryption', 'Firewalls', 'Audit'],
      color: '#fb5607'
    },
    {
      title: 'AUTOMATION',
      items: ['Scripts', 'Schedules', 'Triggers', 'Workflows'],
      color: '#8338ec'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fullscreen-menu-overlay" onClick={onClose}>
      <div className="fullscreen-menu" onClick={(e) => e.stopPropagation()}>
        <button className="menu-close" onClick={onClose}>×</button>
        
        <div className="menu-grid">
          {menuSections.map((section, idx) => (
            <div 
              key={section.title}
              className="menu-section"
              style={{ '--section-color': section.color, animationDelay: `${idx * 0.1}s` }}
            >
              <h3 className="section-title">{section.title}</h3>
              <ul className="section-items">
                {section.items.map((item) => (
                  <li key={item} className="section-item">
                    <span className="item-bullet" style={{ background: section.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="menu-decorator top-left" />
        <div className="menu-decorator bottom-right" />
      </div>
    </div>
  );
};

export default JarvisNav;
