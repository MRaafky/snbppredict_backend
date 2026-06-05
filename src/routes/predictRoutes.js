const express = require('express');
const router  = express.Router();
const { predictStudent, predictBatch, getAiModelStatus, getNarasi } = require('../controllers/predictController');
const { protect }        = require('../middleware/authMiddleware');

// POST /api/v1/predict → prediksi performa siswa
router.post('/', protect, predictStudent);

// POST /api/v1/predict/batch → prediksi semua siswa
router.post('/batch', protect, predictBatch);

// GET /api/v1/predict/model-status → cek status model AI
router.get('/model-status', protect, getAiModelStatus);

// POST /api/v1/predict/narasi → ambil narasi AI
router.post('/narasi', protect, getNarasi);

module.exports = router;
