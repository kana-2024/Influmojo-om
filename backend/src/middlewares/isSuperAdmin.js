/**
 * Super Admin authorization middleware
 * Must be used after authenticateJWT middleware
 * Checks if the authenticated user has super_admin privileges
 */
function isSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.user_type !== 'super_admin') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Super admin privileges required'
    });
  }

  next();
}

/**
 * Admin authorization middleware (for agents and super admins)
 * Must be used after authenticateJWT middleware
 * Checks if the authenticated user has agent or super_admin privileges
 */
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.user_type !== 'agent' && req.user.user_type !== 'super_admin') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Agent or super admin privileges required'
    });
  }

  next();
}

/**
 * Role-based authorization middleware
 * Must be used after authenticateJWT middleware
 * Checks if the authenticated user has any of the specified roles
 */
function hasRole(allowedRoles) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (!allowedRoles.includes(req.user.user_type)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  isSuperAdmin,
  isAdmin,
  hasRole
}; 