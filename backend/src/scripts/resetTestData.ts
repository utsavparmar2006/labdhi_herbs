import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dns from 'dns';

// Fix DNS for Windows
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function resetTestData() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  console.log('[Reset] Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('[Reset] Connected successfully.');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed - db instance is undefined');
  }

  // 1. Check existing counts
  const ordersCount = await db.collection('orders').countDocuments();
  const cartsCount = await db.collection('carts').countDocuments();
  const allUsersCount = await db.collection('users').countDocuments();
  const testUsersCount = await db.collection('users').countDocuments({ role: { $ne: 'admin' } });
  const adminUsersCount = await db.collection('users').countDocuments({ role: 'admin' });

  console.log('--- Current Database State ---');
  console.log(`Orders: ${ordersCount}`);
  console.log(`Carts / Abandoned Carts: ${cartsCount}`);
  console.log(`Total Users: ${allUsersCount} (Admins: ${adminUsersCount}, Test Users: ${testUsersCount})`);
  console.log('------------------------------');

  // 2. Delete test orders
  if (ordersCount > 0) {
    const orderRes = await db.collection('orders').deleteMany({});
    console.log(`✅ Deleted ${orderRes.deletedCount} test orders. Orders now start from 0.`);
  } else {
    console.log('ℹ️ No test orders found.');
  }

  // 3. Delete test carts / abandoned carts
  if (cartsCount > 0) {
    const cartRes = await db.collection('carts').deleteMany({});
    console.log(`✅ Deleted ${cartRes.deletedCount} test carts.`);
  } else {
    console.log('ℹ️ No test carts found.');
  }

  // 4. Delete test non-admin users (preserve admin!)
  if (testUsersCount > 0) {
    const userRes = await db.collection('users').deleteMany({ role: { $ne: 'admin' } });
    console.log(`✅ Deleted ${userRes.deletedCount} test user accounts (Preserved ${adminUsersCount} admin account).`);
  } else {
    console.log('ℹ️ No non-admin test users to delete.');
  }

  console.log('🎉 Reset complete! All test data cleaned for production live launch.');
  await mongoose.disconnect();
  process.exit(0);
}

resetTestData().catch((err) => {
  console.error('Reset error:', err);
  process.exit(1);
});
