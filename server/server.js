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
import { err } from './utils/apiResponse.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/visitors', visitorRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportRouter);
app.use('/api/activity-logs', activityRouter);

app.use('*', (req, res) => {
  return err(res, 'Route not found', 404);
});

app.use((error, req, res, next) => {
  return err(res, error.message, 500);
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
};

start();
