require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

const seedUsers = async () => {
  try {
    // Sinkronisasi model database
    await sequelize.sync({ alter: true });

    // Hapus semua data user sebelumnya agar bersih (opsional)
    // await User.destroy({ where: {} });
    // console.log('Data user lama dihapus.');

    // Buat satu password standar (terenkripsi) untuk semua akun test
    const passwordHash = await bcrypt.hash('password123', 12);

    const testUsers = [
      {
        nama: 'Ibu Sari',
        email: 'sari.rahayu@sman1yk.sch.id',
        password: passwordHash,
        role: 'guru'
      },
      {
        nama: 'Admin Utama',
        email: 'admin@sman1yk.sch.id',
        password: passwordHash,
        role: 'admin'
      },
      {
        nama: 'Bapak Budi (Wali Murid)',
        email: 'budi.ortu@gmail.com',
        password: passwordHash,
        role: 'ortu'
      },
      {
        nama: 'Andi (Siswa)',
        email: 'andi.siswa@sman1yk.sch.id',
        password: passwordHash,
        role: 'siswa'
      }
    ];

    for (const userData of testUsers) {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (!existing) {
        await User.create(userData);
        console.log(`✅ Berhasil membuat akun: ${userData.role.toUpperCase()} - ${userData.email}`);
      } else {
        console.log(`ℹ️ Akun sudah ada: ${userData.email}`);
      }
    }

    console.log('\n🎉 Proses pembuatan akun tes (seeding) selesai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal melakukan seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
