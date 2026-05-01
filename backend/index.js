import dotenv from 'dotenv';
dotenv.config({
  path: './.env'
});
import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import sequelize from './src/config/db.js';


import connectDB from './src/config/connectDB.js';
import errorHandler from './src/middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await connectDB();
await sequelize.sync({ alter: true });
console.log('Models synced');


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


app.use(errorHandler);


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));