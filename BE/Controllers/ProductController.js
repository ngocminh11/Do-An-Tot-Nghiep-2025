const ProductService = require("../Services/productService");
const ResponseCode = require("../Constants/ResponseCode");
const ResponseMessage = require("../Constants/ResponseMessage");

const searchProducts = async (req, res) => {
    const { name } = req.query;  // Sử dụng tham số 'name' thay vì 'searchQuery'
    
    if (!name || name.trim() === "") {
      return res.status(ResponseCode.ERROR_BAD_REQUEST).json({
        code: ResponseCode.ERROR_BAD_REQUEST,
        message: ResponseMessage.ERROR_BAD_REQUEST,
      });
    }
      const products = await ProductService.searchProducts(name);  // Tìm kiếm sản phẩm theo tên
    
      if (products.length === 0) {
        return res.status(ResponseCode.ERROR_NOT_FOUND).json({
          code: ResponseCode.ERROR_NOT_FOUND,
          message: ResponseMessage.ERROR_PRODUCT_NOT_FOUND,
          data: [],
        });
      }
  
      return res.status(ResponseCode.SUCCESS_OK).json({
        code: ResponseCode.SUCCESS_OK,
        message: ResponseMessage.SUCCESS_PRODUCT_FOUND,
        data: products,
      });
  };
  

const filterProducts = async (req, res) => {
  try {
    const filter = req.query;
    const products = await ProductService.filterProducts(filter);

    res.status(ResponseCode.SUCCESS_OK).json({
      code: ResponseCode.SUCCESS_OK,
      message: ResponseMessage.SUCCESS_PRODUCT_FOUND,
      data: products,
    });
  } catch (err) {
    res.status(ResponseCode.ERROR_INTERNAL_SERVER).json({
      code: ResponseCode.ERROR_INTERNAL_SERVER,
      message: ResponseMessage.ERROR_INTERNAL_SERVER,
    });
  }
};

const getAllProducts = async (req, res) => {
    try {
      const products = await ProductService.getAllProducts();
  
      res.status(ResponseCode.SUCCESS_OK).json({
        code: ResponseCode.SUCCESS_OK,
        message: ResponseMessage.SUCCESS_PRODUCT_FOUND,
        data: products,
      });
    } catch (err) {
      res.status(ResponseCode.ERROR_INTERNAL_SERVER).json({
        code: ResponseCode.ERROR_INTERNAL_SERVER,
        message: ResponseMessage.ERROR_INTERNAL_SERVER,
      });
    }
  };

  
module.exports = {
    searchProducts,
    filterProducts,
    getAllProducts,
  };