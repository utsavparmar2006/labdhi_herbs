import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import dotenv from 'dotenv';

// Ensure .env is loaded
dotenv.config();

export const getS3Config = () => {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-south-1',
    bucketName: process.env.AWS_S3_BUCKET_NAME || '',
    customDomain: process.env.AWS_S3_CUSTOM_DOMAIN || '',
  };
};

/**
 * Checks if AWS S3 credentials and bucket are configured in .env
 */
export const isS3Configured = (): boolean => {
  const config = getS3Config();
  return Boolean(
    config.accessKeyId.trim() &&
    config.secretAccessKey.trim() &&
    config.bucketName.trim() &&
    !config.accessKeyId.includes('your_aws')
  );
};

let _s3Client: S3Client | null = null;

export const getS3Client = (): S3Client => {
  if (!_s3Client) {
    const config = getS3Config();
    _s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return _s3Client;
};

/**
 * Uploads a local file or buffer to AWS S3 bucket using multipart upload
 */
export async function uploadToS3(params: {
  filePath?: string;
  buffer?: Buffer;
  stream?: Readable;
  filename: string;
  mimetype: string;
  folder?: string;
}): Promise<{ url: string; key: string; bucket: string }> {
  if (!isS3Configured()) {
    throw new Error('AWS S3 is not configured. Please add AWS credentials in .env file.');
  }

  const config = getS3Config();
  const folder = params.folder ? params.folder.replace(/^\/|\/$/g, '') : 'uploads';
  const key = `${folder}/${params.filename}`;

  let body: Readable | Buffer;
  if (params.buffer) {
    body = params.buffer;
  } else if (params.stream) {
    body = params.stream;
  } else if (params.filePath && fs.existsSync(params.filePath)) {
    body = fs.createReadStream(params.filePath);
  } else {
    throw new Error('Invalid upload source: filePath, buffer or stream is required');
  }

  const parallelUpload = new Upload({
    client: getS3Client(),
    params: {
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: params.mimetype,
    },
    queueSize: 4,
    partSize: 1024 * 1024 * 5, // 5MB part size for multipart upload
    leavePartsOnError: false,
  });

  await parallelUpload.done();

  // Resolve public accessible URL
  let publicUrl = '';
  if (config.customDomain) {
    const domain = config.customDomain.replace(/\/$/, '');
    publicUrl = `${domain}/${key}`;
  } else {
    publicUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
  }

  return {
    url: publicUrl,
    key,
    bucket: config.bucketName,
  };
}

/**
 * Deletes an object from AWS S3 bucket
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  if (!isS3Configured()) return false;

  try {
    const config = getS3Config();
    const cleanKey = key.replace(/^https?:\/\/[^/]+\//, '');
    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: cleanKey,
      })
    );
    return true;
  } catch (error) {
    console.error('Failed to delete S3 file:', error);
    return false;
  }
}

/**
 * Lists media files directly from AWS S3 bucket
 */
export async function listS3Files(prefix: string = 'uploads/'): Promise<
  Array<{
    filename: string;
    url: string;
    type: 'image' | 'video';
    size: number;
    updatedAt: Date;
  }>
> {
  if (!isS3Configured()) return [];

  try {
    const config = getS3Config();
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      Prefix: prefix,
      MaxKeys: 200,
    });

    const response = await getS3Client().send(command);
    if (!response.Contents) return [];

    const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];

    return response.Contents.filter((item) => item.Key && !item.Key.endsWith('/'))
      .map((item) => {
        const key = item.Key!;
        const filename = path.basename(key);
        const ext = path.extname(filename).toLowerCase();
        const isVideo = videoExts.includes(ext);

        let url = '';
        if (config.customDomain) {
          const domain = config.customDomain.replace(/\/$/, '');
          url = `${domain}/${key}`;
        } else {
          url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
        }

        return {
          filename,
          url,
          type: isVideo ? ('video' as const) : ('image' as const),
          size: item.Size || 0,
          updatedAt: item.LastModified || new Date(),
        };
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (err) {
    console.error('Failed to list S3 objects:', err);
    return [];
  }
}
