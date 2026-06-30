import { useState, useEffect } from 'react';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';

const AdminDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive moderation state
  const [reviews, setReviews] = useState({}); // Stores admin comments per claim ID
  const [actionError, setActionError] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  const fetchAllClaims = async () => {
    try {
      const data = await api.getAllClaims();
      // Response format from controller is { claims, total, page, pages }
      setClaims(data.claims || data);
    } catch (err) {
      console.error('Error fetching admin claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllClaims();
  }, []);

  const handleCommentChange = (claimId, text) => {
    setReviews((prev) => ({ ...prev, [claimId]: text }));
  };

  const handleReview = async (claimId, status) => {
    setActionError(null);
    setActionSuccessMsg(null);
    const comment = reviews[claimId] || '';

    if (status === 'rejected' && !comment.trim()) {
      setActionError('Please provide a reason comments when rejecting a claim request.');
      return;
    }

    try {
      await api.reviewClaim(claimId, {
        status: status,
        adminResponse: comment,
      });

      setActionSuccessMsg(`Claim successfully ${status}!`);
      
      // Update state locally
      setClaims((prev) =>
        prev.map((c) =>
          c._id === claimId
            ? { ...c, status: status, adminResponse: comment, reviewedAt: new Date().toISOString() }
            : c
        )
      );

      // Clear review comment
      setReviews((prev) => ({ ...prev, [claimId]: '' }));
    } catch (err) {
      setActionError(err.message || 'Moderation action failed');
    }
  };

  const handleMarkReturned = async (claimId) => {
    setActionError(null);
    setActionSuccessMsg(null);

    try {
      await api.markReturned(claimId);
      setActionSuccessMsg('Item marked as officially returned to owner successfully! 🎒');
      
      // Update item status locally in claim
      setClaims((prev) =>
        prev.map((c) =>
          c._id === claimId && c.itemId
            ? { ...c, itemId: { ...c.itemId, status: 'returned' } }
            : c
        )
      );
    } catch (err) {
      setActionError(err.message || 'Failed to register return');
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          🛡️ Admin Moderation Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Verify proof of ownership, review submissions, and manage returned items.
        </p>
      </div>

      {actionError && (
        <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '24px' }}>
          ⚠️ {actionError}
        </div>
      )}

      {actionSuccessMsg && (
        <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '24px' }}>
          🎉 {actionSuccessMsg}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--glass-border)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Fetching moderation requests...</p>
        </div>
      ) : claims.length === 0 ? (
        <GlassCard style={{ padding: '48px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🛡️</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            No claims to review
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            Excellent! There are currently no pending ownership verification requests registered on CampusTrace.
          </p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {claims.map((claim) => (
            <GlassCard
              key={claim._id}
              style={{
                padding: '28px',
                borderLeft: claim.status === 'pending' ? '4px solid var(--color-warning)' : claim.status === 'approved' ? '4px solid var(--color-success)' : '4px solid var(--color-danger)',
              }}
            >
              {/* Header Information */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderBottom: '1px solid var(--glass-border)',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Claim ID: {claim._id.slice(-6).toUpperCase()} • Item Type: {claim.itemType}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {claim.itemId?.itemName || 'Unknown Item'}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={`badge badge-${claim.status}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                    {claim.status}
                  </span>
                  <span className={`badge badge-${claim.itemId?.status || 'unknown'}`}>
                    Item Status: {claim.itemId?.status || 'unknown'}
                  </span>
                </div>
              </div>

              {/* Claimant and Item details layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginBottom: '24px' }}>
                {/* Column 1: Proof details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Claimant Details Card */}
                  <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      👤 Claimant Identity
                    </h4>
                    <div style={{ fontSize: '0.88rem', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Name:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{claim.userId?.name}</strong>
                      <span style={{ color: 'var(--text-tertiary)' }}>Student ID:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{claim.userId?.studentId}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>Email:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{claim.userId?.email}</span>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      📝 Proof of Ownership Reason
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      "{claim.claimReason}"
                    </p>
                  </div>

                  {claim.proofDetails && (
                    <div>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        🔍 Additional Markings / Serials
                      </h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                        {claim.proofDetails}
                      </span>
                    </div>
                  )}
                </div>

                {/* Column 2: Item Metadata & Review Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Item Summary Box */}
                  <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {claim.itemId?.image?.url && (
                      <img src={claim.itemId.image.url} alt={claim.itemId.itemName} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <div style={{ fontSize: '0.82rem' }}>
                      <h4 style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Item Details</h4>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Category: {claim.itemId?.category}</p>
                      <p style={{ color: 'var(--text-tertiary)' }}>Submitted on: {new Date(claim.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Moderation Controls */}
                  {claim.status === 'pending' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="input-group" style={{ marginBottom: '8px' }}>
                        <label className="input-label" style={{ fontSize: '0.78rem', fontWeight: '700' }}>
                          Review Feedback / Comments *
                        </label>
                        <textarea
                          placeholder="e.g. Verified. Please visit the Admin Office Block C room 12 to collect your item."
                          value={reviews[claim._id] || ''}
                          onChange={(e) => handleCommentChange(claim._id, e.target.value)}
                          rows="2"
                          className="input-field"
                          style={{ resize: 'none', height: '65px', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ flex: '1', padding: '10px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          onClick={() => handleReview(claim._id, 'rejected')}
                        >
                          Reject Claim ❌
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ flex: '1.5', padding: '10px', background: 'var(--color-success)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                          onClick={() => handleReview(claim._id, 'approved')}
                        >
                          Approve Claim ✅
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                        Admin Response Registered
                      </span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                        "{claim.adminResponse || 'No details registered.'}"
                      </p>

                      {/* Officially Hand Back control (If approved, and item is not yet returned) */}
                      {claim.status === 'approved' && claim.itemId?.status !== 'returned' && (
                        <button
                          className="btn btn-primary"
                          style={{ marginTop: '8px', width: '100%', padding: '10px', background: 'var(--accent-gradient)' }}
                          onClick={() => handleMarkReturned(claim._id)}
                        >
                          🎒 Officially Mark as Handed Back
                        </button>
                      )}

                      {claim.itemId?.status === 'returned' && (
                        <div style={{ marginTop: '8px', padding: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '0.78rem', fontWeight: '700', borderRadius: '6px', textAlign: 'center' }}>
                          🎉 Item Officially Handed Back & Completed!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;
