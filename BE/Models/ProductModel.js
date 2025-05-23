const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  price: Number,
  created: Date,
  updated: Date,
});

module.exports = mongoose.model("Product", ProductSchema, "SYS_PRODUCT");
