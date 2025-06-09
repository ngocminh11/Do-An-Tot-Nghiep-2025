import axios from 'axios';

const API_URL = 'http://localhost:5000';

const categoryService = {
    // Lấy tất cả danh mục với các tùy chọn lọc
    getAllCategories: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/categories`);
            // Kiểm tra và trả về data từ response
            return response.data || [];
        } catch (error) {
            console.error('Error in getAllCategories:', error);
            return [];
        }
    },

    // Lấy danh mục theo ID
    getCategoryById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/categories/${id}`);
            return response.data?.data || null;
        } catch (error) {
            console.error('Error in getCategoryById:', error);
            return null;
        }
    },

    // Tạo danh mục mới
    createCategory: async (categoryData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/categories`, categoryData);
            return response.data?.data || null;
        } catch (error) {
            console.error('Error in createCategory:', error);
            throw error;
        }
    },

    // Cập nhật danh mục
    updateCategory: async (id, categoryData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/categories/${id}`, categoryData);
            return response.data?.data || null;
        } catch (error) {
            console.error('Error in updateCategory:', error);
            throw error;
        }
    },

    // Xóa danh mục
    deleteCategory: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/categories/${id}`);
            return response.data || null;
        } catch (error) {
            console.error('Error in deleteCategory:', error);
            throw error;
        }
    }
};

export default categoryService; 