const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    // Thông tin cơ bản của sản phẩm
    basicInformation: {
      productName: {
        type: String,
        required: true,
        trim: true
      },
      sku: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },
      brand: {
        type: String,
        default: 'CoCo'
      },

      status: {
        type: String,
        enum: ['Hiển Thị', 'Ẩn', 'Ngừng Bán'],
        default: 'Hiển Thị',
        index: true
      },

      categoryIds: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category',
          index: true
        }
      ],

      tagIds: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Tag',
          required: true
        }
      ],
    },
    // Tham chiếu 1-1 tới bảng chi tiết sản phẩm
    detailId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductDetail',
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true // Tự động tạo createdAt & updatedAt
  }
);

module.exports = mongoose.model('Product', ProductSchema);
