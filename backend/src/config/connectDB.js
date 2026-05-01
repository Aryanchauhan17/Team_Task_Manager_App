import sequelize from './db.js';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to Neon PostgreSQL');
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;