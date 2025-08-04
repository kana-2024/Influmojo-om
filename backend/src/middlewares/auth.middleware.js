const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * General JWT auth middleware (adds `req.user`)
 * Verifies JWT token and populates req.user with user information
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Bearer token required in Authorization header'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      user_type: decoded.user_type,
    };
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      message: 'Please log in again'
    });
  }
}

/**
 * Optional JWT auth middleware (doesn't fail if no token)
 * Useful for endpoints that can work with or without authentication
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without user info
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      user_type: decoded.user_type,
    };
    next();
  } catch (err) {
    console.error('Optional JWT verification failed:', err.message);
    next(); // Continue without user info
  }
}

module.exports = {
  authenticateJWT,
  optionalAuth
}; 