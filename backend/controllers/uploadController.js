import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js';

export const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'noir/products');

    res.status(200).json({
      url:      result.secure_url,
      publicId: result.public_id,
      width:    result.width,
      height:   result.height,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    // Upload all files to Cloudinary in parallel
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'noir/products')
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map((r) => ({
      url:      r.secure_url,
      publicId: r.public_id,
      width:    r.width,
      height:   r.height,
    }));

    res.status(200).json({ images });
  } catch (err) {
    next(err);
  }
};

export const uploadProductImages = async (req, res, next) => {
  try {
    const coverFiles   = req.files?.cover   || [];
    const galleryFiles = req.files?.gallery || [];

    if (coverFiles.length === 0 && galleryFiles.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    // Upload cover and gallery in parallel
    const [coverResults, galleryResults] = await Promise.all([
      Promise.all(coverFiles.map((f)   => uploadToCloudinary(f.buffer, 'noir/products/covers'))),
      Promise.all(galleryFiles.map((f) => uploadToCloudinary(f.buffer, 'noir/products/gallery'))),
    ]);

    const formatResult = (r) => ({
      url:      r.secure_url,
      publicId: r.public_id,
      width:    r.width,
      height:   r.height,
    });

    res.status(200).json({
      cover:   coverResults.map(formatResult)[0] || null,
      gallery: galleryResults.map(formatResult),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { url, publicId } = req.body;

    const id = publicId || getPublicIdFromUrl(url);
    if (!id) {
      return res.status(400).json({ message: 'Provide a valid Cloudinary URL or publicId' });
    }

    await deleteFromCloudinary(id);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (err) {
    next(err);
  }
};
