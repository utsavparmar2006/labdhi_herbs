import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows DNS resolution for MongoDB SRV cluster connection strings
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if custom DNS set fails
}

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
    console.log(`[Database] Database Name: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB connection lost. Disconnected.');
    });

  } catch (error) {
    console.error('[Database] Error connecting to MongoDB cluster:', error);
    process.exit(1);
  }
};
