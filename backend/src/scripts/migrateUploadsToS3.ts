import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { isS3Configured, uploadToS3 } from '../config/s3.js';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.m4v': 'video/mp4',
};

async function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): Promise<string[]> {
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

async function main() {
  console.log('----------------------------------------------------');
  console.log('🌿 Labdhi Herbs - AWS S3 Media Migration Tool');
  console.log('----------------------------------------------------');

  if (!isS3Configured()) {
    console.error('❌ Error: AWS S3 is not configured in .env!');
    console.error('Please configure:');
    console.error('  AWS_ACCESS_KEY_ID=...');
    console.error('  AWS_SECRET_ACCESS_KEY=...');
    console.error('  AWS_REGION=ap-south-1');
    console.error('  AWS_S3_BUCKET_NAME=...');
    process.exit(1);
  }

  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    console.log('ℹ️ No uploads directory found to migrate.');
    process.exit(0);
  }

  const allFiles = await getAllFiles(uploadDir);
  console.log(`Found ${allFiles.length} files in local uploads directory.\n`);

  let successCount = 0;
  let failCount = 0;

  for (const filePath of allFiles) {
    const relativePath = path.relative(uploadDir, filePath);
    const folder = path.dirname(relativePath) === '.' ? 'uploads' : `uploads/${path.dirname(relativePath).replace(/\\/g, '/')}`;
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimetype = MIME_MAP[ext] || 'application/octet-stream';

    try {
      console.log(`⏳ Uploading: ${relativePath}...`);
      const result = await uploadToS3({
        filePath,
        filename,
        mimetype,
        folder,
      });
      console.log(`   ✅ S3 URL: ${result.url}`);
      successCount++;
    } catch (err: any) {
      console.error(`   ❌ Failed: ${err.message}`);
      failCount++;
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`🎉 Migration Completed!`);
  console.log(`   Total: ${allFiles.length}`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log('----------------------------------------------------');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
