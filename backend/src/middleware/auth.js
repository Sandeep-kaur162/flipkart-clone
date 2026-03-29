const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'flipkart_secret_key';

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET);
      req.user = payload; // { id, email }
    } catch {
      // invalid/expired token — treat as guest
    }
  }
  // Fall back to guest user (id=1) if not authenticated
  if (!req.user) req.user = { id: 1 };
  next();
};
