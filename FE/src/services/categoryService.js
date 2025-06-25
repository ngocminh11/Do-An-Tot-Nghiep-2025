import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const categoryService = {
    // Lấy tất cả danh mục cho user (public access)
    getCategories: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/categories`, { params });
            // Chuẩn hóa dữ liệu trả về cho FE
            if (response.data && response.data.data) {
                return {
                    data: response.data.data.data || response.data.data,
                    currentPage: response.data.data.currentPage,
                    totalItems: response.data.data.totalItems,
                    perPage: response.data.data.perPage
                };
            }
            return { data: [], currentPage: 1, totalItems: 0, perPage: 10 };
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy tất cả danh mục (có phân trang)
    getAllCategories: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/categories`, { params });
            // Chuẩn hóa dữ liệu trả về cho FE
            if (response.data && response.data.data) {
                return {
                    data: response.data.data.data,
                    currentPage: response.data.data.currentPage,
                    totalItems: response.data.data.totalItems,
                    perPage: response.data.data.perPage
                };
            }
            return { data: [], currentPage: 1, totalItems: 0, perPage: 10 };
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy danh mục theo ID
    getCategoryById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/categories/${id}`);
            // BE trả về { data: {...} }
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy danh mục kèm theo danh sách sản phẩm
    getCategoryWithProducts: async (id, params = {}) => {
        try {
            const { page = 1, limit = 10, status } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status && { status })
            });

            const response = await axios.get(`${API_URL}/categories/${id}/products?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Tạo danh mục mới
    createCategory: async (categoryData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/categories`, {
                name: categoryData.name,
                description: categoryData.description,
                status: categoryData.status || 'active'
            });
            // BE trả về { data: {...}, message }
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Cập nhật danh mục
    updateCategory: async (id, categoryData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/categories/${id}`, {
                name: categoryData.name,
                description: categoryData.description,
                status: categoryData.status
            });
            // BE trả về { data: {...}, message }
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Xóa danh mục
    deleteCategory: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/categories/${id}`);
            // BE trả về { data: null, message }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default categoryService; 