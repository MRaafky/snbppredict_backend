const express = require('express');
const router  = express.Router();
const { getDashboard, getSnbpStats } = require('../controllers/dashboardController');
const { protect }      = require('../middleware/authMiddleware');

// GET /api/v1/dashboard → data ringkasan dashboard
router.get('/', protect, getDashboard);

// GET /api/v1/dashboard/snbp-stats → data statistik untuk snbp
router.get('/snbp-stats', protect, getSnbpStats);

module.exports = router;
