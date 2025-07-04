const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductDetailSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, ref: 'Product' },

    batchCode: { type: String }, // Mã lô hàng

    /** ---------- moved here ---------- */
    pricingAndInventory: {
      originalPrice: { type: Number },            // giá nhập gốc
      salePrice:     { type: Number },            // giá bán
      stockQuantity: { type: Number, default: 0 },
      unit:          { type: String }
    },
    /** --------------------------------- */

    description: {
      shortDescription: { type: String },
      longDescription:  { type: String }
    },

    technicalDetails: {
      origin:      String,
      ingredients: String,
      weight:      String
      // …
    },

    seo: {
      urlSlug: { type: String, unique: true, index: true },
      metaTitle:       String,
      metaDescription: String
    },

    policy: {
      warranty: String,
      exchange: String
    },

    media: {
      mainImage:    String,
      imageGallery: [String],
      videoUrl:     String
    },

    mediaFiles: {
      images: [{
        path: String, filename: String, mimetype: String, size: Number
      }],
      videos: [{
        path: String, filename: String, mimetype: String, size: Number
      }]
    }
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.model('ProductDetail', ProductDetailSchema);
