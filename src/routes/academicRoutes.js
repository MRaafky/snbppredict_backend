const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { protect } = require('../middleware/authMiddleware');

router.get('/scores', protect, academicController.getScores);
router.get('/monitoring', protect, academicController.getMonitoring);

module.exports = router;
