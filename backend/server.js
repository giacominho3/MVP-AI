require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// =================================
// MIDDLEWARE SETUP
// =================================

// Security
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// =================================
// ROUTES
// =================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Business Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      ai: '/api/ai',
      auth: '/api/auth',
      integrations: '/api/integrations'
    }
  });
});

// Import routes after basic setup
try {
  const aiRoutes = require('./routes/ai');
  const authRoutes = require('./routes/auth');
  const integrationRoutes = require('./routes/integrations');
  
  // API Routes
  app.use('/api/ai', aiRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/integrations', integrationRoutes);
  
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.log('⚠️ Some routes failed to load:', error.message);
  console.log('🔄 Server will continue without those routes');
}

// =================================
// ERROR HANDLING
// =================================

// 404 handler - FIXED VERSION
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// =================================
// SERVER START
// =================================

const server = app.listen(PORT, () => {
  console.log('🚀 AI Business Assistant API running on port', PORT);
  console.log('📊 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 Health check: http://localhost:' + PORT + '/health');
  
  // Test Claude API connection after server starts
  setTimeout(() => {
    try {
      const claudeService = require('./services/claudeService');
      claudeService.testConnection()
        .then(() => console.log('✅ Claude API connection verified'))
        .catch(err => console.log('❌ Claude API connection failed:', err.message));
    } catch (error) {
      console.log('⚠️ Claude service not available yet:', error.message);
    }
  }, 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('💤 HTTP server closed');
  });
});

module.exports = app;