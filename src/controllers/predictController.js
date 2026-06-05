const axios    = require('axios');
const Prediksi = require('../models/Prediksi');
const Student  = require('../models/Student');
const {
  isUsingDatabase,
  getInMemoryStudents
} = require('../config/dataStore');

const AI_URL = process.env.AI_MODEL_URL || 'http://localhost:5000';

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
      }, { timeout: 30000 });

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
        nama: student.nama,
        ...hasilPrediksi,
        is_simulated: isSimulated
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================
// POST PREDIKSI BATCH — Semua Siswa
// POST /api/v1/predict/batch
// ================================================
const predictBatch = async (req, res) => {
  try {
    let students;
    if (isUsingDatabase()) {
      students = await Student.findAll({ raw: true });
    } else {
      students = getInMemoryStudents();
    }

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada data siswa'
      });
    }

    const results = [];
    let aiAvailable = true;

    // Try batch endpoint first
    try {
      const batchPayload = students.map(s => ({
        student_id:           s.student_id,
        age:                  s.age,
        gender:               s.gender,
        study_hours:          s.study_hours,
        self_study_hours:     s.self_study_hours,
        online_classes_hours: s.online_classes_hours,
        social_media_hours:   s.social_media_hours,
        gaming_hours:         s.gaming_hours,
        sleep_hours:          s.sleep_hours,
        screen_time_hours:    s.screen_time_hours,
        internet_quality:     s.internet_quality,
        mental_health_score:  s.mental_health_score,
        focus_index:          s.focus_index,
        burnout_level:        s.burnout_level,
        productivity_score:   s.productivity_score
      }));

      const aiResponse = await axios.post(`${AI_URL}/predict/batch`, {
        students: batchPayload
      }, { timeout: 60000 });

      const batchResults = aiResponse.data.results || aiResponse.data;

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const pred = Array.isArray(batchResults) ? batchResults[i] : batchResults[student.student_id];

        if (pred) {
          // Save to DB
          if (isUsingDatabase()) {
            await Prediksi.create({
              student_id:     student.id,
              prediksi_nilai: pred.prediksi_nilai,
              tren:           pred.tren,
              level_risiko:   pred.level_risiko,
              confidence:     pred.confidence,
              is_simulated:   false
            });
          }
          results.push({
            student_id: student.student_id,
            nama: student.nama,
            ...pred,
            is_simulated: false
          });
        }
      }
    } catch {
      // Fallback: simulasi untuk semua siswa
      aiAvailable = false;

      for (const student of students) {
        const score = student.exam_score || 0;
        const pred = {
          prediksi_nilai: parseFloat((score * 1.05).toFixed(2)),
          tren:           score > 30 ? 'naik' : score > 15 ? 'stabil' : 'turun',
          level_risiko:   score < 10 ? 'tinggi' : score < 20 ? 'sedang' : 'rendah',
          confidence:     0
        };

        if (isUsingDatabase()) {
          await Prediksi.create({
            student_id:     student.id,
            prediksi_nilai: pred.prediksi_nilai,
            tren:           pred.tren,
            level_risiko:   pred.level_risiko,
            confidence:     pred.confidence,
            is_simulated:   true
          });
        }

        results.push({
          student_id: student.student_id,
          nama: student.nama,
          ...pred,
          is_simulated: true
        });
      }
    }

    res.json({
      success: true,
      ai_available: aiAvailable,
      total: results.length,
      data: results
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================
// GET STATUS MODEL AI
// GET /api/v1/predict/model-status
// ================================================
const getAiModelStatus = async (req, res) => {
  try {
    const healthResponse = await axios.get(`${AI_URL}/health`, { timeout: 10000 });

    res.json({
      success: true,
      data: {
        status: 'active',
        label: 'AI Model Aktif',
        url: AI_URL,
        detail: healthResponse.data,
        endpoints: [
          'POST /predict',
          'POST /predict/batch',
          'POST /narasi/guru',
          'POST /narasi/admin',
          'POST /narasi/ortu'
        ]
      }
    });
  } catch {
    res.json({
      success: true,
      data: {
        status: 'inactive',
        label: 'Mode Simulasi',
        url: AI_URL,
        detail: null,
        endpoints: []
      }
    });
  }
};

// ================================================
// POST NARASI AI
// POST /api/v1/predict/narasi
// ================================================
const getNarasi = async (req, res) => {
  try {
    const { student_id, role } = req.body;

    if (!student_id || !role) {
      return res.status(400).json({
        success: false,
        message: 'student_id dan role wajib diisi'
      });
    }

    // Ambil data siswa
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

    const validRoles = ['guru', 'admin', 'ortu'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role harus salah satu dari: guru, admin, ortu'
      });
    }

    try {
      const narasiResponse = await axios.post(`${AI_URL}/narasi/${role}`, {
        student_id:           student.student_id,
        nama:                 student.nama,
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
        productivity_score:   student.productivity_score,
        exam_score:           student.exam_score
      }, { timeout: 30000 });

      res.json({
        success: true,
        data: {
          narasi: narasiResponse.data.narasi || narasiResponse.data.text || narasiResponse.data,
          role,
          student_id,
          is_ai: true
        }
      });
    } catch {
      // Fallback narasi sederhana
      const score = student.exam_score || 0;
      let narasi = '';

      if (role === 'guru') {
        narasi = `Siswa ${student.nama || 'ini'} memiliki skor ujian ${score.toFixed(1)}. ` +
          (score < 20 ? 'Perlu perhatian khusus dan intervensi segera. Pertimbangkan untuk memberikan bimbingan tambahan dan koordinasi dengan orang tua.' :
           score < 40 ? 'Perlu pemantauan berkelanjutan. Disarankan untuk memberikan latihan tambahan dan motivasi belajar.' :
           'Performa cukup baik. Pertahankan pendekatan saat ini dan dorong siswa untuk terus meningkatkan prestasi.');
      } else if (role === 'ortu') {
        narasi = `Anak Anda ${student.nama || ''} memiliki skor ujian ${score.toFixed(1)}. ` +
          (score < 20 ? 'Diperlukan perhatian ekstra di rumah. Pastikan anak mendapat waktu belajar yang cukup dan dukungan emosional.' :
           score < 40 ? 'Pantau kegiatan belajar anak secara rutin. Berikan motivasi dan lingkungan belajar yang kondusif.' :
           'Performa anak cukup baik. Terus dukung kegiatan belajar dan apresiasi pencapaian anak.');
      } else {
        narasi = `Siswa ${student.nama || ''} dengan skor ${score.toFixed(1)}. ` +
          (score < 20 ? 'Masuk kategori risiko tinggi, perlu koordinasi antar guru dan orang tua.' :
           score < 40 ? 'Perlu pemantauan berkelanjutan di tingkat kelas.' :
           'Performa dalam kategori baik.');
      }

      res.json({
        success: true,
        data: {
          narasi,
          role,
          student_id,
          is_ai: false
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { predictStudent, predictBatch, getAiModelStatus, getNarasi };
