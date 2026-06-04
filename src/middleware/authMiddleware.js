const jwt = require('jsonwebtoken');

// ================================================
// PROTECT — Wajib login untuk akses endpoint
// ================================================
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Silakan login terlebih dahulu.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluarsa'
    });
  }
};

// ================================================
// RESTRICT TO — Batasi akses berdasarkan role
// ================================================
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Kamu tidak punya izin untuk aksi ini'
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
