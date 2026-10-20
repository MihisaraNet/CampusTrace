const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, studentId, password } = req.body;

  if (!name || !email || !studentId || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanStudentId = studentId.trim();

  if (!EMAIL_REGEX.test(cleanEmail)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  // Check if email or studentId already exists
  const emailExists = await User.findOne({ email: cleanEmail });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const studentIdExists = await User.findOne({ studentId: cleanStudentId });
  if (studentIdExists) {
    res.status(400);
    throw new Error('Student ID already registered');
  }

  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    studentId: cleanStudentId,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.name) {
    user.name = req.body.name.trim();
  }

  if (req.body.studentId && req.body.studentId.trim() !== user.studentId) {
    const cleanStudentId = req.body.studentId.trim();
    const existing = await User.findOne({ studentId: cleanStudentId, _id: { $ne: user._id } });
    if (existing) {
      res.status(400);
      throw new Error('Student ID is already in use by another account');
    }
    user.studentId = cleanStudentId;
  }

  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    studentId: updatedUser.studentId,
    role: updatedUser.role,
    token: generateToken(updatedUser._id),
  });
});

module.exports = { registerUser, loginUser, getProfile, updateProfile };
