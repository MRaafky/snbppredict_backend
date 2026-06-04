// ================================================
// GLOBAL ERROR HANDLER
// ================================================
const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${new Date().toISOString()}] ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server'
  });
};

// ================================================
// 404 NOT FOUND HANDLER
// ================================================
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} tidak ditemukan`
  });
};

module.exports = { errorHandler, notFound };
