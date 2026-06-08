require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./src/config/database');
const Student = require('./src/models/Student');
const Prediksi = require('./src/models/Prediksi');
const EarlyWarning = require('./src/models/EarlyWarning');
const { getInMemoryWarnings } = require('./src/config/dataStore');

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

    // Read from CSV
    const csvPath = path.join(__dirname, 'data', 'cleaned_data.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.trim().split('\n').slice(1); // skip header
    
    let inMemoryData = lines.map(line => {
      const cols = line.split(',');
      if (cols.length < 17) return null;
      return {
        student_id: parseInt(cols[0]),
        age: parseFloat(cols[1]),
        gender: cols[2],
        academic_level: cols[3],
        study_hours: parseFloat(cols[4]),
        self_study_hours: parseFloat(cols[5]),
        online_classes_hours: parseFloat(cols[6]),
        social_media_hours: parseFloat(cols[7]),
        gaming_hours: parseFloat(cols[8]),
        sleep_hours: parseFloat(cols[9]),
        screen_time_hours: parseFloat(cols[10]),
        internet_quality: cols[11],
        mental_health_score: parseFloat(cols[12]),
        focus_index: parseFloat(cols[13]),
        burnout_level: parseFloat(cols[14]),
        productivity_score: parseFloat(cols[15]),
        exam_score: parseFloat(cols[16])
      };
    }).filter(s => s !== null);

    const studentsToInsert = inMemoryData.map((s, idx) => {
      // Base score is exam_score
      const baseScore = s.exam_score < 40 ? 40 + s.exam_score : s.exam_score;
      
      // Random variance function
      const randomVar = (min, max) => Math.random() * (max - min) + min;
      const getSubjectScore = () => Math.min(100, Math.max(0, baseScore + randomVar(-15, 15)));

      // Simulate attendance
      const baseAtt = s.study_hours > 5 ? 90 : 70;
      const getAttendance = () => Math.min(100, Math.max(0, baseAtt + randomVar(-20, 10)));

      const nmIdx = idx % dummyNames.length;
      const prIdx = idx % dummyProdis.length;

      return {
        ...s,
        nama: dummyNames[nmIdx] || `Siswa ${idx + 1}`,
        prodi: dummyProdis[prIdx] || `Prodi ${idx + 1}`,
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

    // Chunk insert if too big (5000+ might be slow in one go depending on DB config)
    const chunkSize = 1000;
    let totalInserted = 0;
    for (let i = 0; i < studentsToInsert.length; i += chunkSize) {
      const chunk = studentsToInsert.slice(i, i + chunkSize);
      await Student.bulkCreate(chunk);
      totalInserted += chunk.length;
    }
    
    console.log(`Berhasil memasukkan ${totalInserted} siswa ke database.`);

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
