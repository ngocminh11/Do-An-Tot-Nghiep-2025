const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: Number, required: true }, // 1: Admin, 2: Staff, 3: Customer
  email: { type: String, required: true, unique: true },
  pwdHash: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
