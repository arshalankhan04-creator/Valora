const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    
    // Initialize array to track written files for cleanup on error
    if (!req.tempUploadedFiles) {
      req.tempUploadedFiles = [];
    }
    req.tempUploadedFiles.push(path.join(__dirname, '../uploads', filename));
    
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file limit
  fileFilter: fileFilter
});

const uploadImages = (req, res, next) => {
  const uploadMultiple = upload.array('images', 6);

  uploadMultiple(req, res, function (err) {
    if (err) {
      // Robust Cleanup: Delete all written files tracked in tempUploadedFiles
      if (req.tempUploadedFiles && req.tempUploadedFiles.length > 0) {
        req.tempUploadedFiles.forEach(filePath => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.error('Error unlinking temp file:', e.message);
          }
        });
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Upload failed. Max of 6 images allowed per listing' });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Upload failed. File size too large. Max limit is 5MB per image' });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

module.exports = { uploadImages };
