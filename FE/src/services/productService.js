import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const productService = {
  // Lấy tất cả sản phẩm với phân trang và bộ lọc
  getAllProducts: async (params = {}) => {
    try {
      const { page = 1, limit = 10, name, status, brand, categoryId } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(name && { name }),
        ...(status && { status }),
        ...(brand && { brand }),
        ...(categoryId && { categoryId })
      });

      const response = await axios.get(`${API_URL}/admin/products?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy một sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/admin/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, formData) => {
    try {
      const response = await axios.put(`${API_URL}/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xuất sản phẩm ra Excel
  exportProductsToExcel: async (params = {}) => {
    try {
      const { name, status, brand, categoryId } = params;
      const queryParams = new URLSearchParams({
        ...(name && { name }),
        ...(status && { status }),
        ...(brand && { brand }),
        ...(categoryId && { categoryId })
      });

      const response = await axios.get(`${API_URL}/admin/products/export/csv?${queryParams}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy hình ảnh theo ID
  getImageById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/media/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm gợi ý cho chatbot dựa trên từ khóa/vấn đề da
   * @param {string} query
   * @returns {Promise<Array>} Danh sách sản phẩm phù hợp
   */
  getRecommendedProductsForChatbot: async (query) => {
    const response = await axios.get(`${API_URL}/products/recommend?query=${encodeURIComponent(query)}`);
    return response.data.data || [];
  }
};

export default productService;