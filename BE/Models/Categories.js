const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  imageUrl: String
});

module.exports = mongoose.model('Category', CategorySchema);
