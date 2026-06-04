const Student      = require('../models/Student');
const EarlyWarning = require('../models/EarlyWarning');
const {
  isUsingDatabase,
  getInMemoryStudents,
  setInMemoryStudents
} = require('../config/dataStore');

// ================================================
// GET SEMUA SISWA
// GET /api/v1/students
// ================================================
const getAllStudents = async (req, res) => {
  try {
    let data;

    if (isUsingDatabase()) {
      const Prediksi = require('../models/Prediksi');
      data = await Student.findAll({ 
        order: [['student_id', 'ASC']],
        include: [{ model: Prediksi, as: 'riwayatPrediksi' }]
      });
    } else {
      data = getInMemoryStudents();
    }

    res.json({ success: true, total: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================
// GET SISWA BERDASARKAN ID
// GET /api/v1/students/:id
// ================================================
const getStudentById = async (req, res) => {
  try {
    let student;

    if (isUsingDatabase()) {
      student = await Student.findOne({
        where:   { student_id: req.params.id },
        include: [{ model: EarlyWarning, as: 'warnings' }]
      });
    } else {
      student = getInMemoryStudents()
        .find(s => s.student_id === parseInt(req.params.id));
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================
// POST TAMBAH SISWA BARU
// POST /api/v1/students
// ================================================
const createStudent = async (req, res) => {
  try {
    const { student_id, age, gender, academic_level, exam_score } = req.body;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: 'student_id wajib diisi'
      });
    }

    let student;

    if (isUsingDatabase()) {
      student = await Student.create(req.body);
    } else {
      const list = getInMemoryStudents();
      const exists = list.find(s => s.student_id === parseInt(student_id));
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'student_id sudah terdaftar'
        });
      }
      student = {
        id:     list.length + 1,
        status: 'aktif',
        ...req.body
      };
      setInMemoryStudents([...list, student]);
    }

    res.status(201).json({
      success: true,
      message: 'Siswa berhasil ditambahkan',
      data:    student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================
// PUT UPDATE DATA SISWA
// PUT /api/v1/students/:id
// ================================================
const updateStudent = async (req, res) => {
  try {
    let student;

    if (isUsingDatabase()) {
      student = await Student.findOne({
        where: { student_id: req.params.id }
      });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Siswa tidak ditemukan'
        });
      }
      await student.update(req.body);
    } else {
      const list  = getInMemoryStudents();
      const index = list.findIndex(
        s => s.student_id === parseInt(req.params.id)
      );
      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Siswa tidak ditemukan'
        });
      }
      list[index] = { ...list[index], ...req.body };
      setInMemoryStudents(list);
      student = list[index];
    }

    res.json({
      success: true,
      message: 'Data siswa berhasil diupdate',
      data:    student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================
// DELETE HAPUS SISWA
// DELETE /api/v1/students/:id
// ================================================
const deleteStudent = async (req, res) => {
  try {
    if (isUsingDatabase()) {
      const student = await Student.findOne({
        where: { student_id: req.params.id }
      });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Siswa tidak ditemukan'
        });
      }
      await student.destroy();
    } else {
      const list   = getInMemoryStudents();
      const exists = list.find(
        s => s.student_id === parseInt(req.params.id)
      );
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Siswa tidak ditemukan'
        });
      }
      setInMemoryStudents(
        list.filter(s => s.student_id !== parseInt(req.params.id))
      );
    }

    res.json({
      success: true,
      message: 'Data siswa berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
