const express = require("express");
const router = express.Router();

// Import Controllers
const ProductController = require('../Controllers/ProductController');

//  Products 's route
router.get("/search", ProductController.searchProducts);
router.get("/filter", ProductController.filterProducts);
router.get("/all", ProductController.getAllProducts);


module.exports = router;
