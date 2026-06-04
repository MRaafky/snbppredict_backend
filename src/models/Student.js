const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true
  },
  student_id: {
    type:      DataTypes.INTEGER,
    unique:    true,
    allowNull: false
  },
  nama: {
    type:      DataTypes.STRING(150),
    allowNull: true
  },
  prodi: {
    type:      DataTypes.STRING(150),
    allowNull: true
  },
  age:                  { type: DataTypes.INTEGER },
  gender:               { type: DataTypes.STRING(20) },
  academic_level:       { type: DataTypes.STRING(50) },
  study_hours:          { type: DataTypes.FLOAT },
  self_study_hours:     { type: DataTypes.FLOAT },
  online_classes_hours: { type: DataTypes.FLOAT },
  social_media_hours:   { type: DataTypes.FLOAT },
  gaming_hours:         { type: DataTypes.FLOAT },
  sleep_hours:          { type: DataTypes.FLOAT },
  screen_time_hours:    { type: DataTypes.FLOAT },
  internet_quality:     { type: DataTypes.STRING(20) },
  mental_health_score:  { type: DataTypes.INTEGER },
  focus_index:          { type: DataTypes.FLOAT },
  burnout_level:        { type: DataTypes.FLOAT },
  productivity_score:   { type: DataTypes.FLOAT },
  exam_score:           { type: DataTypes.FLOAT },
  // ── New Fields for Data Nilai ──
  math_score:           { type: DataTypes.FLOAT },
  indo_score:           { type: DataTypes.FLOAT },
  bio_score:            { type: DataTypes.FLOAT },
  chem_score:           { type: DataTypes.FLOAT },
  phy_score:            { type: DataTypes.FLOAT },
  eng_score:            { type: DataTypes.FLOAT },
  // ── New Fields for Monitoring Kelas ──
  attendance_w1:        { type: DataTypes.FLOAT },
  attendance_w2:        { type: DataTypes.FLOAT },
  attendance_w3:        { type: DataTypes.FLOAT },
  attendance_w4:        { type: DataTypes.FLOAT },
  extracurricular_active: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: {
    type:         DataTypes.STRING(20),
    defaultValue: 'aktif'
  }
}, {
  tableName:   'students',
  timestamps:  true,
  underscored: true
});

module.exports = Student;
