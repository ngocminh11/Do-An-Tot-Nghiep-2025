import axios from 'axios';
import config from '../config/index';

const categoryService = {
    // Lấy tất cả danh mục
    getAllCategories: async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/admin/categories`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy một danh mục theo ID
    getCategoryById: async (id) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Tạo danh mục mới
    createCategory: async (categoryData) => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/admin/categories`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật danh mục
    updateCategory: async (id, categoryData) => {
        try {
            const response = await axios.put(`${config.API_BASE_URL}/admin/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Xóa danh mục
    deleteCategory: async (id) => {
        try {
            const response = await axios.delete(`${config.API_BASE_URL}/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default categoryService; 