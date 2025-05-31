const Product = require("../Models/ProductModel");
const ConstantMessage = require("../Constants/ResponseMessage");


const createCategory = async (categoryName) => {
};

const searchProducts = async (name) => {
  try {
    return await Product.find({
      product_name: { $regex: name, $options: "i" }
    });
  } catch (error) {
    const err = new Error(`${ConstantMessage.ERROR_SEARCH_PRODUCT}: ${error.message}`);
    throw err;
  }
};

const filterProducts = async (filter) => {
  const query = {};

  if (filter.priceMin !== undefined) {
    query.price = { $gte: filter.priceMin };
  }

  if (filter.priceMax !== undefined) {
    query.price = {
      ...(query.price || {}),
      $lte: filter.priceMax
    };
  }

  if (filter.brand) {
    query.brand = filter.brand;
  }

  if (filter.category) {
    query.category = filter.category;
  }

  return Product.find(query);
};

const getAllProducts = () => Product.find({});

module.exports = {
  createCategory,
  searchProducts: searchProducts,
  filterProducts,
  getAllProducts
};



