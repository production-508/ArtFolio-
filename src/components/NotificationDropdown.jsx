import React, { useState, useEffect, useRef } from 'react';
import './NotificationDropdown.css';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'System Alert',
      message: 'CPU temperature exceeding normal parameters',
      time: '2 min ago',
      read: false,
      priority: 'high',
      icon: '⚠'
    },
    {
      id: 2,
      type: 'ai',
      title: 'AI Analysis Complete',
      message: 'Predictive model training finished with 98.7% accuracy',
      time: '15 min ago',
      read: false,
      priority: 'medium',
      icon: '🤖'
    },
    {
      id: 3,
      type: 'security',
      title: 'Security Update',
      message: 'New encryption protocols deployed successfully',
      time: '1 hour ago',
      read: true,
      priority: 'low',
      icon: '🔒'
    },
    {
      id: 4,
      type: 'network',
      title: 'Network Status',
      message: 'Connection established with satellite uplink',
      time: '3 hours ago',
      read: true,
      priority: 'medium',
      icon: '📡'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Backup Complete',
      message: 'Daily system backup finished successfully',
      time: '5 hours ago',
      read: true,
      priority: 'low',
      icon: '💾'
    }
  ]);

  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff006e';
      case 'medium': return '#00d4ff';
      case 'low': return '#00ff88';
      default: return '#888';
    }
  };

  const getTypeGlow = (type) => {
    switch (type) {
      case 'alert': return 'rgba(255, 0, 110, 0.3)';
      case 'ai': return 'rgba(131, 56, 236, 0.3)';
      case 'security': return 'rgba(0, 212, 255, 0.3)';
      case 'network': return 'rgba(0, 255, 136, 0.3)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      {/* Animated border */}
      <div className="notif-border-anim">
        <div className="border-line" />
      </div>

      {/* Header */}
      <div className="notif-header">
        <div className="header-title">
          <span className="title-icon">◉</span>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <button className="mark-all-btn" onClick={markAllRead}>
          Mark all read
        </button>
      </div>

      {/* Tabs */}
      <div className="notif-tabs">
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'alert', label: 'Alerts' },
          { id: 'ai', label: 'AI' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`notif-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="tab-count">{tab.count}</span>
            )}
            {activeTab === tab.id && <div className="tab-glow" />}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="notif-list">
        {filteredNotifications.length === 0 ? (
          <div className="notif-empty">
            <div className="empty-icon">◉</div>
            <p>No notifications</p>
            <span>You're all caught up</span>
          </div>
        ) : (
          filteredNotifications.map((notif, idx) => (
            <div
              key={notif.id}
              className={`notif-item ${notif.read ? 'read' : 'unread'}`}
              style={{ 
                animationDelay: `${idx * 0.05}s`,
                '--type-glow': getTypeGlow(notif.type)
              }}
              onClick={() => markAsRead(notif.id)}
            >
              {/* Priority indicator */}
              <div 
                className="priority-bar" 
                style={{ background: getPriorityColor(notif.priority) }}
              />
              
              {/* Icon */}
              <div 
                className="notif-icon"
                style={{ 
                  color: getPriorityColor(notif.priority),
                  textShadow: `0 0 10px ${getPriorityColor(notif.priority)}`
                }}
              >
                {notif.icon}
              </div>

              {/* Content */}
              <div className="notif-content">
                <div className="notif-title-row">
                  <span className="notif-title">{notif.title}</span>
                  <span className="notif-time">{notif.time}</span>
                </div>
                <p className="notif-message">{notif.message}</p>
              </div>

              {/* Actions */}
              <div className="notif-actions">
                {!notif.read && (
                  <div className="unread-dot" style={{ background: getPriorityColor(notif.priority) }} />
                )}
                <button 
                  className="delete-btn"
                  onClick={(e) => deleteNotification(notif.id, e)}
                >
                  ×
                </button>
              </div>

              {/* Hover glow */}
              <div className="notif-hover-glow" />
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="notif-footer">
        <div className="footer-status">
          <span className="status-dot" />
          <span>System Online</span>
        </div>
        <button className="view-all-btn">
          View All
          <span>→</span>
        </button>
      </div>

      {/* Corner decorations */}
      <div className="corner-decorator tl" />
      <div className="corner-decorator tr" />
      <div className="corner-decorator bl" />
      <div className="corner-decorator br" />
    </div>
  );
};

export default NotificationDropdown;
