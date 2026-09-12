import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dns from 'dns';
import { User } from '../models/User.model.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Fix DNS for Windows
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const seedAdminUser = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] MongoDB Connected successfully.');

    const adminEmail = 'admin@labdhiherbs.com';
    const adminPassword = 'Admin@123456';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Ensure role is admin and update password
      existingAdmin.name = 'Labdhi Admin';
      existingAdmin.role = 'admin';
      existingAdmin.password = adminPassword;
      await existingAdmin.save();

      console.log('----------------------------------------------------');
      console.log('✅ Admin user already exists. Account updated!');
      console.log(`📧 Admin Email:    ${adminEmail}`);
      console.log(`🔑 Admin Password: ${adminPassword}`);
      console.log(`🛡️ Admin Role:     admin`);
      console.log('----------------------------------------------------');
    } else {
      const newAdmin = await User.create({
        name: 'Labdhi Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '+91 93283 49328',
        role: 'admin',
      });

      console.log('----------------------------------------------------');
      console.log('🎉 New Admin User created successfully in MongoDB!');
      console.log(`📧 Admin Email:    ${adminEmail}`);
      console.log(`🔑 Admin Password: ${adminPassword}`);
      console.log(`🛡️ Admin Role:     ${newAdmin.role}`);
      console.log('----------------------------------------------------');
    }

    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdminUser();
