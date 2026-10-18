const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const uploadDir = path.join(__dirname, '../../uploads/materials');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate clean sanitized filename with unique suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 50);
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

// File type filter: Allow educational documents and archives
const allowedMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'application/epub+zip',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.epub', '.txt', '.jpg', '.jpeg', '.png', '.webp'];

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext || file.mimetype}. Please upload PDF, Word documents, PowerPoint, ZIP archives, or images.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  }
});

// Middleware for material creation and editing: supports main material file and sample preview file
const uploadMaterialFiles = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return next();
  }

  const multiUpload = upload.fields([
    { name: 'material_file', maxCount: 1 },
    { name: 'preview_file', maxCount: 1 }
  ]);

  multiUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum permitted limit (50 MB).'
        });
      }
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

module.exports = {
  upload,
  uploadMaterialFiles,
  uploadDir
};
