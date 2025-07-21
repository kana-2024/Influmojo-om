const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// Load environment variables
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
} catch (error) {
  console.log('dotenv not available, using default values');
}

const { PrismaClient } = require('./generated/client');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Global BigInt serializer for JSON responses
const originalJson = express.response.json;
express.response.json = function(data) {
  const serializeBigInt = (obj) => {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(serializeBigInt);
    }
    if (typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = serializeBigInt(obj[key]);
        }
      }
      return result;
    }
    return obj;
  };
  
  return originalJson.call(this, serializeBigInt(data));
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests', message: 'Too many requests from this IP, please try again later.' }
});

// Trust proxy for ngrok
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://192.168.31.75:3000', 
    'http://192.168.31.57:3000',
    'http://192.168.31.57:3002',
    'exp://192.168.31.75:8081',
    'exp://192.168.31.57:8081',
    'http://localhost:8081',
    'exp://localhost:8081',
    'https://fair-legal-gar.ngrok-free.app',
    'exp://fair-legal-gar.ngrok-free.app',
    'file://'  // Allow file:// protocol for local HTML files
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Influ Mojo API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Catch-all 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found.'
  });
});

// Global error handler (ensure all errors are JSON)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: err.stack || undefined
  });
});

// Database connection and server start
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📱 Network access: http://192.168.31.57:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer(); 