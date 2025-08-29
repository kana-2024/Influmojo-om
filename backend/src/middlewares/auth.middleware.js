const jwt = require('jsonwebtoken');

// Support JWT_SECRET rotation with fallback to previous secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_SECRET_PREVIOUS = process.env.JWT_SECRET_PREVIOUS;

/**
 * Strict Bearer token extraction (your recommendation)
 * Only accepts Authorization: Bearer <token> and rejects others fast
 */
function getBearer(req) {
  const h = req.headers.authorization || '';
  const [scheme, token] = h.split(' ');
  return (scheme === 'Bearer' && token) ? token : null;
}

/**
 * Enhanced JWT verification with secret rotation support
 * Handles clock skew (±60s) and tries multiple secrets
 */
function verifyJWT(token) {
  const candidates = [JWT_SECRET, JWT_SECRET_PREVIOUS].filter(Boolean);
  
  for (const secret of candidates) {
    try {
      // Handle clock skew (±60s) on verification
      const decoded = jwt.verify(token, secret, { 
        clockTolerance: 60 
      });
      return { success: true, decoded, secret };
    } catch (err) {
      // Continue to next secret if this one fails
      continue;
    }
  }
  
  return { success: false, error: 'All JWT secrets failed verification' };
}

/**
 * General JWT auth middleware (adds `req.user`)
 * Verifies JWT token and populates req.user with user information
 * Follows your 401 vs 403 semantics recommendation
 */
function authenticateJWT(req, res, next) {
  const token = getBearer(req);

  if (!token) {
    return res.status(401).json({ 
      error: 'unauthorized',
      message: 'Missing or invalid token'
    });
  }

  const result = verifyJWT(token);
  
  if (!result.success) {
    return res.status(401).json({ 
      error: 'unauthorized',
      message: 'Missing or invalid token'
    });
  }

  try {
    req.user = {
      id: result.decoded.userId || result.decoded.id, // Support both userId and id for backward compatibility
      email: result.decoded.email,
      user_type: result.decoded.user_type,
    };
    next();
  } catch (err) {
    console.error('JWT user population failed:', err.message);
    return res.status(401).json({ 
      error: 'unauthorized',
      message: 'Token processing failed'
    });
  }
}

/**
 * Optional JWT auth middleware (doesn't fail if no token)
 * Useful for endpoints that can work with or without authentication
 */
function optionalAuth(req, res, next) {
  const token = getBearer(req);

  if (!token) {
    return next(); // Continue without user info
  }

  const result = verifyJWT(token);
  
  if (!result.success) {
    return next(); // Continue without user info
  }

  try {
    req.user = {
      id: result.decoded.userId || result.decoded.id, // Support both userId and id for backward compatibility
      email: result.decoded.email,
      user_type: result.decoded.user_type,
    };
    next();
  } catch (err) {
    console.error('Optional JWT user population failed:', err.message);
    next(); // Continue without user info
  }
}

module.exports = {
  authenticateJWT,
  optionalAuth
}; 