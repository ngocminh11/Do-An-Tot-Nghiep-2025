const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

exports.streamImageById = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    const files = await db.collection('uploads.files').find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh' });
    }

    res.set('Content-Type', files[0].contentType);
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi truy xuất ảnh', error: error.message });
  }
};
