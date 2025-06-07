import axios from 'axios';
import config from '../config/index';

const productService = {
  // Lấy tất cả sản phẩm với phân trang và bộ lọc
  getAllProducts: async (params) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/admin/products`, { params });
      return {
        data: response.data.products || response.data,
        total: response.data.totalItems || response.data.length // Backend might not support pagination yet
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy một sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo sản phẩm mới (sử dụng FormData cho file uploads)
  createProduct: async (formData) => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/admin/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Create product response:', response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật sản phẩm (sử dụng FormData cho file uploads)
  updateProduct: async (id, formData) => {
    try {
      const response = await axios.put(`${config.API_BASE_URL}/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`${config.API_BASE_URL}/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

};

export default productService;