const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_jwt_secret_key';

jest.mock('../services/notificationService', () => ({
  notifyClaimSubmitted: jest.fn().mockResolvedValue(),
  notifyClaimReviewed: jest.fn().mockResolvedValue(),
  notifyItemReturned: jest.fn().mockResolvedValue(),
}));

jest.mock('../models/FoundItem', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../models/LostItem', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../models/Claim', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../models/User', () => ({
  findById: jest.fn(),
}));

const FoundItem = require('../models/FoundItem');
const Claim = require('../models/Claim');
const User = require('../models/User');
const claimRoutes = require('../routes/claimRoutes');

const app = express();
app.use(express.json());
app.use('/api/claims', claimRoutes);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});

describe('Claim API Endpoints', () => {
  const studentToken = jwt.sign({ id: 'student1' }, process.env.JWT_SECRET);
  const adminToken = jwt.sign({ id: 'admin1' }, process.env.JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/claims should reject if item is already claimed or returned', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'student1', role: 'student' }),
    });
    FoundItem.findById.mockResolvedValue({
      _id: 'found123',
      status: 'claimed',
      finderId: 'student2',
    });

    const res = await request(app)
      .post('/api/claims')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        itemId: 'found123',
        itemType: 'FoundItem',
        claimReason: 'This is my calculator',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already been marked as claimed/);
  });

  it('POST /api/claims should reject if user claims their own found item report', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'student1', role: 'student' }),
    });
    FoundItem.findById.mockResolvedValue({
      _id: 'found123',
      status: 'available',
      finderId: 'student1', // Same user
    });

    const res = await request(app)
      .post('/api/claims')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        itemId: 'found123',
        itemType: 'FoundItem',
        claimReason: 'Testing self claim',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot submit a claim for an item you reported/);
  });

  it('POST /api/claims should succeed for a valid claim', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'student1',
        name: 'Alice',
        studentId: 'ST1002',
        role: 'student',
      }),
    });
    FoundItem.findById.mockResolvedValue({
      _id: 'found123',
      status: 'available',
      finderId: 'student2',
      itemName: 'Scientific Calculator',
    });
    Claim.findOne.mockResolvedValue(null);
    Claim.create.mockResolvedValue({
      _id: 'claim123',
      itemId: 'found123',
      itemType: 'FoundItem',
      userId: 'student1',
      claimReason: 'Left in Room 402 with blue sticker on back',
      status: 'pending',
    });

    const res = await request(app)
      .post('/api/claims')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        itemId: 'found123',
        itemType: 'FoundItem',
        claimReason: 'Left in Room 402 with blue sticker on back',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body._id).toBe('claim123');
  });

  it('GET /api/claims should block non-admin users', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'student1', role: 'student' }),
    });

    const res = await request(app)
      .get('/api/claims')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Access denied: Admin only/);
  });
});
