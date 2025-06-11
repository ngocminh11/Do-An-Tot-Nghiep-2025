import axios from 'axios';

const API_URL = 'http://localhost:5000';

const categoryService = {
    // Lấy tất cả danh mục
    getAllCategories: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/categories`, { params });
            return response.data;
        } catch (error) {
            console.error('Error in getAllCategories:', error);
            throw error.response?.data || error;
        }
    },

    // Lấy danh mục theo ID
    getCategoryById: async (idCategory) => {
        try {
            const response = await axios.get(`${API_URL}/admin/categories/${idCategory}`);
            return response.data;
        } catch (error) {
            console.error('Error in getCategoryById:', error);
            throw error.response?.data || error;
        }
    },

    // Tạo danh mục mới
    createCategory: async (categoryData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/categories`, {
                idCategory: categoryData.idCategory,
                name: categoryData.name,
                description: categoryData.description,
                status: categoryData.status || 'active'
            });
            return response.data;
        } catch (error) {
            console.error('Error in createCategory:', error);
            throw error.response?.data || error;
        }
    },

    // Cập nhật danh mục
    updateCategory: async (idCategory, categoryData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/categories/${idCategory}`, {
                name: categoryData.name,
                description: categoryData.description,
                status: categoryData.status
            });
            return response.data;
        } catch (error) {
            console.error('Error in updateCategory:', error);
            throw error.response?.data || error;
        }
    },

    // Xóa danh mục
    deleteCategory: async (idCategory) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/categories/${idCategory}`);
            return response.data;
        } catch (error) {
            console.error('Error in deleteCategory:', error);
            throw error.response?.data || error;
        }
    }
};

export default categoryService; 