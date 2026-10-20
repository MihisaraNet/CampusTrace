/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Toast alert system
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = 'info', link = null, duration = 6000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, message, type, link, timestamp: new Date() };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 simultaneous toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(
    async (unreadOnly = false) => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await api.getNotifications(unreadOnly, 1, 30);
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Quick unread count refresher
  const refreshUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getUnreadNotificationCount();
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      console.error('Failed to update unread count:', err);
    }
  }, [token]);

  // Mark single as read
  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const res = await api.markNotificationAsRead(id);
      if (typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      fetchNotifications();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await api.markAllNotificationsAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      fetchNotifications();
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const target = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await api.deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchNotifications();
    }
  };

  // Clear all
  const clearAll = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await api.clearAllNotifications();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      fetchNotifications();
    }
  };

  // Setup WebSocket connection
  useEffect(() => {
    if (!token || !user) {
      return;
    }

    // Initial REST load
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();

    const connectWebSocket = () => {
      // Calculate protocol and host
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // If dev server proxy or standalone
      const host = window.location.hostname;
      const port = window.location.port ? window.location.port : '';
      
      // In dev environment, if frontend is on 5173, backend is on 5000
      const isViteDev = window.location.port === '5173';
      const wsUrl = isViteDev
        ? `ws://localhost:5000/ws?token=${token}`
        : `${protocol}//${host}${port ? `:${port}` : ''}/ws?token=${token}`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          // Connected
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);

            if (parsed.type === 'notification' || parsed.type === 'broadcast_alert') {
              const item = parsed.data || {};

              // Add notification to top of list
              if (item._id) {
                setNotifications((prev) => [item, ...prev.filter((n) => n._id !== item._id)]);
              } else {
                // If broadcast without returned ID, fetch latest
                fetchNotifications();
              }

              setUnreadCount((prev) => prev + 1);

              // Determine toast type
              let toastType = 'info';
              if (item.type === 'claim_approved' || item.type === 'item_returned') toastType = 'success';
              else if (item.type === 'claim_rejected') toastType = 'danger';
              else if (item.type === 'item_lost_broadcast' || item.type === 'claim_submitted') toastType = 'warning';

              // Trigger popup Toast Alert
              showToast({
                title: item.title || 'Campus Alert',
                message: item.message || '',
                type: toastType,
                link: item.link || null,
              });
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        ws.onclose = (event) => {
          // Attempt reconnection if user is still logged in and wasn't intentional close
          if (token && event.code !== 1000) {
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, 4000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
      }
    };

    connectWebSocket();

    // Fallback polling every 45 seconds to guarantee synchronization
    const pollInterval = setInterval(() => {
      refreshUnreadCount();
    }, 45000);

    return () => {
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'User logged out or component unmounted');
        wsRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
    };
  }, [token, user, fetchNotifications, refreshUnreadCount, showToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        toasts,
        showToast,
        removeToast,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
