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

  // Lấy sản phẩm theo danh mục (public API)
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const { page = 1, limit = 10, status } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });

      const response = await axios.get(`${API_URL}/products/category/${categoryId}?${queryParams}`);
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
  },

  // Lấy sản phẩm theo danh mục (ADMIN API)
  getProductsByCategoryAdmin: async (categoryId, params = {}) => {
    try {
      const { page = 1, limit = 10, status } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });
      const response = await axios.get(`${API_URL}/admin/products/category/${categoryId}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Nhập kho sản phẩm (PATCH /admin/products/:id/inventory)
  updateInventory: async (id, { quantity, originalPrice }) => {
    try {
      const payload = {};
      if (quantity !== undefined && quantity !== null) payload.quantity = quantity;
      if (originalPrice !== undefined && originalPrice !== null) payload.originalPrice = originalPrice;
      const response = await axios.patch(`${API_URL}/admin/products/${id}/inventory`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đổi trạng thái sản phẩm (PATCH /admin/products/:id/status)
  changeStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/admin/products/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy log thao tác của 1 sản phẩm (GET /admin/products/:id/logs)
  getProductLogs: async (id, params = {}) => {
    try {
      const { page = 1, limit = 20 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await axios.get(`${API_URL}/admin/products/${id}/logs?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy toàn bộ log thao tác sản phẩm (GET /admin/products/logs/all)
  getAllProductLogs: async (params = {}) => {
    try {
      const { page = 1, limit = 20 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await axios.get(`${API_URL}/admin/products/logs/all?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Hàm trả về URL đầy đủ cho ảnh
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_URL + path;
}

export default productService;