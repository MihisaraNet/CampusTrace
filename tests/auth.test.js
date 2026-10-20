const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_jwt_secret_key';

const mockUser = {
  _id: 'user123',
  name: 'John Doe',
  email: 'john@campus.edu',
  studentId: 'ST1001',
  role: 'student',
  matchPassword: jest.fn(),
  save: jest.fn(),
};

jest.mock('../models/User', () => {
  return {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };
});

const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration if fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John',
        email: 'john@campus.edu',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Please fill in all fields/);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John',
        email: 'invalid-email',
        studentId: 'ST1001',
        password: 'password123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/valid email/);
    });

    it('should reject password shorter than 6 characters', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John',
        email: 'john@campus.edu',
        studentId: 'ST1001',
        password: '123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/at least 6 characters/);
    });

    it('should register successfully with valid details', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'newuser123',
        name: 'John Doe',
        email: 'john@campus.edu',
        studentId: 'ST1001',
        role: 'student',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@campus.edu',
        studentId: 'ST1001',
        password: 'password123',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('john@campus.edu');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'wrong@campus.edu',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Invalid email or password/);
    });

    it('should login successfully with matching password', async () => {
      const testUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@campus.edu',
        studentId: 'ST1001',
        role: 'student',
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(testUser);

      const res = await request(app).post('/api/auth/login').send({
        email: 'john@campus.edu',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('john@campus.edu');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return profile for valid token', async () => {
      const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET);
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'user123',
          name: 'John Doe',
          email: 'john@campus.edu',
          studentId: 'ST1001',
          role: 'student',
        }),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('John Doe');
    });
  });
});
