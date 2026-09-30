import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows DNS resolution for MongoDB SRV cluster connection strings
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if custom DNS set fails
}

export const connectDB = async (retries = 3, delay = 2000): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        maxPoolSize: 25,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
      });

      console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
      console.log(`[Database] Database Name: ${conn.connection.name}`);

      mongoose.connection.on('error', (err) => {
        console.error('[Database] MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[Database] MongoDB connection lost. Disconnected.');
      });

      return;
    } catch (error) {
      console.error(`[Database] MongoDB connection attempt ${attempt}/${retries} failed:`, error);
      if (attempt < retries) {
        console.log(`[Database] Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('[Database] Exhausted all retries connecting to MongoDB cluster.');
        process.exit(1);
      }
    }
  }
};
