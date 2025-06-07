const mongoose = require('mongoose');
const stringValidator = {
  validator: function (v) {
    return /^[\p{L}0-9\s,-]+$/u.test(v); 
  },
  message: props => `${props.value} chứa ký tự không hợp lệ.`
};
const wordCountValidator = (min, max) => ({
  validator: function (v) {
    const wordCount = v.trim().split(/\s+/).length;
    return wordCount >= min && wordCount <= max;
  },
  message: props => `${props.path} phải có từ ${min} đến ${max} từ (hiện tại: ${props.value.trim().split(/\s+/).length})`
});


const ProductSchema = new mongoose.Schema({
  idProduct: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: [
      stringValidator,
      wordCountValidator(1, 10) 
    ]
  },
  basicInformation: {
    productName: {
      type: String,
      required: true,
      trim: true,
      validate: [
        stringValidator,
        wordCountValidator(1, 64) 
    ]
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: [
        stringValidator,
        wordCountValidator(1, 10) 
    ]    },
    categoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    }],
    brand: {
      type: String,
      required: true,
      trim: true,
      validate: [
        stringValidator,
        wordCountValidator(1, 64) 
    ]
    }
  },
  pricingAndInventory: {
    originalPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      required: true,
      default: 'VND',
      validate: [
        stringValidator,
        wordCountValidator(1, 999999999) 
    ]
    },
    stockQuantity: { type: Number, required: true, min: 0 },
    unit: {
      type: String,
      required: true,
      validate: [
        stringValidator,
        wordCountValidator(1, 9999) 
    ]
    }
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
    expiration: {
      type: String,
      required: true,
      validate: [
        stringValidator,
        wordCountValidator(1, 3000) 
    ]
    }
  },
  technicalDetails: {
    sizeOrWeight: {
      type: String,
      required: true,
      validate: stringValidator
    },
    suitableSkinTypes: {
      type: [String],
      required: true
    },
    origin: {
      type: String,
      validate: stringValidator
    },
    certifications: {
      type: [String],
      required: true
    }
  },
  seo: {
    keywords: {
      type: String,
      required: true,
      validate: stringValidator
    },
    metaTitle: {
      type: String,
      required: true,
      validate: stringValidator
    },
    metaDescription: {
      type: String,
      required: true
    },
    urlSlug: {
      type: String,
      required: true,
      unique: true,
      validate: stringValidator
    }
  },
  policy: {
    shippingReturnWarranty: {
      type: String,
      required: true
    },
    additionalOptions: {
      type: String,
      required: true
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProductSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

ProductSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

ProductSchema.index({
  'basicInformation.productName': 'text',
  'seo.keywords': 'text'
});

module.exports = mongoose.model('Product', ProductSchema);
