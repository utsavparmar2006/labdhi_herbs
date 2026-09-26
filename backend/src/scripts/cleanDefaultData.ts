import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { Review } from '../models/Review.model.js';
import { Blog } from '../models/Blog.model.js';
import { Story } from '../models/Story.model.js';
import mongoose from 'mongoose';

async function runClean() {
  await connectDB();

  const prodCount = await Product.countDocuments();
  console.log(`Current products in DB: ${prodCount}`);
  if (prodCount > 0) {
    const res = await Product.deleteMany({});
    console.log(`✅ Deleted ${res.deletedCount} products from DB.`);
  }

  const catCount = await Category.countDocuments();
  console.log(`Current categories in DB: ${catCount}`);
  if (catCount > 0) {
    const res = await Category.deleteMany({});
    console.log(`✅ Deleted ${res.deletedCount} categories from DB.`);
  }

  // Also clean demo reviews
  const revCount = await Review.countDocuments();
  console.log(`Current reviews in DB: ${revCount}`);
  if (revCount > 0) {
    const res = await Review.deleteMany({});
    console.log(`✅ Deleted ${res.deletedCount} demo reviews from DB.`);
  }

  console.log('🎉 Cleanup complete. Database is now completely clean!');
  await mongoose.disconnect();
  process.exit(0);
}

runClean().catch((err) => {
  console.error('Clean error:', err);
  process.exit(1);
});
