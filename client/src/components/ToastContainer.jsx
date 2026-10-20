import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();
  const navigate = useNavigate();

  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🚨';
      case 'info':
      default:
        return '🔔';
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'var(--color-success)';
      case 'warning':
        return 'var(--color-warning)';
      case 'danger':
        return 'var(--color-danger)';
      case 'info':
      default:
        return 'var(--accent-primary)';
    }
  };

  return (
    <aside
      aria-label="Real-time alert notifications"
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            borderLeft: `4px solid ${getBorderColor(toast.type)}`,
            backgroundColor: 'var(--glass-modal-bg)',
            boxShadow: 'var(--shadow-glow)',
            animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: toast.link ? 'pointer' : 'default',
            transition: 'var(--transition-fast)',
          }}
          onClick={() => {
            if (toast.link) {
              navigate(toast.link);
              removeToast(toast.id);
            }
          }}
        >
          <span style={{ fontSize: '1.4rem', lineHeight: '1.2', flexShrink: 0 }}>
            {getToastIcon(toast.type)}
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {toast.title}
              </h4>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0 4px',
                  lineHeight: '1',
                }}
                aria-label="Close toast"
              >
                ✕
              </button>
            </div>

            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                marginBottom: 0,
                lineHeight: '1.4',
                wordBreak: 'break-word',
              }}
            >
              {toast.message}
            </p>

            {toast.link && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--accent-primary)',
                }}
              >
                Click to view details →
              </span>
            )}
          </div>
        </div>
      ))}

      <style>
        {`
          @keyframes toastSlideIn {
            from {
              opacity: 0;
              transform: translateX(100%) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
        `}
      </style>
    </aside>
  );
};

export default ToastContainer;
