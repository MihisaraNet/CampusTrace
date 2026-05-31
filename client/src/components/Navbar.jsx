import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="glass"
      style={{
        position: 'sticky',
        top: '0',
        zIndex: '100',
        padding: '16px 0',
        borderBottom: '1px solid var(--glass-border)',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        marginBottom: '32px',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo / Home link */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '1.25rem',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
            }}
          >
            CT
          </div>
          <span
            style={{
              fontWeight: '800',
              fontSize: '1.4rem',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            CampusTrace
          </span>
        </Link>

        {/* Navigation Middle Links */}
        {user && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link
              to="/"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: isActive('/') ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive('/') ? 'var(--bg-secondary)' : 'transparent',
                transition: 'var(--transition-fast)',
              }}
            >
              Feed Dashboard
            </Link>
            <Link
              to="/report"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: isActive('/report') ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive('/report') ? 'var(--bg-secondary)' : 'transparent',
                transition: 'var(--transition-fast)',
              }}
            >
              Report Item
            </Link>
            <Link
              to="/claims"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: isActive('/claims') ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive('/claims') ? 'var(--bg-secondary)' : 'transparent',
                transition: 'var(--transition-fast)',
              }}
            >
              My Claims
            </Link>

            {/* Admin link (Only rendered if admin) */}
            {user.role === 'admin' && (
              <Link
                to="/admin"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: isActive('/admin') ? 'var(--color-success)' : 'var(--text-secondary)',
                  background: isActive('/admin') ? 'var(--color-success-bg)' : 'transparent',
                  border: `1px dashed ${isActive('/admin') ? 'var(--color-success)' : 'transparent'}`,
                  transition: 'var(--transition-fast)',
                }}
              >
                🛡️ Admin Moderation
              </Link>
            )}
          </div>
        )}

        {/* Right side Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Custom Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              transition: 'var(--transition-smooth)',
              outline: 'none',
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {theme === 'light' ? (
              // Beautiful Moon Icon for Light Mode (encourages toggling to Dark Mode)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s' }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              // Beautiful Sun Icon for Dark Mode (encourages toggling to Light Mode)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 12s linear infinite' }}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* User Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--text-tertiary)' }}>
                  {user.studentId}
                </span>
              </div>
              
              {/* Simple elegant avatar */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  border: '2px solid var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/claims')}
                title="View claims & Profile"
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <button
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            location.pathname !== '/login' && (
              <Link to="/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px' }}>
                Login / Register
              </Link>
            )
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
