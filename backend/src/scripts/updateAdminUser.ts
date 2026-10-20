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

const updateAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    console.log('[UpdateAdmin] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('[UpdateAdmin] Connected successfully.');

    const newAdminEmail = 'labdhiclinic@gmail.com'.toLowerCase().trim();
    const oldAdminEmail = 'admin@labdhiherbs.com'.toLowerCase().trim();

    // 1. Check if labdhiclinic@gmail.com exists
    let newAdmin = await User.findOne({ email: newAdminEmail });

    if (newAdmin) {
      newAdmin.role = 'admin';
      newAdmin.name = newAdmin.name || 'Labdhi Admin';
      await newAdmin.save();
      console.log(`✅ Existing user ${newAdminEmail} has been elevated to role: 'admin'!`);
    } else {
      newAdmin = await User.create({
        name: 'Labdhi Admin',
        email: newAdminEmail,
        password: 'Admin@123456',
        phone: '+91 93283 49328',
        role: 'admin',
      });
      console.log(`🎉 Created new administrator account for ${newAdminEmail} with role: 'admin'!`);
    }

    // 2. Remove old admin account: admin@labdhiherbs.com
    const delResult = await User.deleteOne({ email: oldAdminEmail });
    if (delResult.deletedCount > 0) {
      console.log(`🗑️ Successfully removed old demo admin account: ${oldAdminEmail}`);
    } else {
      console.log(`ℹ️ Old admin account ${oldAdminEmail} was not found or already deleted.`);
    }

    // 3. Confirm all admins in system
    const allAdmins = await User.find({ role: 'admin' }).select('email name role createdAt');
    console.log('\n--- Active System Administrators ---');
    allAdmins.forEach(adm => console.log(`- ${adm.email} (${adm.name}) [Role: ${adm.role}]`));
    console.log('-------------------------------------\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin user:', error);
    process.exit(1);
  }
};

updateAdmin();
