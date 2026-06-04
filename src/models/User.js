const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true
  },
  nama: {
    type:      DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    unique:    true
  },
  password: {
    type:      DataTypes.STRING(255),
    allowNull: false
  },
    role: {
      type:         DataTypes.STRING(20),
      allowNull:    false,
      defaultValue: 'siswa',
      validate: {
        isIn: [['siswa', 'guru', 'ortu', 'admin']]
      }
    }
}, {
  tableName:   'users',
  timestamps:  true,
  underscored: true
});

module.exports = User;
