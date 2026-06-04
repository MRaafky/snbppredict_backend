const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

router.get('/scores', academicController.getScores);
router.get('/monitoring', academicController.getMonitoring);

module.exports = router;
