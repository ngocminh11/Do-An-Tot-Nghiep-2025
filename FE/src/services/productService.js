import axios from 'axios';
import config from '../config/index';

const API = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

// Optional: Interceptor để log hoặc xử lý lỗi tập trung (nếu dùng trong dự án lớn)
// API.interceptors.response.use(...);

const productService = {
  /**
   * Get all products with optional pagination, search, category, and sorting
   * @param {Object} params - { page, limit, search, category, sortBy, sortOrder }
   * @returns {Promise<{ data: [], meta: { total, currentPage, pageSize } }>}
   */
  async getAllProducts(params = {}) {
    try {
      const res = await API.get('/admin/products', { params });

      // Chuẩn hóa kết quả trả về theo kiểu { data, meta }
      const { products, totalItems, currentPage, pageSize } = res.data;

      return {
        data: products || res.data,
        meta: {
          total: totalItems ?? res.data.length ?? 0,
          currentPage: currentPage ?? params.page ?? 1,
          pageSize: pageSize ?? params.limit ?? 10,
        },
      };
    } catch (err) {
      handleError(err, 'getAllProducts');
    }
  },

  /**
   * Get product details by ID
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
   * Create new product using FormData
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
   * Update a product by ID
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
   * Delete a product by ID
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

/**
 * Centralized error handler
 */
function handleError(error, fnName = '') {
  const errMsg = error?.response?.data?.message || error.message || 'Unknown error';
  console.error(`productService.${fnName} →`, errMsg);
  throw new Error(errMsg);
}

export default productService;
