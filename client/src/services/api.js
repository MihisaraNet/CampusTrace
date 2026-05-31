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

// Fallback Mock Database in LocalStorage if backend fails
const mockDb = {
  getUsers: () => JSON.parse(localStorage.getItem('mock_users') || '[]'),
  saveUsers: (users) => localStorage.setItem('mock_users', JSON.stringify(users)),
  getItems: (type) => JSON.parse(localStorage.getItem(`mock_${type}`) || '[]'),
  saveItems: (type, items) => localStorage.setItem(`mock_${type}`, JSON.stringify(items)),
  getClaims: () => JSON.parse(localStorage.getItem('mock_claims') || '[]'),
  saveClaims: (claims) => localStorage.setItem('mock_claims', JSON.stringify(claims)),
};

// Seed initial mock data if empty
if (mockDb.getUsers().length === 0) {
  mockDb.saveUsers([
    { _id: 'admin-1', name: 'Campus Admin', email: 'admin@campustrace.edu', studentId: 'ADM-001', role: 'admin', avatar: '' },
    { _id: 'student-1', name: 'John Doe', email: 'john@campustrace.edu', studentId: 'STU-101', role: 'student', avatar: '' }
  ]);
  mockDb.saveItems('lost', [
    { _id: 'lost-1', itemName: 'iPhone 15 Pro Max', category: 'Electronics', description: 'Titanium Blue, clear case, lockscreen is a dog photo.', location: 'Library 2nd Floor Study Room', dateLost: '2026-05-30', status: 'active', ownerId: 'student-1', createdAt: '2026-05-30T10:00:00Z' },
    { _id: 'lost-2', itemName: 'Student Identification Card', category: 'Documents', description: 'Name on card is John Doe, ID number STU-101.', location: 'Main Cafeteria', dateLost: '2026-05-31', status: 'active', ownerId: 'student-1', createdAt: '2026-05-31T12:00:00Z' }
  ]);
  mockDb.saveItems('found', [
    { _id: 'found-1', itemName: 'Sony WH-1000XM4 Headphones', category: 'Electronics', description: 'Black color, active noise cancelling, found in black zippered case.', foundLocation: 'Gymnasium benches', dateFound: '2026-05-31', status: 'available', finderId: 'admin-1', createdAt: '2026-05-31T14:30:00Z' },
    { _id: 'found-2', itemName: 'Leather Keyholder', category: 'Keys', description: 'Contains 3 brass keys and a blue plastic tag.', foundLocation: 'Science Block B Corridor', dateFound: '2026-05-30', status: 'available', finderId: 'student-1', createdAt: '2026-05-30T09:15:00Z' }
  ]);
  mockDb.saveClaims([
    { _id: 'claim-1', itemId: 'found-1', itemType: 'FoundItem', userId: 'student-1', claimReason: 'I left my black Sony headphones on the gym bench after my basketball practice on Sunday afternoon.', proofDetails: 'The headphones have a tiny scratch on the left ear cup, and they automatically pair with "John\'s iPhone".', studentIdProvided: 'STU-101', status: 'pending', createdAt: '2026-05-31T16:00:00Z' }
  ]);
}

// Global flag to track backend availability
let backendOffline = false;

// Custom robust request handler that fails over to Mock Database on connection error
const request = async (url, options = {}) => {
  if (backendOffline) {
    return handleMock(url, options);
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: { ...getHeaders(options.body instanceof FormData), ...options.headers }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    // If backend isn't running or MongoDB isn't connected, fail over to mock DB
    console.warn(`Backend connection failed for ${url}. Switching to client-side Mock DB. Error:`, err);
    backendOffline = true;
    return handleMock(url, options);
  }
};

