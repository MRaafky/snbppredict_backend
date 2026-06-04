const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { connectDB } = require('./src/config/database');

// Daftarkan semua model
require('./src/models/User');
require('./src/models/Student');
require('./src/models/Prediksi');
require('./src/models/EarlyWarning');

// Import semua routes
const authRoutes      = require('./src/routes/authRoutes');
const studentRoutes   = require('./src/routes/studentRoutes');
const predictRoutes   = require('./src/routes/predictRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const warningRoutes   = require('./src/routes/warningRoutes');
const academicRoutes  = require('./src/routes/academicRoutes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ================================================
// MIDDLEWARE GLOBAL
// ================================================
app.use(cors({
  origin:         ['http://localhost:5173'],
  methods:        ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ================================================
// INFO SERVER
// ================================================
app.get('/', (req, res) => {
  res.json({
    message:   '🚀 SNBPredict API v1 berjalan!',
    version:   'v1',
    endpoints: {
      auth:      '/api/v1/auth',
      students:  '/api/v1/students',
      predict:   '/api/v1/predict',
      dashboard: '/api/v1/dashboard',
      warnings:  '/api/v1/warnings'
    }
  });
});

// ================================================
// ROUTES — mengikuti konvensi RESTful
// ================================================
app.use('/api/v1/auth',      authRoutes);      // POST /register, POST /login
app.use('/api/v1/students',  studentRoutes);   // GET, POST, PUT, DELETE
app.use('/api/v1/predict',   predictRoutes);   // POST
app.use('/api/v1/dashboard', dashboardRoutes); // GET
app.use('/api/v1/warnings',  warningRoutes);   // GET, PUT /:id/read
app.use('/api/v1/academic',  academicRoutes);  // GET /scores, GET /monitoring

// ================================================
// ERROR HANDLER (harus paling bawah)
// ================================================
app.use(notFound);
app.use(errorHandler);

// ================================================
// START SERVER + KONEKSI DATABASE
// ================================================
const startServer = async () => {
  await connectDB(); // coba konek database, fallback ke in-memory otomatis

  app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Daftar Endpoint:');
    console.log(`   POST   http://localhost:${PORT}/api/v1/auth/register`);
    console.log(`   POST   http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`   GET    http://localhost:${PORT}/api/v1/students`);
    console.log(`   GET    http://localhost:${PORT}/api/v1/students/:id`);
    console.log(`   POST   http://localhost:${PORT}/api/v1/students`);
    console.log(`   PUT    http://localhost:${PORT}/api/v1/students/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/v1/students/:id`);
    console.log(`   POST   http://localhost:${PORT}/api/v1/predict`);
    console.log(`   GET    http://localhost:${PORT}/api/v1/dashboard`);
    console.log(`   GET    http://localhost:${PORT}/api/v1/warnings`);
    console.log(`   PUT    http://localhost:${PORT}/api/v1/warnings/:id/read`);
    console.log(`   GET    http://localhost:${PORT}/api/v1/academic/scores`);
    console.log(`   GET    http://localhost:${PORT}/api/v1/academic/monitoring`);
  });
};

startServer();
