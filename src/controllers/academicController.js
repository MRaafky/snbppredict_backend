const Student = require('../models/Student');
const { Op } = require('sequelize');

exports.getScores = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      attributes: ['nama', 'math_score', 'indo_score', 'bio_score', 'chem_score', 'phy_score', 'eng_score']
    });

    if (!students || students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found' });
    }

    let totalMath = 0, totalIndo = 0, totalBio = 0, totalChem = 0, totalPhy = 0, totalEng = 0;
    let remedialCount = 0;
    let maxScore = -1;
    let maxScoreName = '';
    let minScore = 999;
    let minScoreName = '';

    let distSangatBaik = 0;
    let distBaik = 0;
    let distCukup = 0;
    let distKurang = 0;

    students.forEach(s => {
      totalMath += s.math_score || 0;
      totalIndo += s.indo_score || 0;
      totalBio += s.bio_score || 0;
      totalChem += s.chem_score || 0;
      totalPhy += s.phy_score || 0;
      totalEng += s.eng_score || 0;

      const avg = ((s.math_score || 0) + (s.indo_score || 0) + (s.bio_score || 0) + 
                   (s.chem_score || 0) + (s.phy_score || 0) + (s.eng_score || 0)) / 6;

      if (avg > maxScore) { maxScore = avg; maxScoreName = s.nama; }
      if (avg < minScore) { minScore = avg; minScoreName = s.nama; }

      if (avg < 75) { remedialCount++; distKurang++; }
      else if (avg < 80) distCukup++;
      else if (avg < 90) distBaik++;
      else distSangatBaik++;
    });

    const count = students.length;
    const subjects = [
      { name: 'Matematika', score: (totalMath / count).toFixed(1) },
      { name: 'Bahasa Indonesia', score: (totalIndo / count).toFixed(1) },
      { name: 'Biologi', score: (totalBio / count).toFixed(1) },
      { name: 'Kimia', score: (totalChem / count).toFixed(1) },
      { name: 'Fisika', score: (totalPhy / count).toFixed(1) },
      { name: 'Bahasa Inggris', score: (totalEng / count).toFixed(1) }
    ].sort((a, b) => b.score - a.score);

    const distributions = [
      { label: 'Sangat baik (>90)', count: `${distSangatBaik} siswa`, color: '#16a34a' },
      { label: 'Baik (80–89)', count: `${distBaik} siswa`, color: '#2563eb' },
      { label: 'Cukup (75–79)', count: `${distCukup} siswa`, color: '#ea580c' },
      { label: 'Di bawah KKM (<75)', count: `${distKurang} siswa`, color: '#ef4444' }
    ];

    const stats = {
      diAtasKKM: count - remedialCount,
      diBawahKKM: remedialCount,
      tertinggi: { val: maxScore.toFixed(1), name: maxScoreName },
      terendah: { val: minScore.toFixed(1), name: minScoreName }
    };

    res.json({
      success: true,
      data: { stats, subjects, distributions }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonitoring = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      attributes: ['nama', 'attendance_w1', 'attendance_w2', 'attendance_w3', 'attendance_w4', 'extracurricular_active', 'status']
    });

    if (!students || students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found' });
    }

    let w1 = 0, w2 = 0, w3 = 0, w4 = 0;
    let extraCount = 0;
    let activeCount = 0;
    const lowAttendanceStudents = [];

    students.forEach(s => {
      w1 += s.attendance_w1 || 0;
      w2 += s.attendance_w2 || 0;
      w3 += s.attendance_w3 || 0;
      w4 += s.attendance_w4 || 0;
      
      if (s.extracurricular_active) extraCount++;
      if (s.status === 'aktif') activeCount++;

      const avgAtt = ((s.attendance_w1 || 0) + (s.attendance_w2 || 0) + (s.attendance_w3 || 0) + (s.attendance_w4 || 0)) / 4;
      if (avgAtt < 75 && lowAttendanceStudents.length < 5) {
        lowAttendanceStudents.push({
          initials: s.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          nama: s.nama,
          days_absent: Math.round(((100 - avgAtt) / 100) * 20), // Assumes 20 school days in a month
          status: avgAtt < 60 ? 'KRITIS' : 'PERHATIAN'
        });
      }
    });

    const count = students.length;
    const weeklyAvg = [
      (w1 / count).toFixed(0),
      (w2 / count).toFixed(0),
      (w3 / count).toFixed(0),
      (w4 / count).toFixed(0)
    ];

    const overallAvg = (((w1 + w2 + w3 + w4) / 4) / count).toFixed(0);

    res.json({
      success: true,
      data: {
        overallAttendance: overallAvg,
        activeStudents: activeCount,
        totalStudents: count,
        extracurricularCount: extraCount,
        weekly: weeklyAvg,
        lowAttendanceStudents
      }
    });
  } catch (error) {
    next(error);
  }
};
