const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductDetailSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, ref: 'Product' },

    batchCode: { type: String }, // Mã lô hàng

    pricingAndInventory: {
      originalPrice: { type: Number, default: 0 },
      salePrice: { type: Number, default: 0 },
      stockQuantity: { type: Number, default: 0 },
      unit: { type: String },
      currency: { type: String, default: 'VND' }
    },

    description: {
      shortDescription: { type: String },
      detailedDescription: { type: String },
      features: [{ type: String }],
      ingredients: [{ type: String }],
      usageInstructions: [{ type: String }],
      expiration: { type: String }
    },

    technicalDetails: {
      sizeOrWeight: { type: String },
      suitableSkinTypes: [{ type: String }],
      origin: { type: String },
      certifications: [{ type: String }]
    },

    seo: {
      keywords: [{ type: String }],
      metaTitle: { type: String },
      metaDescription: { type: String },
      urlSlug: { type: String, unique: true, index: true }
    },

    policy: {
      shippingReturnWarranty: [{ type: String }],
      additionalOptions: [{ type: String }]
    },

    media: {
      mainImage: { type: String, require: true },
      imageGallery: [{ type: String }],
      videoUrl: { type: String }
    },

    mediaFiles: {
      images: [{
        path: String, filename: String, mimetype: String, size: Number
      }],
      videos: [{
        path: String, filename: String, mimetype: String, size: Number
      }]
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.model('ProductDetail', ProductDetailSchema);
