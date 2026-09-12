import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before initializing app or db
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  // Connect to MongoDB Cluster
  await connectDB();

  // Start HTTP Server
  app.listen(PORT, () => {
    console.log(`[Server] Express server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Server] API Health check available at: http://localhost:${PORT}/api/health`);
  });
};

// Start server
startServer();
