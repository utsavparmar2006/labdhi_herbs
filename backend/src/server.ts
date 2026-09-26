import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load environment variables before initializing app or db
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedSiteSettings } from './controllers/siteSettings.controller.js';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  // 1. Connect to MongoDB Cluster
  await connectDB();

  // 2. Safe initial seeder execution (after DB connection is confirmed)
  try {
    await Promise.allSettled([
      seedSiteSettings(),
    ]);
  } catch (seedErr) {
    console.warn('[Server] Non-blocking initial seeder warning:', seedErr);
  }

  // 3. Start HTTP Server
  const server = app.listen(PORT, () => {
    console.log(`[Server] Express server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Server] API Health check available at: http://localhost:${PORT}/api/health`);
  });

  // 4. Graceful Shutdown handlers (Industry Standard for zero-downtime restarts)
  const handleGracefulShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('[Server] HTTP connections closed.');
      try {
        await mongoose.connection.close(false);
        console.log('[Database] MongoDB connection closed safely.');
        process.exit(0);
      } catch (err) {
        console.error('[Server] Error during database shutdown:', err);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds if still hanging
    setTimeout(() => {
      console.error('[Server] Forcing shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
};

// Start server
startServer().catch((err) => {
  console.error('[Server] Fatal server startup error:', err);
  process.exit(1);
});
