import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const LoginRegister = () => {
  const { login, register, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

  // Input states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });

  // Validation States
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const validateForm = () => {
    const newErrors = {};

    // Email check
    if (formData.email) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (touched.email) {
      newErrors.email = 'Email address is required';
    }

    if (activeTab === 'register') {
      // Name check
      if (!formData.name && touched.name) {
        newErrors.name = 'Full name is required';
      } else if (formData.name && formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      // Student ID check
      if (!formData.studentId && touched.studentId) {
        newErrors.studentId = 'Student ID is required';
      } else if (formData.studentId && formData.studentId.trim().length < 4) {
        newErrors.studentId = 'Student ID must be at least 4 characters';
      }

      // Confirm Password check
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else if (!formData.confirmPassword && touched.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      }
    }

    // Password check
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      // Calculate Password Strength for Registration
      if (activeTab === 'register') {
        const pass = formData.password;
        let score = 0;
        if (pass.length >= 6) score++;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        let label = 'Weak';
        let color = 'var(--color-danger)';
        if (score >= 4) {
          label = 'Strong 🔥';
          color = 'var(--color-success)';
        } else if (score >= 2) {
          label = 'Medium ⚡';
          color = 'var(--color-warning)';
        }
        setPasswordStrength({ score, label, color });
      }
    } else if (touched.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Clear global context errors on tab switch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    clearError();
    setFormData({ name: '', email: '', studentId: '', password: '', confirmPassword: '' });
    setErrors({});
    setTouched({});
    setPasswordStrength({ score: 0, label: '', color: '' });
  };

  // Real-time validation trigger
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    validateForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all as touched to trigger any final validations
    const allTouched = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    setTouched(allTouched);

    validateForm();

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) return;

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        await register(formData.name, formData.email, formData.studentId, formData.password);
        navigate('/');
      }
    } catch (err) {
      console.error('Auth action failed:', err);
    }
  };

  const isFormValid = () => {
    if (activeTab === 'login') {
      return formData.email && formData.password && !errors.email && !errors.password;
    } else {
      return (
        formData.name &&
        formData.email &&
        formData.studentId &&
        formData.password &&
        formData.confirmPassword &&
        Object.keys(errors).length === 0
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '24px 0',
      }}
    >
      <GlassCard style={{ width: '100%', maxWidth: '480px', padding: '36px' }}>
        {/* Tab Selection Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '32px',
          }}
        >
          <button
            onClick={() => handleTabSwitch('login')}
            style={{
              padding: '12px',
              border: 'none',
              background: activeTab === 'login' ? 'var(--glass-bg)' : 'transparent',
              color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: '700',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              fontSize: '0.95rem',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabSwitch('register')}
            style={{
              padding: '12px',
              border: 'none',
              background: activeTab === 'register' ? 'var(--glass-bg)' : 'transparent',
              color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: '700',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              fontSize: '0.95rem',
            }}
          >
            Create Account
          </button>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
          {activeTab === 'login' ? 'Welcome back! 👋' : 'Join CampusTrace 🎒'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.92rem' }}>
          {activeTab === 'login' ? 'Enter credentials to access your lost & found feed.' : 'Register to submit claims and report items.'}
        </p>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: '600',
              marginBottom: '24px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`input-field ${touched.name && errors.name ? 'error' : touched.name && !errors.name ? 'success' : ''}`}
                placeholder="e.g. John Doe"
                required
              />
              {touched.name && errors.name && <span className="validation-msg error">{errors.name}</span>}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Campus Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field ${touched.email && errors.email ? 'error' : touched.email && !errors.email ? 'success' : ''}`}
              placeholder="e.g. student@campustrace.edu"
              required
            />
            {touched.email && errors.email && <span className="validation-msg error">{errors.email}</span>}
          </div>

          {activeTab === 'register' && (
            <div className="input-group">
              <label className="input-label">Student ID Number</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`input-field ${touched.studentId && errors.studentId ? 'error' : touched.studentId && !errors.studentId ? 'success' : ''}`}
                placeholder="e.g. STU-1002"
                required
              />
              {touched.studentId && errors.studentId && <span className="validation-msg error">{errors.studentId}</span>}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field ${touched.password && errors.password ? 'error' : touched.password && !errors.password ? 'success' : ''}`}
              placeholder="••••••••"
              required
            />
            {touched.password && errors.password && <span className="validation-msg error">{errors.password}</span>}

            {/* Password Strength Indicator for Registration */}
            {activeTab === 'register' && formData.password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Password Strength:</span>
                  <span style={{ fontWeight: '700', color: passwordStrength.color }}>{passwordStrength.label}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      background: passwordStrength.color,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {activeTab === 'register' && (
            <div className="input-group" style={{ marginBottom: '28px' }}>
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`input-field ${touched.confirmPassword && errors.confirmPassword ? 'error' : touched.confirmPassword && !errors.confirmPassword ? 'success' : ''}`}
                placeholder="••••••••"
                required
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <span className="validation-msg error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
            disabled={!isFormValid()}
          >
            {activeTab === 'login' ? 'Authenticate' : 'Complete Registration'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default LoginRegister;
