import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="glass"
      style={{
        padding: '20px 0',
        borderTop: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        marginTop: '48px',
        textAlign: 'center',
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <Link
          to="/about"
          style={{
            color: 'var(--accent-primary)',
            fontSize: '0.9rem',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'var(--transition-fast)'
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
        >
          About CampusTrace
        </Link>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
          &copy; {new Date().getFullYear()} <strong>MihisaraNet</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
