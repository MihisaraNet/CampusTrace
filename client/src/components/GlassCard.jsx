import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div
      className={`glass ${hoverEffect ? 'glass-hover' : ''} ${className}`}
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
