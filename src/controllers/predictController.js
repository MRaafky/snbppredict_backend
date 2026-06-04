const axios    = require('axios');
const Prediksi = require('../models/Prediksi');
const Student  = require('../models/Student');
const {
  isUsingDatabase,
  getInMemoryStudents
} = require('../config/dataStore');

// ================================================
// POST PREDIKSI PERFORMA SISWA
// POST /api/v1/predict
// ================================================
const predictStudent = async (req, res) => {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: 'student_id wajib diisi'
      });
    }

    // Cari data siswa
    let student;
    if (isUsingDatabase()) {
      student = await Student.findOne({ where: { student_id } });
    } else {
      student = getInMemoryStudents()
        .find(s => s.student_id === parseInt(student_id));
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    let hasilPrediksi;
    let isSimulated = false;

    try {
      // Coba panggil model AI dari tim AI Engineer
      const AI_URL = process.env.AI_MODEL_URL || 'http://localhost:5000';
      const aiResponse = await axios.post(`${AI_URL}/predict`, {
        age:                  student.age,
        gender:               student.gender,
        study_hours:          student.study_hours,
        self_study_hours:     student.self_study_hours,
        online_classes_hours: student.online_classes_hours,
        social_media_hours:   student.social_media_hours,
        gaming_hours:         student.gaming_hours,
        sleep_hours:          student.sleep_hours,
        screen_time_hours:    student.screen_time_hours,
        internet_quality:     student.internet_quality,
        mental_health_score:  student.mental_health_score,
        focus_index:          student.focus_index,
        burnout_level:        student.burnout_level,
        productivity_score:   student.productivity_score
      }, { timeout: 15000 });

      hasilPrediksi = aiResponse.data;

    } catch {
      // Fallback: simulasi jika model AI belum tersedia
      isSimulated = true;
      const score = student.exam_score;
      hasilPrediksi = {
        prediksi_nilai: parseFloat((score * 1.05).toFixed(2)),
        tren:           score > 30 ? 'naik' : score > 15 ? 'stabil' : 'turun',
        level_risiko:   score < 10 ? 'tinggi' : score < 20 ? 'sedang' : 'rendah',
        confidence:     0
      };
    }

    // Simpan hasil ke database jika tersedia
    let prediksi = hasilPrediksi;
    if (isUsingDatabase()) {
      prediksi = await Prediksi.create({
        student_id:     student.id,
        prediksi_nilai: hasilPrediksi.prediksi_nilai,
        tren:           hasilPrediksi.tren,
        level_risiko:   hasilPrediksi.level_risiko,
        confidence:     hasilPrediksi.confidence,
        is_simulated:   isSimulated
      });
    }

    res.json({
      success:   true,
      simulated: isSimulated,
      data:      {
        student_id,
        ...hasilPrediksi,
        is_simulated: isSimulated
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { predictStudent };