// Handlers for Mock DB mimicking the backend API
const handleMock = async (url, options) => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  const method = options.method || 'GET';
  const body = options.body ? (options.body instanceof FormData ? null : JSON.parse(options.body)) : null;

  // ─── AUTHENTICATION MOCKS ──────────────────────────────────────────
  if (url === '/auth/register' && method === 'POST') {
    const users = mockDb.getUsers();
    if (users.find(u => u.email === body.email)) throw new Error('Email already registered');
    if (users.find(u => u.studentId === body.studentId)) throw new Error('Student ID already registered');
    
    const newUser = {
      _id: 'user_' + Date.now(),
      name: body.name,
      email: body.email,
      studentId: body.studentId,
      role: 'student',
      avatar: ''
    };
    users.push(newUser);
    mockDb.saveUsers(users);
    return { ...newUser, token: `mock_jwt_token_${newUser._id}` };
  }

  if (url === '/auth/login' && method === 'POST') {
    const users = mockDb.getUsers();
    // Simple mock password acceptance (any password works)
    const user = users.find(u => u.email === body.email);
    if (!user) throw new Error('Invalid email or password');
    return { ...user, token: `mock_jwt_token_${user._id}` };
  }

  if (url === '/auth/me' && method === 'GET') {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authorized, no token provided');
    const userId = token.replace('mock_jwt_token_', '');
    const user = mockDb.getUsers().find(u => u._id === userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  if (url === '/auth/me' && method === 'PUT') {
    const token = localStorage.getItem('token');
    const userId = token.replace('mock_jwt_token_', '');
    const users = mockDb.getUsers();
    const idx = users.findIndex(u => u._id === userId);
    if (idx === -1) throw new Error('User not found');
    
    users[idx].name = body.name || users[idx].name;
    users[idx].studentId = body.studentId || users[idx].studentId;
    mockDb.saveUsers(users);
    return users[idx];
  }

  // ─── LOST ITEMS MOCKS ──────────────────────────────────────────────
  if (url.startsWith('/lost') && method === 'GET') {
    const items = mockDb.getItems('lost');
    const token = localStorage.getItem('token');
    const userId = token ? token.replace('mock_jwt_token_', '') : null;
    
    if (url.includes('/my')) {
      return items.filter(i => i.ownerId === userId);
    }
    
    // Check specific ID
    const match = url.match(/\/lost\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const item = items.find(i => i._id === match[1]);
      if (!item) throw new Error('Item not found');
      return item;
    }
    
    return items;
  }

  if (url === '/lost' && method === 'POST') {
    const token = localStorage.getItem('token');
    const userId = token.replace('mock_jwt_token_', '');
    const items = mockDb.getItems('lost');
    
    let imageUrl = '';
    if (options.body instanceof FormData) {
      // Create object from form data for mocks
      const form = {};
      for (const [key, value] of options.body.entries()) {
        form[key] = value;
      }
      const newItem = {
        _id: 'lost_' + Date.now(),
        itemName: form.itemName,
        category: form.category,
        description: form.description,
        location: form.location,
        dateLost: form.dateLost,
        image: { url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800&auto=format&fit=crop&q=60' },
        status: 'active',
        ownerId: userId,
        createdAt: new Date().toISOString()
      };
      items.push(newItem);
      mockDb.saveItems('lost', items);
      return newItem;
    }
  }

  if (url.startsWith('/lost/') && (method === 'PUT' || method === 'DELETE')) {
    const items = mockDb.getItems('lost');
    const id = url.split('/').pop();
    const idx = items.findIndex(i => i._id === id);
    if (idx === -1) throw new Error('Item not found');
    
    if (method === 'DELETE') {
      items.splice(idx, 1);
      mockDb.saveItems('lost', items);
      return { success: true };
    }
    // PUT
    items[idx].itemName = body?.itemName || items[idx].itemName;
    items[idx].category = body?.category || items[idx].category;
    items[idx].description = body?.description || items[idx].description;
    items[idx].location = body?.location || items[idx].location;
    items[idx].dateLost = body?.dateLost || items[idx].dateLost;
    mockDb.saveItems('lost', items);
    return items[idx];
  }

  // ─── FOUND ITEMS MOCKS ─────────────────────────────────────────────
  if (url.startsWith('/found') && method === 'GET') {
    const items = mockDb.getItems('found');
    const token = localStorage.getItem('token');
    const userId = token ? token.replace('mock_jwt_token_', '') : null;
    
    if (url.includes('/my')) {
      return items.filter(i => i.finderId === userId);
    }
    
    const match = url.match(/\/found\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const item = items.find(i => i._id === match[1]);
      if (!item) throw new Error('Item not found');
      return item;
    }
    
    return items;
  }

  if (url === '/found' && method === 'POST') {
    const token = localStorage.getItem('token');
    const userId = token.replace('mock_jwt_token_', '');
    const items = mockDb.getItems('found');
    
    if (options.body instanceof FormData) {
      const form = {};
      for (const [key, value] of options.body.entries()) {
        form[key] = value;
      }
      const newItem = {
        _id: 'found_' + Date.now(),
        itemName: form.itemName,
        category: form.category,
        description: form.description,
        foundLocation: form.foundLocation,
        dateFound: form.dateFound,
        image: { url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=60' },
        status: 'available',
        finderId: userId,
        createdAt: new Date().toISOString()
      };
      items.push(newItem);
      mockDb.saveItems('found', items);
      return newItem;
    }
  }

  if (url.startsWith('/found/') && (method === 'PUT' || method === 'DELETE')) {
    const items = mockDb.getItems('found');
    const id = url.split('/').pop();
    const idx = items.findIndex(i => i._id === id);
    if (idx === -1) throw new Error('Item not found');
    
    if (method === 'DELETE') {
      items.splice(idx, 1);
      mockDb.saveItems('found', items);
      return { success: true };
    }
    // PUT
    items[idx].itemName = body?.itemName || items[idx].itemName;
    items[idx].category = body?.category || items[idx].category;
    items[idx].description = body?.description || items[idx].description;
    items[idx].foundLocation = body?.foundLocation || items[idx].foundLocation;
    items[idx].dateFound = body?.dateFound || items[idx].dateFound;
    mockDb.saveItems('found', items);
    return items[idx];
  }

  // ─── CLAIMS MOCKS ──────────────────────────────────────────────────
  if (url.startsWith('/claims') && method === 'GET') {
    const claims = mockDb.getClaims();
    const users = mockDb.getUsers();
    const lostItems = mockDb.getItems('lost');
    const foundItems = mockDb.getItems('found');
    const token = localStorage.getItem('token');
    const userId = token.replace('mock_jwt_token_', '');

    const formatClaim = (claim) => {
      const dbUser = users.find(u => u._id === claim.userId);
      const isLost = claim.itemType === 'LostItem';
      const dbItem = isLost 
        ? lostItems.find(i => i._id === claim.itemId) 
        : foundItems.find(i => i._id === claim.itemId);
      
      return {
        ...claim,
        userId: { _id: dbUser?._id, name: dbUser?.name, email: dbUser?.email, studentId: dbUser?.studentId },
        itemId: dbItem ? { _id: dbItem._id, itemName: dbItem.itemName, category: dbItem.category, image: dbItem.image, status: dbItem.status } : null
      };
    };

    if (url.includes('/my')) {
      return claims.filter(c => c.userId === userId).map(formatClaim);
    }

    // Admin get all
    return {
      claims: claims.map(formatClaim),
      total: claims.length,
      page: 1,
      pages: 1
    };
  }

  if (url === '/claims' && method === 'POST') {
    const token = localStorage.getItem('token');
    const userId = token.replace('mock_jwt_token_', '');
    const claims = mockDb.getClaims();

    // Prevent duplicate active claims
    const duplicate = claims.find(c => c.itemId === body.itemId && c.userId === userId && ['pending', 'approved'].includes(c.status));
    if (duplicate) throw new Error('You already have an active claim for this item');

    const newClaim = {
      _id: 'claim_' + Date.now(),
      itemId: body.itemId,
      itemType: body.itemType,
      userId: userId,
      claimReason: body.claimReason,
      proofDetails: body.proofDetails || '',
      studentIdProvided: body.studentIdProvided || '',
      status: 'pending',
      adminResponse: '',
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date().toISOString()
    };
    claims.push(newClaim);
    mockDb.saveClaims(claims);
    return newClaim;
  }

  if (url.match(/\/claims\/([a-zA-Z0-9_-]+)\/review/) && method === 'PUT') {
    const claims = mockDb.getClaims();
    const claimId = url.match(/\/claims\/([a-zA-Z0-9_-]+)\/review/)[1];
    const token = localStorage.getItem('token');
    const adminId = token.replace('mock_jwt_token_', '');

    const idx = claims.findIndex(c => c._id === claimId);
    if (idx === -1) throw new Error('Claim not found');

    claims[idx].status = body.status;
    claims[idx].adminResponse = body.adminResponse || '';
    claims[idx].reviewedBy = adminId;
    claims[idx].reviewedAt = new Date().toISOString();

    if (body.status === 'approved') {
      const isLost = claims[idx].itemType === 'LostItem';
      if (isLost) {
        const lost = mockDb.getItems('lost');
        const itemIdx = lost.findIndex(i => i._id === claims[idx].itemId);
        if (itemIdx !== -1) lost[itemIdx].status = 'matched';
        mockDb.saveItems('lost', lost);
      } else {
        const found = mockDb.getItems('found');
        const itemIdx = found.findIndex(i => i._id === claims[idx].itemId);
        if (itemIdx !== -1) found[itemIdx].status = 'claimed';
        mockDb.saveItems('found', found);
      }
    }

    mockDb.saveClaims(claims);
    return claims[idx];
  }

  if (url.match(/\/claims\/([a-zA-Z0-9_-]+)\/return/) && method === 'PUT') {
    const claims = mockDb.getClaims();
    const claimId = url.match(/\/claims\/([a-zA-Z0-9_-]+)\/return/)[1];
    
    const idx = claims.findIndex(c => c._id === claimId);
    if (idx === -1) throw new Error('Claim not found');

    const isLost = claims[idx].itemType === 'LostItem';
    if (isLost) {
      const lost = mockDb.getItems('lost');
      const itemIdx = lost.findIndex(i => i._id === claims[idx].itemId);
      if (itemIdx !== -1) lost[itemIdx].status = 'returned';
      mockDb.saveItems('lost', lost);
    } else {
      const found = mockDb.getItems('found');
      const itemIdx = found.findIndex(i => i._id === claims[idx].itemId);
      if (itemIdx !== -1) found[itemIdx].status = 'returned';
      mockDb.saveItems('found', found);
    }

    return { message: 'Item marked as returned successfully' };
  }

  throw new Error('Endpoint not found');
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
