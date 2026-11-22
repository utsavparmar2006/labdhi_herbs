import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { optimizeImageFile, optimizeVideoFile, isFfmpegAvailable } from '../utils/mediaOptimizer.js';
import { isS3Configured, getS3Client, getS3Config, uploadToS3 } from '../config/s3.js';
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { HomePageConfig } from '../models/HomePageConfig.model.js';
import SiteSettings from '../models/SiteSettings.model.js';
import { Blog } from '../models/Blog.model.js';
import { Story } from '../models/Story.model.js';
import { Review } from '../models/Review.model.js';

dotenv.config();

async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function compressExistingMedia() {
  const rootDir = process.cwd();
  const uploadDir = path.join(rootDir, 'uploads');
  const frontendVideosDir = path.resolve(rootDir, '../frontend/public/videos');

  console.log('=====================================================');
  console.log('   Labdhi Herbs - Media Batch Compression Utility    ');
  console.log('=====================================================');

  const s3Ready = isS3Configured();
  const ffmpegReady = await isFfmpegAvailable();

  console.log(`[Status] AWS S3 / CloudFront Media: ${s3Ready ? 'ACTIVE' : 'INACTIVE'}`);
  console.log(`[Status] Local Uploads Folder:       ${fs.existsSync(uploadDir) ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`[Status] FFmpeg Video Compression:   ${ffmpegReady ? 'READY' : 'NOT AVAILABLE'}\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let successCount = 0;
  const migratedFilenameMap = new Map<string, string>(); // oldName -> newName

  // ========================================================
  // 1. COMPRESS LOCAL / EC2 SERVER DISK MEDIA
  // ========================================================
  const localImageFiles: string[] = [];
  const localVideoFiles: string[] = [];

  function scanFolder(folder: string) {
    if (!fs.existsSync(folder)) return;
    const entries = fs.readdirSync(folder, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        scanFolder(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const stats = fs.statSync(fullPath);
        if (['.jpg', '.jpeg', '.png'].includes(ext) && stats.size > 80 * 1024) {
          localImageFiles.push(fullPath);
        } else if (['.mp4', '.mov', '.webm'].includes(ext) && !entry.name.includes('_optimized')) {
          localVideoFiles.push(fullPath);
        }
      }
    }
  }

  scanFolder(uploadDir);
  if (fs.existsSync(frontendVideosDir)) {
    scanFolder(frontendVideosDir);
  }

  if (localImageFiles.length > 0 || localVideoFiles.length > 0) {
    console.log(`[Server Disk] Found ${localImageFiles.length} images and ${localVideoFiles.length} videos on server hard drive.`);

    // Optimize local images
    for (const filePath of localImageFiles) {
      const statsBefore = fs.statSync(filePath);
      const oldFilename = path.basename(filePath);
      totalOriginal += statsBefore.size;

      try {
        const result = await optimizeImageFile(filePath, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 84,
        });

        totalOptimized += result.size;
        successCount++;
        migratedFilenameMap.set(oldFilename, result.filename);

        // Sync optimized file to S3 if active
        if (s3Ready && result.filename !== oldFilename) {
          try {
            const relFolder = path.relative(uploadDir, path.dirname(result.optimizedPath)).replace(/\\/g, '/');
            const s3Folder = relFolder && relFolder !== '.' ? `uploads/${relFolder}` : 'uploads';
            await uploadToS3({
              filePath: result.optimizedPath,
              filename: result.filename,
              mimetype: result.mimetype,
              folder: s3Folder,
            });
          } catch (s3Err: any) {
            console.warn(`[S3 Sync Warning] Failed to upload ${result.filename} to S3:`, s3Err.message);
          }
        }
      } catch (err: any) {
        console.warn(`Failed to optimize ${filePath}:`, err?.message || err);
        totalOptimized += statsBefore.size;
      }
    }

    // Optimize local videos
    if (ffmpegReady) {
      for (const videoPath of localVideoFiles) {
        const statsBefore = fs.statSync(videoPath);
        totalOriginal += statsBefore.size;

        try {
          const result = await optimizeVideoFile(videoPath);
          totalOptimized += result.size;
          if (result.compressed) successCount++;
        } catch (err: any) {
          console.warn(`Failed to compress video ${videoPath}:`, err?.message || err);
          totalOptimized += statsBefore.size;
        }
      }
    }
  }

  // ========================================================
  // 2. COMPRESS AWS S3 CLOUD MEDIA DIRECTLY
  // ========================================================
  if (s3Ready) {
    try {
      console.log('\n[AWS S3 Cloud] Scanning files directly inside S3 bucket...');
      const s3Client = getS3Client();
      const s3Config = getS3Config();

      const listRes = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: s3Config.bucketName,
          Prefix: 'uploads/',
          MaxKeys: 500,
        })
      );

      if (listRes.Contents && listRes.Contents.length > 0) {
        console.log(`[AWS S3 Cloud] Found ${listRes.Contents.length} objects in bucket.`);

        // @ts-ignore
        const sharp = await import('sharp').then((m) => m.default || m).catch(() => null);

        for (const item of listRes.Contents) {
          if (!item.Key || item.Key.endsWith('/')) continue;
          const ext = path.extname(item.Key).toLowerCase();

          // Only compress heavy PNG/JPG files (> 80KB)
          if (['.png', '.jpg', '.jpeg'].includes(ext) && (item.Size || 0) > 80 * 1024) {
            const webpKey = item.Key.replace(/\.(png|jpe?g)$/i, '.webp');
            const alreadyExists = listRes.Contents.some((c) => c.Key === webpKey);

            if (!alreadyExists && sharp) {
              const originalBytes = item.Size || 0;
              totalOriginal += originalBytes;

              try {
                console.log(`[AWS S3 Cloud] Downloading & Compressing: ${item.Key} (${Math.round(originalBytes / 1024)}KB)...`);
                const getObj = await s3Client.send(
                  new GetObjectCommand({
                    Bucket: s3Config.bucketName,
                    Key: item.Key,
                  })
                );

                const buffer = await streamToBuffer(getObj.Body);

                // Proportional scale without cropping (up to 1920px max)
                const compressedBuffer = await sharp(buffer)
                  .rotate()
                  .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
                  .webp({ quality: 84, effort: 6, alphaQuality: 92 })
                  .toBuffer();

                // Upload optimized WebP to S3 with 1-year immutable caching
                await s3Client.send(
                  new PutObjectCommand({
                    Bucket: s3Config.bucketName,
                    Key: webpKey,
                    Body: compressedBuffer,
                    ContentType: 'image/webp',
                    CacheControl: 'public, max-age=31536000, immutable',
                  })
                );

                totalOptimized += compressedBuffer.length;
                successCount++;

                const oldBase = path.basename(item.Key);
                const newBase = path.basename(webpKey);
                migratedFilenameMap.set(oldBase, newBase);

                console.log(`[AWS S3 Cloud] ✓ Saved: ${newBase} (${Math.round(compressedBuffer.length / 1024)}KB)`);
              } catch (s3Err: any) {
                console.warn(`[AWS S3 Cloud] Notice for ${item.Key}:`, s3Err.message);
                totalOptimized += originalBytes;
              }
            }
          }
        }
      }
    } catch (s3ListErr: any) {
      console.warn('[AWS S3 Cloud Warning] Could not list S3 bucket objects:', s3ListErr.message);
    }
  }

  // ========================================================
  // 3. UPDATE MONGODB DATABASE URL REFERENCES
  // ========================================================
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && migratedFilenameMap.size > 0) {
    try {
      console.log('\n[Database] Connecting to MongoDB to update URL references...');
      await mongoose.connect(mongoUri);
      console.log('[Database] Connected. Updating document image fields to .webp...');

      let updatedDocs = 0;

      for (const [oldName, newName] of migratedFilenameMap.entries()) {
        const oldRegex = new RegExp(oldName, 'i');

        // Update Products
        const prodRes = await Product.updateMany(
          { $or: [{ image: oldRegex }, { hoverImage: oldRegex }, { images: oldRegex }] },
          [
            {
              $set: {
                image: { $replaceAll: { input: '$image', find: oldName, replacement: newName } },
                hoverImage: { $replaceAll: { input: '$hoverImage', find: oldName, replacement: newName } },
              },
            },
          ]
        );
        updatedDocs += prodRes.modifiedCount || 0;

        // Update Categories
        const catRes = await Category.updateMany(
          { $or: [{ image: oldRegex }, { bannerImage: oldRegex }] },
          [
            {
              $set: {
                image: { $replaceAll: { input: '$image', find: oldName, replacement: newName } },
                bannerImage: { $replaceAll: { input: '$bannerImage', find: oldName, replacement: newName } },
              },
            },
          ]
        );
        updatedDocs += catRes.modifiedCount || 0;

        // Update Blogs
        const blogRes = await Blog.updateMany({ image: oldRegex }, [
          {
            $set: {
              image: { $replaceAll: { input: '$image', find: oldName, replacement: newName } },
            },
          },
        ]);
        updatedDocs += blogRes.modifiedCount || 0;

        // Update Stories
        const storyRes = await Story.updateMany(
          { $or: [{ thumbnail: oldRegex }, { videoUrl: oldRegex }] },
          [
            {
              $set: {
                thumbnail: { $replaceAll: { input: '$thumbnail', find: oldName, replacement: newName } },
              },
            },
          ]
        );
        updatedDocs += storyRes.modifiedCount || 0;
      }

      console.log(`[Database] Updated ${updatedDocs} database references to .webp.`);
      await mongoose.disconnect();
    } catch (dbErr: any) {
      console.warn('[Database Notice] Database URL update notice:', dbErr.message);
    }
  }

  const savedBytes = Math.max(0, totalOriginal - totalOptimized);
  const savedMb = (savedBytes / (1024 * 1024)).toFixed(2);
  const totalOrigMb = (totalOriginal / (1024 * 1024)).toFixed(2);
  const totalOptMb = (totalOptimized / (1024 * 1024)).toFixed(2);
  const overallRatio = totalOriginal > 0 ? Math.round((savedBytes / totalOriginal) * 100) : 0;

  console.log('\n=====================================================');
  console.log('                 COMPRESSION SUMMARY                 ');
  console.log('=====================================================');
  console.log(`Processed files:  ${successCount}`);
  console.log(`Original size:    ${totalOrigMb} MB`);
  console.log(`Optimized size:   ${totalOptMb} MB`);
  console.log(`Bandwidth Saved:  ${savedMb} MB (${overallRatio}% reduction!)`);
  console.log('=====================================================\n');
}

compressExistingMedia().catch((err) => {
  console.error('[MediaCompressor] Fatal error:', err);
});
