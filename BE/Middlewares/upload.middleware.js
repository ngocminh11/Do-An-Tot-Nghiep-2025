const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const mongoose = require('mongoose');
const Messages = require('../Constants/ResponseMessage');

// Cấu hình giới hạn
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxSingleSize = 5 * 1024 * 1024;
const maxTotalSize = 30 * 1024 * 1024;
const maxFiles = 6;

// Multer memoryStorage để lấy buffer file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxSingleSize,
  },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error(Messages.INVALID_IMAGE_TYPE), false);
  }
}).array('images', maxFiles);

// Middleware upload ảnh lên GridFS
const uploadImagesToGridFS = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: Messages.NO_IMAGE_PROVIDED });
    }

    // Kiểm tra tổng dung lượng
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      return res.status(400).json({ message: Messages.MAX_TOTAL_SIZE_EXCEEDED });
    }

    try {
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

      const uploadedFiles = [];

      for (const file of req.files) {
        const stream = Readable.from(file.buffer);

        const uploadStream = bucket.openUploadStream(file.originalname, {
          contentType: file.mimetype,
          metadata: {
            uploadedAt: new Date(),
            originalName: file.originalname
          }
        });

        await new Promise((resolve, reject) => {
          stream.pipe(uploadStream)
            .on('error', reject)
            .on('finish', () => {
              uploadedFiles.push({
                _id: uploadStream.id,
                filename: uploadStream.filename,
                contentType: uploadStream.options.contentType,
              });
              resolve();
            });
        });
      }

      req.uploadedImages = uploadedFiles;
      next();

    } catch (uploadErr) {
      console.error('Upload to GridFS error:', uploadErr);
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  });
};

module.exports = uploadImagesToGridFS;
