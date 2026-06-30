// Base API integration for CampusTrace backend

const API_BASE = '/api';

// Helper to get headers with token
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Custom request handler wrapper around native fetch
const request = async (url, options = {}) => {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...getHeaders(options.body instanceof FormData), ...options.headers }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${res.status}`);
  }

  return await res.json();
};

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Lost Items
  getLostItems: () => request('/lost'),
  getMyLostItems: () => request('/lost/my'),
  getLostItemById: (id) => request(`/lost/${id}`),
  createLostItem: (formData) => request('/lost', { method: 'POST', body: formData }),
  updateLostItem: (id, formData) => request(`/lost/${id}`, { method: 'PUT', body: formData }),
  deleteLostItem: (id) => request(`/lost/${id}`, { method: 'DELETE' }),

  // Found Items
  getFoundItems: () => request('/found'),
  getMyFoundItems: () => request('/found/my'),
  getFoundItemById: (id) => request(`/found/${id}`),
  createFoundItem: (formData) => request('/found', { method: 'POST', body: formData }),
  updateFoundItem: (id, formData) => request(`/found/${id}`, { method: 'PUT', body: formData }),
  deleteFoundItem: (id) => request(`/found/${id}`, { method: 'DELETE' }),

  // Claims
  submitClaim: (data) => request('/claims', { method: 'POST', body: JSON.stringify(data) }),
  getMyClaims: () => request('/claims/my'),
  getAllClaims: (status) => request(`/claims${status ? `?status=${status}` : ''}`),
  reviewClaim: (id, data) => request(`/claims/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
  markReturned: (id) => request(`/claims/${id}/return`, { method: 'PUT' }),
};
