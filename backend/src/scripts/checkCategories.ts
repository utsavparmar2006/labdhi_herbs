import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { Category } from '../models/Category.model.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const cats = await Category.find();
  console.log('=== TOTAL CATEGORIES FOUND IN DB:', cats.length);
  cats.forEach((c) => {
    console.log(`- Category [${c.id}] "${c.name}": subCategories count = ${c.subCategories?.length || 0}`);
    if (c.subCategories && c.subCategories.length > 0) {
      c.subCategories.forEach((sc) => {
        console.log(`    * Sub: [${sc.id}] "${sc.name}" (mainCategoryId: ${sc.mainCategoryId})`);
      });
    }
  });
  await mongoose.disconnect();
}

check().catch(console.error);
