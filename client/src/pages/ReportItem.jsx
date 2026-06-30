import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Clothing',
  'Accessories',
  'Books & Stationery',
  'Keys',
  'Bags',
  'Sports Equipment',
  'Other',
];

const ReportItem = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('lost'); // 'lost' or 'found'

  // Form input states
  const [form, setForm] = useState({
    itemName: '',
    category: CATEGORIES[0],
    description: '',
    location: '',
    date: '',
  });

  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');

  // Validation States
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Item name
    if (form.itemName) {
      if (form.itemName.trim().length < 3) {
        newErrors.itemName = 'Item name must be at least 3 characters';
      }
    } else if (touched.itemName) {
      newErrors.itemName = 'Item name is required';
    }

    // Description
    if (form.description) {
      if (form.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      }
    } else if (touched.description) {
      newErrors.description = 'Description is required';
    }

    // Location
    if (!form.location && touched.location) {
      newErrors.location = reportType === 'lost' ? 'Last seen location is required' : 'Found location is required';
    }

    // Date (MUST NOT be in the future!)
    if (form.date) {
      const selectedDate = new Date(form.date);
      const today = new Date();
      // Reset hours to compare dates only
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future 🚀';
      }
    } else if (touched.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
  };

  // Trigger form validations
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    validateForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, reportType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Image drag-n-drop and picker validation
  const handleImageFile = (file) => {
    setImageError('');
    if (!file) return;

    // Validate type (images only)
    if (!file.type.startsWith('image/')) {
      setImageError('Only image files are allowed');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError('Image file size must be less than 5MB 📂');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Touch all fields to confirm validations
    const allTouched = {};
    Object.keys(form).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);
    validateForm();

    if (Object.keys(errors).length > 0 || imageError) return;

    setSubmitting(true);
    setSubmitError('');

    // Prepare Multipart Form Data for upload
    const formData = new FormData();
    formData.append('itemName', form.itemName);
    formData.append('category', form.category);
    formData.append('description', form.description);
    
    if (reportType === 'lost') {
      formData.append('location', form.location);
      formData.append('dateLost', form.date);
    } else {
      formData.append('foundLocation', form.location);
      formData.append('dateFound', form.date);
    }

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (reportType === 'lost') {
        await api.createLostItem(formData);
      } else {
        await api.createFoundItem(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      form.itemName &&
      form.description &&
      form.location &&
      form.date &&
      Object.keys(errors).length === 0 &&
      !imageError
    );
  };

  // Max date attribute value helper (today in YYYY-MM-DD format)
  const getTodayString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="container" style={{ maxWidth: '680px', paddingBottom: '60px' }}>
      <GlassCard style={{ padding: '36px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
          Create New Report 📢
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.92rem' }}>
          Please provide accurate details to increase the chances of item matching and return.
        </p>

        {/* Form Type Selector Buttons */}
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
            type="button"
            onClick={() => setReportType('lost')}
            style={{
              padding: '12px',
              border: 'none',
              background: reportType === 'lost' ? 'var(--glass-bg)' : 'transparent',
              color: reportType === 'lost' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: '700',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              fontSize: '0.95rem',
            }}
          >
            🎒 I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setReportType('found')}
            style={{
              padding: '12px',
              border: 'none',
              background: reportType === 'found' ? 'var(--glass-bg)' : 'transparent',
              color: reportType === 'found' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: '700',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              fontSize: '0.95rem',
            }}
          >
            🔍 I Found Something
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px', animation: 'scaleUp 0.3s ease-out' }}>🎉</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-success)', marginBottom: '8px' }}>
              Report Successfully Created!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Your {reportType} item report has been published. Redirecting to Feed Dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {submitError && (
              <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '24px' }}>
                ⚠️ {submitError}
              </div>
            )}

            <div className="grid-2">
              {/* Item Name */}
              <div className="input-group">
                <label className="input-label">Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  value={form.itemName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`input-field ${touched.itemName && errors.itemName ? 'error' : touched.itemName && !errors.itemName ? 'success' : ''}`}
                  placeholder="e.g. Leather Wallet"
                  required
                />
                {touched.itemName && errors.itemName && <span className="validation-msg error">{errors.itemName}</span>}
              </div>

              {/* Category */}
              <div className="input-group">
                <label className="input-label">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="input-group">
              <label className="input-label">Detailed Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                onBlur={handleBlur}
                rows="4"
                className={`input-field ${touched.description && errors.description ? 'error' : touched.description && !errors.description ? 'success' : ''}`}
                placeholder="List keys, logos, contents, tags, size, color, brand to help others verify identity..."
                style={{ resize: 'none', height: '100px' }}
                required
              />
              {touched.description && errors.description && <span className="validation-msg error">{errors.description}</span>}
            </div>

            <div className="grid-2">
              {/* Location */}
              <div className="input-group">
                <label className="input-label">
                  {reportType === 'lost' ? 'Last Seen Location *' : 'Found Location *'}
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`input-field ${touched.location && errors.location ? 'error' : touched.location && !errors.location ? 'success' : ''}`}
                  placeholder="e.g. Library Room 2B, Cafeteria"
                  required
                />
                {touched.location && errors.location && <span className="validation-msg error">{errors.location}</span>}
              </div>

              {/* Date */}
              <div className="input-group">
                <label className="input-label">{reportType === 'lost' ? 'Date Lost *' : 'Date Found *'}</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  max={getTodayString()} // HTML5 future date blocker!
                  className={`input-field ${touched.date && errors.date ? 'error' : touched.date && !errors.date ? 'success' : ''}`}
                  required
                />
                {touched.date && errors.date && <span className="validation-msg error">{errors.date}</span>}
              </div>
            </div>

            {/* Premium Drag and Drop Image Uploader */}
            <div className="input-group" style={{ marginBottom: '32px' }}>
              <label className="input-label">Attach Item Image (Optional)</label>
              
              {imagePreview ? (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(239, 68, 68, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                      transition: 'var(--transition-fast)',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#ef4444')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)')}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  style={{
                    width: '100%',
                    height: '140px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px dashed var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
                  onClick={() => document.getElementById('imagePicker').click()}
                >
                  <span style={{ fontSize: '2rem', marginBottom: '8px' }}>📸</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Drag & drop item photo here, or <span style={{ color: 'var(--accent-primary)' }}>browse files</span>
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Images only, maximum limit 5MB
                  </span>
                  <input
                    type="file"
                    id="imagePicker"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
              {imageError && <span className="validation-msg error" style={{ marginTop: '8px' }}>{imageError}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
              disabled={submitting || !isFormValid()}
            >
              {submitting ? 'Uploading to Cloudinary...' : 'Publish Report'}
            </button>
          </form>
        )}
      </GlassCard>

      <style>
        {`
          @keyframes scaleUp {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default ReportItem;
