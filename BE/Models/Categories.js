const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục không được để trống'],
      unique: true,
      trim: true
    },
    description: { 
      type: String, 
      default: '' 
    },
    // Slug dùng cho URL, tự động sinh nếu không có
    slug: {
      type: String,
      unique: true,
      trim: true
    },
    // URL của hình ảnh đại diện cho danh mục
    image: {
      type: String,
      default: ''
    },
    // Hỗ trợ phân cấp danh mục, danh mục con có thể tham chiếu đến danh mục cha
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    // Thông tin meta để tối ưu SEO
    seo: {
      metaTitle: { 
        type: String, 
        default: '' 
      },
      metaKeywords: { 
        type: String, 
        default: '' 
      },
      metaDescription: { 
        type: String, 
        default: '' 
      }
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active'
    },
    // Trường hỗ trợ sắp xếp thứ tự hiển thị cho danh mục
    position: { 
      type: Number, 
      default: 0 
    }
  },
  {
    // Quản lý tự động createdAt và updatedAt
    timestamps: true
  }
);

// Hook "pre save" để tự động tạo slug nếu chưa có
CategorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: 'vi'
    });
  }
  next();
});

// Hook "pre findOneAndUpdate" để cập nhật slug nếu tên danh mục thay đổi
CategorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, {
      lower: true,
      strict: true,
      locale: 'vi'
    });
  }
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Category', CategorySchema);