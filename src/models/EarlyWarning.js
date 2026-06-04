const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Student = require('./Student');

const EarlyWarning = sequelize.define('EarlyWarning', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true
  },
  student_id: {
    type:      DataTypes.INTEGER,
    allowNull: false
  },
  pesan: {
    type:      DataTypes.TEXT,
    allowNull: false
  },
  level:   { type: DataTypes.STRING(20) },
  is_read: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName:   'early_warnings',
  timestamps:  true,
  underscored: true
});

Student.hasMany(EarlyWarning,   { foreignKey: 'student_id', as: 'warnings' });
EarlyWarning.belongsTo(Student, { foreignKey: 'student_id', as: 'siswa' });

module.exports = EarlyWarning;
