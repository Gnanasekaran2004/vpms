import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import visitorRouter from './routes/visitorRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import reportRouter from './routes/reportRoutes.js';
import activityRouter from './routes/activityRoutes.js';
import { errorResponse } from './utils/apiResponse.js';

dotenv.config();

const expressApplication = express();

expressApplication.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

expressApplication.use(express.json());

expressApplication.use('/api/auth', authRouter);
expressApplication.use('/api/users', userRouter);
expressApplication.use('/api/visitors', visitorRouter);
expressApplication.use('/api/dashboard', dashboardRouter);
expressApplication.use('/api/reports', reportRouter);
expressApplication.use('/api/activity-logs', activityRouter);

expressApplication.use('*', (req, res) => {
  return errorResponse(res, 'Route not found', 404);
});

expressApplication.use((err, req, res, next) => {
  return errorResponse(res, err.message, 500);
});

const serverPort = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  expressApplication.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort} in ${process.env.NODE_ENV} mode`);
  });
};

startServer();
