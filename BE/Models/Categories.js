const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  idCategory: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  slug: { type: String, required: true, unique: true, trim: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CategorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

CategorySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Category', CategorySchema);