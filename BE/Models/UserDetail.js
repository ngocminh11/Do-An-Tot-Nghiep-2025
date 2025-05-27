const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  addrId: { type: mongoose.Types.ObjectId, required: true },
  label: { type: String, required: true },
  fullAddr: { type: String, required: true },
  city: { type: String, required: true },
  dist: { type: String, required: true },
  ward: { type: String, required: true },
  isDef: { type: Boolean, default: false }
}, { _id: false });

const userDetailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  addrs: { type: [addressSchema], default: [] }
});

module.exports = mongoose.model('UserDetail', userDetailSchema);
