import multer from 'multer';
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, webp, gif)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5 MB per file
    files:    10,                  // max 10 files at once
  },
});

export const uploadSingle = upload.single('image');

export const uploadMultiple = upload.array('images', 10);

export const uploadFields = upload.fields([
  { name: 'cover',   maxCount: 1  },
  { name: 'gallery', maxCount: 9  },
]);

export const handleMulterError = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5 MB.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. Maximum is 10.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }

    // Custom file-filter error
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    next();
  });
};
