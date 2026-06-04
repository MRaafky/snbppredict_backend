const Student      = require('../models/Student');
const EarlyWarning = require('../models/EarlyWarning');
const { sequelize } = require('../config/database');
const {
  isUsingDatabase,
  getInMemoryStudents,
  getInMemoryWarnings
} = require('../config/dataStore');

// ================================================
// GET DATA RINGKASAN DASHBOARD
// GET /api/v1/dashboard
// ================================================
const getDashboard = async (req, res) => {
  try {
    let totalSiswa, avgScore, maxScore, minScore;
    let risikoTinggi = 0, risikoSedang = 0, risikoRendah = 0;
    let warningBelumDibaca = 0;

    if (isUsingDatabase()) {
      // Ambil dari database
      totalSiswa = await Student.count();

      const stats = await Student.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('exam_score')), 'avg'],
          [sequelize.fn('MAX', sequelize.col('exam_score')), 'max'],
          [sequelize.fn('MIN', sequelize.col('exam_score')), 'min'],
        ],
        raw: true
      });

      avgScore = parseFloat(stats.avg || 0).toFixed(2);
      maxScore = parseFloat(stats.max || 0).toFixed(2);
      minScore = parseFloat(stats.min || 0).toFixed(2);

      const semuaSiswa = await Student.findAll({ raw: true });
      semuaSiswa.forEach(s => {
        if (s.exam_score < 10)      risikoTinggi++;
        else if (s.exam_score < 20) risikoSedang++;
        else                        risikoRendah++;
      });

      warningBelumDibaca = await EarlyWarning.count({
        where: { is_read: false }
      });

      // Fetch Top 5 Risk Students (lowest exam score)
      const riskStudentsData = await Student.findAll({
        order: [['exam_score', 'ASC']],
        limit: 5,
        raw: true
      });

      // Fetch Recent 3 Notifications
      const recentNotifsData = await EarlyWarning.findAll({
        include: [{ model: Student, as: 'siswa', attributes: ['nama'] }],
        order: [['createdAt', 'DESC']],
        limit: 3,
        raw: true,
        nest: true
      });

      // Attach to response object properties later
      req.riskStudents = riskStudentsData.map(s => ({
        id: s.id,
        name: s.nama,
        avg: s.exam_score,
        predict: s.exam_score, // Using exam score as predict pct proxy
        attendance: Math.round(70 + (s.study_hours || 0) * 2), // dummy logic using study_hours
        status: s.exam_score < 20 ? 'Berisiko' : (s.exam_score < 40 ? 'Perhatian' : 'Siap')
      }));

      req.notifications = recentNotifsData.map(w => ({
        id: w.id,
        icon: w.level === 'tinggi' ? '⚠' : 'ℹ',
        iconBg: w.level === 'tinggi' ? '#fef2f2' : '#eff6ff',
        iconColor: w.level === 'tinggi' ? '#dc2626' : '#2563eb',
        title: w.pesan,
        time: w.createdAt // will format on frontend
      }));

    } else {
      // Ambil dari memori
      const list = getInMemoryStudents();
      totalSiswa = list.length;

      const scores = list.map(s => s.exam_score);
      avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
      maxScore = Math.max(...scores).toFixed(2);
      minScore = Math.min(...scores).toFixed(2);

      list.forEach(s => {
        if (s.exam_score < 10)      risikoTinggi++;
        else if (s.exam_score < 20) risikoSedang++;
        else                        risikoRendah++;
      });

      warningBelumDibaca = getInMemoryWarnings()
        .filter(w => !w.is_read).length;
        
      req.riskStudents = [];
      req.notifications = [];
    }

    res.json({
      success: true,
      data: {
        totalSiswa,
        examScore: {
          rataRata:  avgScore,
          tertinggi: maxScore,
          terendah:  minScore
        },
        distribusiRisiko: {
          tinggi: risikoTinggi,
          sedang: risikoSedang,
          rendah: risikoRendah
        },
        warningBelumDibaca,
        riskStudents: req.riskStudents,
        notifications: req.notifications
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================
// GET STATISTIK SNBP (ADMIN)
// GET /api/v1/dashboard/snbp-stats
// ================================================
const getSnbpStats = async (req, res) => {
  try {
    let semuaSiswa;
    
    if (isUsingDatabase()) {
      semuaSiswa = await Student.findAll({ raw: true });
    } else {
      semuaSiswa = getInMemoryStudents();
    }
    
    const totalSiswa = semuaSiswa.length;
    if (totalSiswa === 0) {
      return res.json({ success: true, data: { totalSiswa: 0 }});
    }

    let avg = {
      age: 0,
      study_hours: 0,
      self_study_hours: 0,
      online_classes_hours: 0,
      social_media_hours: 0,
      gaming_hours: 0,
      sleep_hours: 0,
      screen_time_hours: 0,
      mental_health_score: 0,
      focus_index: 0
    };
    let genderCount = { male: 0, female: 0 };
    let distribusiRisiko = { tinggi: 0, sedang: 0, rendah: 0 };
    let prodiStats = {};

    semuaSiswa.forEach(s => {
      avg.age += s.age || 0;
      avg.study_hours += s.study_hours || 0;
      avg.self_study_hours += s.self_study_hours || 0;
      avg.online_classes_hours += s.online_classes_hours || 0;
      avg.social_media_hours += s.social_media_hours || 0;
      avg.gaming_hours += s.gaming_hours || 0;
      avg.sleep_hours += s.sleep_hours || 0;
      avg.screen_time_hours += s.screen_time_hours || 0;
      avg.mental_health_score += s.mental_health_score || 0;
      avg.focus_index += s.focus_index || 0;

      if (s.gender && s.gender.toLowerCase() === 'male') genderCount.male++;
      if (s.gender && s.gender.toLowerCase() === 'female') genderCount.female++;

      let isLolos = false;
      if (s.exam_score < 10) {
        distribusiRisiko.tinggi++;
      } else if (s.exam_score < 20) {
        distribusiRisiko.sedang++;
      } else {
        distribusiRisiko.rendah++;
        isLolos = true;
      }

      const prodiName = s.prodi || 'Tidak Diketahui';
      if (!prodiStats[prodiName]) {
        prodiStats[prodiName] = { total: 0, lolos: 0 };
      }
      prodiStats[prodiName].total++;
      if (isLolos) prodiStats[prodiName].lolos++;
    });

    for (let key in avg) {
      avg[key] = (avg[key] / totalSiswa).toFixed(1);
    }

    const malePct = ((genderCount.male / totalSiswa) * 100).toFixed(0);
    const femalePct = ((genderCount.female / totalSiswa) * 100).toFixed(0);

    const kelasPerforma = Object.keys(prodiStats).map(prodi => {
      const data = prodiStats[prodi];
      const pct = data.total > 0 ? ((data.lolos / data.total) * 100).toFixed(0) : 0;
      return {
        kelas: prodi,
        lolos: data.lolos,
        total: data.total,
        pct: parseInt(pct),
        trend: '+0' // Trend riil belum bisa dihitung karena tidak ada data historis di DB
      };
    }).sort((a, b) => b.pct - a.pct); // Urutkan berdasarkan persentase lolos tertinggi

    res.json({
      success: true,
      data: {
        totalSiswa,
        distribusiRisiko,
        avg,
        gender: {
          malePct,
          femalePct
        },
        kelasPerforma
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, getSnbpStats };
