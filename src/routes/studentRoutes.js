const express = require('express');
const router  = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// GET    /api/v1/students       → ambil semua siswa
router.get('/',      protect, getAllStudents);

// GET    /api/v1/students/:id   → ambil 1 siswa
router.get('/:id',   protect, getStudentById);

// POST   /api/v1/students       → tambah siswa baru
router.post('/',     protect, createStudent);

// PUT    /api/v1/students/:id   → update data siswa
router.put('/:id',   protect, updateStudent);

// DELETE /api/v1/students/:id   → hapus siswa
router.delete('/:id', protect, deleteStudent);

module.exports = router;
