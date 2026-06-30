import GlassCard from '../components/GlassCard';

const AboutApp = () => {
  return (
    <div className="container" style={{ maxWidth: '800px', paddingBottom: '60px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          About CampusTrace 🎒
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Connecting students, returning lost belongings, and fostering campus security and trust.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* App Description Card */}
        <GlassCard style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
            What is CampusTrace?
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.98rem', marginBottom: '20px' }}>
            CampusTrace is a modern, full-stack Lost & Found web application tailored for educational institutions. 
            Built using the **MERN** stack (MongoDB, Express, React, Node.js), it replaces slow, outdated bulletin boards 
            or unstructured chat groups with a sleek, real-time platform.
          </p>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Key Architecture & Features:
          </h3>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.95rem', paddingLeft: '20px', marginBottom: '0' }}>
            <li><strong>Report & Discover:</strong> Students can post lost items and finders can catalog found objects.</li>
            <li><strong>Security and JWT Verification:</strong> Secure logins protect campus student identities.</li>
            <li><strong>Admin Mediation Hub:</strong> Admin role monitors active claims, reviews proof of ownership, and manages returned assets.</li>
            <li><strong>Responsive Visual Design:</strong> Rich glassmorphism aesthetics, Outfit typography, custom scrollbars, and dynamic theme switching.</li>
          </ul>
        </GlassCard>

        {/* Developer Contact Card */}
        <GlassCard style={{ padding: '36px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Meet the Developer 👨‍💻
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Designed, developed, and maintained by <strong>Isula Mihisara</strong>.
          </p>

          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '24px', 
              flexWrap: 'wrap', 
              marginTop: '16px' 
            }}
          >
            {/* Email Link */}
            <a 
              href="mailto:isulamihisara@gmail.com" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'var(--transition-smooth)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              {/* Mail Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email
            </a>

            {/* LinkedIn Link */}
            <a 
              href="https://linkedin.com/in/isula-mihisara" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'var(--transition-smooth)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#0077b5';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              {/* LinkedIn Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0077b5' }}>
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </a>

            {/* GitHub Link */}
            <a 
              href="https://github.com/MihisaraNet" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'var(--transition-smooth)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--text-primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              {/* GitHub Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              GitHub
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AboutApp;
