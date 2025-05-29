import axios from 'axios';
import config from '../config/index';

const productService = {
    // Lấy tất cả sản phẩm với phân trang và bộ lọc
    getAllProducts: async (params) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/admin/products`, { params });
            return {
                data: response.data,
                total: response.data.length // Backend doesn't support pagination yet
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

    // Tạo sản phẩm mới
    createProduct: async (productData) => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/admin/products`, {
                ...productData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật sản phẩm
    updateProduct: async (id, productData) => {
        try {
            const response = await axios.put(`${config.API_BASE_URL}/admin/products/${id}`, {
                ...productData,
                updatedAt: new Date()
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

    // Tải lên hình ảnh sản phẩm
    uploadProductImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await axios.post(`${config.API_BASE_URL}/admin/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy danh mục sản phẩm
    getCategories: async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/admin/categories`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

};

export default productService;