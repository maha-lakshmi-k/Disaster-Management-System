const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'disaster_management_jwt_secret_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Fallback: If no token provided, set default user role from custom header or public
    const headerRole = req.headers['x-user-role'] || 'PUBLIC';
    req.user = {
      id: 3,
      name: 'Guest / Demo User',
      role: headerRole.toUpperCase(),
      email: 'demo@disaster.gov.in',
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      const headerRole = req.headers['x-user-role'] || 'PUBLIC';
      req.user = {
        id: 3,
        name: 'Guest / Demo User',
        role: headerRole.toUpperCase(),
        email: 'demo@disaster.gov.in',
      };
      return next();
    }
    req.user = user;
    next();
  });
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    // If x-user-role header is present (from quick role switcher in UI), allow it for demo convenience
    const currentRole = (req.headers['x-user-role'] || req.user?.role || 'PUBLIC').toUpperCase();

    if (allowedRoles.includes('ALL') || allowedRoles.includes(currentRole)) {
      return next();
    }

    return res.status(403).json({
      error: `Access Denied: Action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${currentRole}'.`,
    });
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET,
};
