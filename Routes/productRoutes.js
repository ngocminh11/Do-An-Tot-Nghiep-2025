const express = require("express");
const router = express.Router();
const ProductController = require("../Controllers/productController");

router.get("/search", ProductController.searchProducts);
router.get("/filter", ProductController.filterProducts);
router.get("/all", ProductController.getAllProducts);


module.exports = router;
