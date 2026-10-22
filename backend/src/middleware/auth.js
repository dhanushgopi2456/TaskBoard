import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-taskboard-key-change-in-production-2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Access token is missing or malformed' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}
