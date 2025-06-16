import axios from 'axios';

const API_URL = 'http://localhost:5000';

const productService = {
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
    }
  },

  // Lấy một sản phẩm theo ID
  getProductById: async (id) => {
    try {
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
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

export default productService;