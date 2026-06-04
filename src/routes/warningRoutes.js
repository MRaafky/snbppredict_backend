const express = require('express');
const router  = express.Router();
const { getAllWarnings, markAsRead } = require('../controllers/warningController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/v1/warnings           → ambil semua warning
router.get('/', protect, getAllWarnings);

// PUT /api/v1/warnings/:id/read  → tandai sudah dibaca
router.put('/:id/read', protect, markAsRead);

module.exports = router;
