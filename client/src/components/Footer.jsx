import React from 'react';

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
      <div className="container">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          &copy; {new Date().getFullYear()} <strong>MihisaraNet</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
