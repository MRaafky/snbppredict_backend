const express = require('express');
const router  = express.Router();
const { predictStudent } = require('../controllers/predictController');
const { protect }        = require('../middleware/authMiddleware');

// POST /api/v1/predict → prediksi performa siswa
router.post('/', protect, predictStudent);

module.exports = router;
