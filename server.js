require('dotenv').config();
const path = require('path');
const checkEnv = require('./config/envCheck');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { initWebSocket } = require('./services/socketService');

// Validate environment variables before connecting to the DB
checkEnv();

// Route imports
const authRoutes = require('./routes/authRoutes');
const lostRoutes = require('./routes/lostRoutes');
const foundRoutes = require('./routes/foundRoutes');
const claimRoutes = require('./routes/claimRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket real-time server
initWebSocket(server);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/lost', lostRoutes);
app.use('/api/found', foundRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusTrace API is running 🎒' });
});

// ─── 404 Handler for Unknown API Endpoints ─────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API endpoint not found: ${req.originalUrl}` });
});

// ─── Serve Frontend (Production) ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));

  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 CampusTrace server running on http://localhost:${PORT}`);
});
