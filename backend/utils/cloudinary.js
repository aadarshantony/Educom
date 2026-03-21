import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

let _configured = false;

const configure = () => {
  if (_configured) return;

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error(
      'Missing Cloudinary env vars. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env'
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  _configured = true;
};

export const uploadToCloudinary = (buffer, folder = 'noir/products') => {
  configure();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  configure();
  return cloudinary.uploader.destroy(publicId);
};

export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  const parts       = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  const afterUpload    = parts.slice(uploadIndex + 1);
  const withoutVersion = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
  return withoutVersion.join('/').replace(/\.[^/.]+$/, ''); 
};

export default cloudinary;