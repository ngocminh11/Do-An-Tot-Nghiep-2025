import axios from 'axios';

const API_URL = 'http://localhost:5000';

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
<<<<<<< HEAD
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
=======
  // Lấy tất cả sản phẩm với phân trang và bộ lọc
  getAllProducts: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        params: {
          name: params.name || '',
          status: params.status || '',
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
>>>>>>> bc8aecf12629517adc9561412c589bbba5b24af6
    }
  },

  /**
   * Get product details by ID
   */
  async getProductById(id) {
    try {
<<<<<<< HEAD
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
=======
      const response = await axios.get(`${API_URL}/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/admin/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, formData) => {
    try {
      const response = await axios.put(`${API_URL}/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
>>>>>>> bc8aecf12629517adc9561412c589bbba5b24af6
    }
  },

  /**
   * Delete a product by ID
   */
  async deleteProduct(id) {
    try {
<<<<<<< HEAD
      const res = await API.delete(`/admin/products/${id}`);
      return res.data;
    } catch (err) {
      handleError(err, 'deleteProduct');
    }
  },
=======
      const response = await axios.delete(`${API_URL}/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
>>>>>>> bc8aecf12629517adc9561412c589bbba5b24af6
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
