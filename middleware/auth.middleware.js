// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

// Step 1: Token verify kora (check kora user login kora ache ki na)
function verifyToken(req, res, next) {
  try {
    // Header theke token neya hocche
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'No token provided. Please login first.'
      });
    }

    // Header a "Bearer <token>" ei format a thake, tai split kore token ta ber kortesi
    const token = authHeader.split(' ')[1];

    // Token verify kora - jodi thik hoy, decoded data pabo (id, role)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Decoded data ta req object er sathe attach kore dicchi, jate controller a use kora jai
    req.user = decoded;

    next(); // shob thik thakle porer step (controller) e jete dei

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token. Please login again.'
    });
  }
}

// Step 2: Check kora user ta Admin kina
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin only.'
    });
  }
  next();
}

module.exports = { verifyToken, isAdmin };