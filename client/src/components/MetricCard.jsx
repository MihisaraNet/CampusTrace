import React from 'react';
import GlassCard from './GlassCard';

const MetricCard = ({ title, value, icon, accentColor = 'var(--accent-primary)' }) => {
  return (
    <GlassCard
      hoverEffect
      style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        position: 'relative',
      }}
    >
      {/* Visual Accent glow under the icon */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-md)',
          background: `rgba(${accentColor === 'var(--accent-primary)' ? '139, 92, 246' : '20, 184, 166'}, 0.12)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
          fontSize: '1.8rem',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '4px',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            lineHeight: '1',
          }}
        >
          {value}
        </span>
      </div>
    </GlassCard>
  );
};

export default MetricCard;
