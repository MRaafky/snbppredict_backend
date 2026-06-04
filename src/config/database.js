const { Sequelize } = require('sequelize');
const { setUseDatabase } = require('./dataStore');

const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host:    process.env.DB_HOST,
        port:    process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    setUseDatabase(true);
    console.log('✅ Mode: Database PostgreSQL aktif');
  } catch (error) {
    setUseDatabase(false);
    console.warn('⚠️  Database tidak tersedia. Mode: Data In-Memory (tanpa database)');
  }
};

module.exports = { sequelize, connectDB };
