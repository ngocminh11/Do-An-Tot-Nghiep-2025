import axios from 'axios';
import config from '../config/index';

const API = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

// Centralized error handler
function handleError(error, fnName = '') {
  const errMsg = error?.response?.data?.message || error.message || 'Unknown error';
  console.error(`productService.${fnName} →`, errMsg);
  throw new Error(errMsg);
}

const productService = {
  /**
   * Lấy tất cả sản phẩm với optional pagination, search, category, sorting.
   * @param {Object} params - { page, limit, search, category, sortBy, sortOrder }
   * @returns {Promise<{ data: Array, meta: { total: number, currentPage: number, pageSize: number } }>}
   */
  async getAllProducts(params = {}) {
    try {
      const res = await API.get('/admin/products', { params });
      // Giả sử res.data = { products: [...], totalItems, currentPage, pageSize }
      const { products, totalItems, currentPage, pageSize } = res.data || {};

      // productsArray luôn là mảng
      const dataArray = Array.isArray(products) ? products : [];
      const meta = {
        total: typeof totalItems === 'number' ? totalItems : dataArray.length,
        currentPage: typeof currentPage === 'number' ? currentPage : params.page ?? 1,
        pageSize: typeof pageSize === 'number' ? pageSize : params.limit ?? dataArray.length,
      };
      return { data: dataArray, meta };
    } catch (err) {
      handleError(err, 'getAllProducts');
    }
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getProductById(id) {
    try {
      const res = await API.get(`/admin/products/${id}`);
      return res.data;
    } catch (err) {
      handleError(err, 'getProductById');
    }
  },

  /**
   * Tạo sản phẩm mới (FormData để upload files)
   * @param {FormData} formData
   * @returns {Promise<object>}
   */
  async createProduct(formData) {
    try {
      const res = await API.post('/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (err) {
      handleError(err, 'createProduct');
    }
  },

  /**
   * Cập nhật sản phẩm theo ID (FormData để upload files)
   * @param {string} id
   * @param {FormData} formData
   * @returns {Promise<object>}
   */
  async updateProduct(id, formData) {
    try {
      const res = await API.put(`/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (err) {
      handleError(err, 'updateProduct');
    }
  },

  /**
   * Xóa sản phẩm theo ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  async deleteProduct(id) {
    try {
      const res = await API.delete(`/admin/products/${id}`);
      return res.data;
    } catch (err) {
      handleError(err, 'deleteProduct');
    }
  },
};

export default productService;
