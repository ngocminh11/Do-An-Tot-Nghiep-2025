import axios from 'axios';

const API_URL = 'http://localhost:5000';

const categoryService = {
    // Lấy tất cả danh mục
    getAllCategories: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/categories`);
            return response.data;
        } catch (error) {
            console.error('Error in getAllCategories:', error);
            throw error.response?.data || error;
        }
    },

    // Lấy danh mục theo ID
    getCategoryById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/categories/${id}`);
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
                name: categoryData.name,
                description: categoryData.description,
                parentCategory: categoryData.parentCategory,
                status: categoryData.status || 'active',
                position: categoryData.position || 0,
                seo: categoryData.seo || {
                    metaTitle: '',
                    metaKeywords: '',
                    metaDescription: ''
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in createCategory:', error);
            throw error.response?.data || error;
        }
    },

    // Cập nhật danh mục
    updateCategory: async (id, categoryData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/categories/${id}`, {
                name: categoryData.name,
                description: categoryData.description,
                parentCategory: categoryData.parentCategory,
                status: categoryData.status,
                position: categoryData.position,
                seo: categoryData.seo || {
                    metaTitle: '',
                    metaKeywords: '',
                    metaDescription: ''
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in updateCategory:', error);
            throw error.response?.data || error;
        }
    },

    // Xóa danh mục
    deleteCategory: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error in deleteCategory:', error);
            throw error.response?.data || error;
        }
    }
};

export default categoryService; 