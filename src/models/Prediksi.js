const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Student = require('./Student');

const Prediksi = sequelize.define('Prediksi', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true
  },
  student_id: {
    type:      DataTypes.INTEGER,
    allowNull: false
  },
  prediksi_nilai:  { type: DataTypes.FLOAT },
  tren:            { type: DataTypes.STRING(20) },
  level_risiko:    { type: DataTypes.STRING(20) },
  confidence:      { type: DataTypes.FLOAT },
  semester_target: { type: DataTypes.STRING(30) },
  is_simulated: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName:   'prediksi',
  timestamps:  true,
  underscored: true
});

Student.hasMany(Prediksi,   { foreignKey: 'student_id', as: 'riwayatPrediksi' });
Prediksi.belongsTo(Student, { foreignKey: 'student_id', as: 'siswa' });

module.exports = Prediksi;
