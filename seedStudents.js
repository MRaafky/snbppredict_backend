require('dotenv').config();
const { sequelize } = require('./src/config/database');
const Student = require('./src/models/Student');
const Prediksi = require('./src/models/Prediksi');
const EarlyWarning = require('./src/models/EarlyWarning');
const { getInMemoryStudents, getInMemoryWarnings } = require('./src/config/dataStore');

const dummyNames = [
  "Anisa Wahyu", "Budi Rahmat", "Nur Salsabila", "Dewi Pratiwi", "Rizal Kurniawan",
  "Farhan Hidayat", "Muhammad Naufal", "Citra Kirana", "Dian Sastro", "Eka Putri",
  "Fajar Sidiq", "Gilang Ramadhan", "Hendra Saputra", "Intan Permata", "Joko Susilo"
];

const dummyProdis = [
  "Kedokteran - UGM", "Teknik Informatika - UNY", "Farmasi - UGM", "Psikologi - Univ. Airlangga",
  "Manajemen - UNS", "Akuntansi - UPN Yogyakarta", "Teknik Sipil - UNY", "Hukum - UI",
  "Ilmu Komunikasi - UB", "Sastra Inggris - UNPAD", "Biologi - IPB", "Teknik Mesin - ITS",
  "Kesehatan Masyarakat - UNDIP", "Agribisnis - UNSOED", "Teknik Elektro - ITB"
];

async function seed() {
  try {
    // Sync database (creates new columns if any)
    await sequelize.sync({ alter: true });
    
    // Check if students already exist
    const count = await Student.count();
    if (count > 0) {
      console.log('Siswa sudah ada, menghapus data lama...');
      await EarlyWarning.destroy({ where: {} });
      await Prediksi.destroy({ where: {} });
      await Student.destroy({ where: {} });
    }

    const inMemoryData = getInMemoryStudents();
    const studentsToInsert = inMemoryData.map((s, idx) => {
      // Base score is exam_score (scaled if necessary, let's say exam_score in DB is usually 0-100)
      // Some exam scores might be very low (1.0), so we normalize it to a reasonable scale for mapel
      const baseScore = s.exam_score < 40 ? 40 + s.exam_score : s.exam_score;
      
      // Random variance function
      const randomVar = (min, max) => Math.random() * (max - min) + min;
      const getSubjectScore = () => Math.min(100, Math.max(0, baseScore + randomVar(-15, 15)));

      // Simulate attendance (mostly >80%, some lower based on study_hours)
      const baseAtt = s.study_hours > 5 ? 90 : 70;
      const getAttendance = () => Math.min(100, Math.max(0, baseAtt + randomVar(-20, 10)));

      return {
        ...s,
        nama: dummyNames[idx] || `Siswa ${idx + 1}`,
        prodi: dummyProdis[idx] || `Prodi ${idx + 1}`,
        math_score: getSubjectScore(),
        indo_score: getSubjectScore(),
        bio_score: getSubjectScore(),
        chem_score: getSubjectScore(),
        phy_score: getSubjectScore(),
        eng_score: getSubjectScore(),
        attendance_w1: getAttendance(),
        attendance_w2: getAttendance(),
        attendance_w3: getAttendance(),
        attendance_w4: getAttendance(),
        extracurricular_active: Math.random() > 0.5
      };
    });

    await Student.bulkCreate(studentsToInsert);
    console.log(`Berhasil memasukkan ${studentsToInsert.length} siswa ke database.`);

    const inMemoryWarnings = getInMemoryWarnings();
    if (inMemoryWarnings && inMemoryWarnings.length > 0) {
      await EarlyWarning.bulkCreate(inMemoryWarnings);
      console.log(`Berhasil memasukkan ${inMemoryWarnings.length} data early warning ke database.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Gagal melakukan seeding:', error);
    process.exit(1);
  }
}

seed();
