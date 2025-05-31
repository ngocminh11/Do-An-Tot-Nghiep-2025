const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  basicInformation: {
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    categoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    }],
    brand: { type: String, required: true, trim: true }
  },
  pricingAndInventory: {
    originalPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'VND' },
    stockQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true }
  },
  media: {
    mainImage: { type: String, required: true },
    imageGallery: {
      type: [String],
      required: true,
      validate: [arr => arr.length > 0, 'Image gallery must not be empty']
    },
    videoUrl: { type: String, default: null }
  },
  description: {
    shortDescription: { type: String, required: true },
    detailedDescription: { type: String, required: true },
    ingredients: { type: String, required: true },
    usageInstructions: { type: String, required: true },
    expiration: { type: String, required: true }
  },
  technicalDetails: {
  sizeOrWeight: { type: String, required: true },
  suitableSkinTypes: { type: [String], required: true }, 
  origin: { type: String },
  certifications: { type: [String], required: true } 
},
  seo: {
    keywords: { type: String, required: true },
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    urlSlug: { type: String, required: true, unique: true }
  },
  policy: {
    shippingReturnWarranty: { type: String, required: true },
    additionalOptions: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt on save
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware to update updatedAt on findOneAndUpdate
ProductSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Text index for search optimization
ProductSchema.index({
  'basicInformation.productName': 'text',
  'seo.keywords': 'text'
});

module.exports = mongoose.model('Product', ProductSchema);
