// Models/UserDetail.js
const mongoose = require('mongoose');

const userDetailSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullname: { type: String, required: true },
  role_id: { type: Number, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  birth_date: { type: Date },
  personal_image: { type: String },  // Image base64
});

module.exports = mongoose.model('UserDetail', userDetailSchema);
