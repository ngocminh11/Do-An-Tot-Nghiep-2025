const mongoose = require('mongoose');

const productLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  action: {
    type: String,
    enum: [
      'CREATE', // Tạo mới sản phẩm
      'UPDATE', // Cập nhật chung
      'DELETE', // Xóa sản phẩm
      'STATUS', // Đổi trạng thái
      'Nhập kho (phiếu)', // Nhập kho hàng loạt (phiếu)
      'IMPORT', // Nhập kho (từng sản phẩm)
      'EXPORT', // Xuất kho
      'UPDATE_STOCK', // Cập nhật tồn kho
      'UPDATE_PRICE', // Cập nhật giá
      'UPDATE_IMAGE', // Cập nhật ảnh
      'UPDATE_DESCRIPTION', // Cập nhật mô tả
      'UPDATE_TECHNICAL', // Cập nhật kỹ thuật
      'UPDATE_SEO', // Cập nhật SEO
      'UPDATE_POLICY' // Cập nhật chính sách
    ],
    required: true
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Nếu có bảng User, nếu không thì chỉ là ID dạng ObjectId
    default: null
  },
  payload: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProductLog', productLogSchema);
