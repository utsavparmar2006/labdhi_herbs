import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const dbStateMap: Record<number, string> = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = dbStateMap[dbStateCode] || 'Unknown';

  res.status(200).json({
    success: true,
    message: 'Backend server is healthy & operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      connected: dbStateCode === 1,
      name: mongoose.connection.name || 'N/A',
      host: mongoose.connection.host || 'N/A',
    },
  });
});

export default router;
