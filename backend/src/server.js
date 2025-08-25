const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AWS = require('aws-sdk');

// Load environment variables from root .env
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
} catch (error) {
  console.log('dotenv not available, using default values');
}

const { PrismaClient } = require('./generated/client');

// Import routes
const { router: authRoutes } = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const ordersRoutes = require('./routes/orders');
const packagesRoutes = require('./routes/packages');
const crmRoutes = require('./routes/crm');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');

const app = express();
const prisma = new PrismaClient();

// Import AWS Parameter Store utility
const awsParameterStore = require('./utils/awsParameterStore');

// --- replace your PORT line with a placeholder (we'll set it after SSM load) ---
let PORT = 3002; // default; will be overridden after SSM load

// Build a dynamic CORS origin function
const allowedOriginsFromEnv = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const influmojoRegex = /^https:\/\/([a-z0-9-]+\.)?influmojo\.com$/i;

const corsOrigin = (origin, callback) => {
  const isProd = (process.env.NODE_ENV === 'production');

  // SSR / curl / server-to-server requests without Origin are OK
  if (!origin) return callback(null, true);

  if (isProd) {
    const inAllowlist = allowedOriginsFromEnv.includes(origin);
    if (inAllowlist || influmojoRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked in production: ${origin}`), false);
  }

  // Dev convenience
  const devAllow = new Set([
    'http://localhost:3000', 'http://127.0.0.1:3000',
    'http://localhost:3001', 'http://127.0.0.1:3001',
    'http://localhost:3002', 'http://127.0.0.1:3002',
    'http://localhost:8081', 'exp://localhost:8081'
  ]);
  if (devAllow.has(origin) || /ngrok/.test(origin)) {
    return callback(null, true);
  }
  return callback(new Error(`CORS blocked (dev): ${origin}`), false);
};

// Global BigInt and Date serializer for JSON responses
const originalJson = express.response.json;
express.response.json = function(data) {
  const serializeData = (obj) => {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    if (Array.isArray(obj)) {
      return obj.map(serializeData);
    }
    if (typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Handle JSON string fields like references
          if (key === 'references' && typeof obj[key] === 'string') {
            try {
              result[key] = JSON.parse(obj[key]);
            } catch (e) {
              console.warn('Failed to parse references JSON:', e);
              result[key] = obj[key];
            }
          } else {
            result[key] = serializeData(obj[key]);
          }
        }
      }
      return result;
    }
    return obj;
  };
  
  return originalJson.call(this, serializeData(data));
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 for development
  message: { error: 'Too many requests', message: 'Too many requests from this IP, please try again later.' }
});

// Trust proxy for ngrok
app.set('trust proxy', 1);

// Middleware (keep what you had, but swap cors(...) to use our origin fn)
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','ngrok-skip-browser-warning'],
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'OK',
    message: 'Influ Mojo API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    awsParameterStore: {
      enabled: process.env.NODE_ENV === 'production',
      status: 'operational'
    }
  };

  // Add AWS Parameter Store cache info if available
  if (process.env.NODE_ENV === 'production') {
    try {
      const cacheStats = awsParameterStore.getCacheStats();
      healthData.awsParameterStore.cache = cacheStats;
    } catch (error) {
      healthData.awsParameterStore.cache = { error: error.message };
    }
  }

  res.json(healthData);
});

// AWS Parameter Store management endpoint (admin only)
app.post('/api/admin/aws-params/clear-cache', (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    return res.status(400).json({ 
      error: 'Not available in development mode' 
    });
  }

  try {
    awsParameterStore.clearCache();
    res.json({ 
      message: 'AWS Parameter Store cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error.message 
    });
  }
});

app.get('/api/admin/aws-params/cache-stats', (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    return res.status(400).json({ 
      error: 'Not available in development mode' 
    });
  }

  try {
    const stats = awsParameterStore.getCacheStats();
    res.json({ 
      cache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get cache stats',
      message: error.message 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

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
  
  // Don't send error details in production
  const errorDetails = process.env.NODE_ENV === 'production' ? undefined : err.stack;
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: errorDetails
  });
});

// Database connection and server start
async function startServer() {
  try {
    // 1) Load env from SSM first (in prod), then read env vars
    await awsParameterStore.loadProductionEnvVars();

    // 2) Now pull env values (these can come from SSM or .env)
    PORT = parseInt(process.env.PORT || '3002', 10);

    const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
    if (!awsParameterStore.validateRequiredVars(requiredEnvVars)) {
      process.exit(1);
    }

    console.log('✅ Environment variables loaded successfully');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer(); 