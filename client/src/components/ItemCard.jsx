import React from 'react';
import GlassCard from './GlassCard';

// Category-based dynamic visual svg placeholders for ultra-premium feel
const getCategorySvg = (category) => {
  const colorMap = {
    Electronics: '#8b5cf6',
    Documents: '#3b82f6',
    Clothing: '#ec4899',
    Accessories: '#14b8a6',
    'Books & Stationery': '#f59e0b',
    Keys: '#10b981',
    Bags: '#6366f1',
    'Sports Equipment': '#ef4444',
    Other: '#64748b'
  };
  const color = colorMap[category] || '#64748b';

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}05 100%)` }}>
      <circle cx="50" cy="50" r="25" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M40 50H60M50 40V60" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="20" y="20" width="60" height="60" rx="12" stroke={color} strokeWidth="1" opacity="0.3" />
    </svg>
  );
};

const ItemCard = ({ item, type = 'lost', onActionClick, currentUserId }) => {
  const isOwner = type === 'lost' ? item.ownerId === currentUserId : item.finderId === currentUserId;
  
  const formattedDate = new Date(item.dateLost || item.dateFound).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const imgUrl = item.image?.url || '';

  return (
    <GlassCard
      hoverEffect
      style={{
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Item Image or Premium Graphic Placeholder */}
      <div
        style={{
          width: '100%',
          height: '180px',
          overflow: 'hidden',
          position: 'relative',
          borderBottom: '1px solid var(--glass-border)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
        }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={item.itemName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'var(--transition-smooth)',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          getCategorySvg(item.category)
        )}

        {/* Dynamic Status Badges */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: '2' }}>
          <span className={`badge badge-${item.status}`}>
            {item.status}
          </span>
        </div>

        {/* Item Type Indicator Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: type === 'lost' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
            color: type === 'lost' ? 'var(--color-danger)' : 'var(--color-success)',
            padding: '3px 8px',
            fontSize: '0.68rem',
            fontWeight: '800',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {type}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <span
          style={{
            fontSize: '0.78rem',
            color: 'var(--accent-primary)',
            fontWeight: '700',
            textTransform: 'uppercase',
            marginBottom: '6px',
            letterSpacing: '0.5px'
          }}
        >
          {item.category}
        </span>
        
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '8px',
            lineHeight: '1.3',
          }}
        >
          {item.itemName}
        </h3>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
            height: '2.8rem'
          }}
        >
          {item.description}
        </p>

        {/* Metadata Grid */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: '1px solid var(--glass-border)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '0.8rem',
            color: 'var(--text-tertiary)',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
              📍 Location
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
              {item.location || item.foundLocation}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
              📅 Date
            </span>
            <span style={{ marginTop: '2px' }}>{formattedDate}</span>
          </div>
        </div>

        {/* Interactive Action Button */}
        {onActionClick && (
          <button
            className={`btn ${isOwner ? 'btn-secondary' : 'btn-primary'}`}
            style={{ width: '100%', padding: '10px' }}
            onClick={(e) => {
              e.stopPropagation();
              onActionClick(item);
            }}
            disabled={item.status !== 'active' && item.status !== 'available'}
          >
            {isOwner ? 'My Report' : type === 'lost' ? 'Matches My Found' : 'Claim This Item'}
          </button>
        )}
      </div>
    </GlassCard>
  );
};

export default ItemCard;
