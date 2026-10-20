import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSecs = Math.floor((now - date) / 1000);

  if (diffInSecs < 60) return 'Just now';
  if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
  if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
  if (diffInSecs < 172800) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'item_lost_broadcast':
      return { icon: '📢', bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' };
    case 'item_found_broadcast':
      return { icon: '✨', bg: 'var(--color-info-bg)', color: 'var(--color-info)' };
    case 'claim_submitted':
      return { icon: '📋', bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' };
    case 'claim_approved':
      return { icon: '🎉', bg: 'var(--color-success-bg)', color: 'var(--color-success)' };
    case 'claim_rejected':
      return { icon: '❌', bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' };
    case 'item_matched':
      return { icon: '🔍', bg: 'var(--color-info-bg)', color: 'var(--accent-primary)' };
    case 'item_returned':
      return { icon: '✅', bg: 'var(--color-success-bg)', color: 'var(--color-success)' };
    default:
      return { icon: '🔔', bg: 'var(--bg-secondary)', color: 'var(--text-primary)' };
  }
};

const NotificationDropdown = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleItemClick = (item) => {
    if (!item.isRead) {
      markAsRead(item._id);
    }
    if (item.link) {
      navigate(item.link);
      onClose();
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="glass"
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: '0',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--glass-border)',
        backgroundColor: 'var(--glass-modal-bg)',
        boxShadow: 'var(--shadow-glow), 0 20px 40px rgba(0,0,0,0.3)',
        zIndex: 1000,
        animation: 'fadeInSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            Alerts & Notifications
          </h3>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px',
              }}
              title="Mark all as read"
            >
              Read all
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px',
              }}
              title="Clear all notifications"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--glass-border)',
          padding: '0 20px',
          background: 'rgba(0,0,0,0.02)',
        }}
      >
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 14px',
            border: 'none',
            background: 'transparent',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: activeTab === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'all' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          style={{
            padding: '10px 14px',
            border: 'none',
            background: 'transparent',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: activeTab === 'unread' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'unread' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Content List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '380px',
          padding: '8px 0',
        }}
      >
        {loading && notifications.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            Loading alerts...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>✨</span>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '600' }}>
              {activeTab === 'unread' ? 'No unread alerts' : 'No notifications yet'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {activeTab === 'unread'
                ? "You've read all your notifications."
                : "You'll receive alerts when items are reported or claimed."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const { icon, bg } = getNotificationIcon(item.type);
            return (
              <div
                key={item._id}
                onClick={() => handleItemClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--glass-border)',
                  backgroundColor: item.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.06)',
                  transition: 'var(--transition-fast)',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = item.isRead
                    ? 'transparent'
                    : 'rgba(99, 102, 241, 0.06)';
                }}
              >
                {/* Icon bubble */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: item.isRead ? '600' : '700',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      margin: '4px 0 0 0',
                      lineHeight: '1.35',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.message}
                  </p>
                </div>

                {/* Unread indicator dot & actions */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginLeft: '4px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {!item.isRead && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                      }}
                      title="Unread"
                    />
                  )}

                  <button
                    onClick={() => deleteNotification(item._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      padding: '2px',
                      opacity: 0.6,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                    title="Delete notification"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>
        {`
          @keyframes fadeInSlideDown {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationDropdown;
