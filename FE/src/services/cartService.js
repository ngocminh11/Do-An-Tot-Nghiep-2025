import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const cartService = {
    // Lấy tất cả giỏ hàng
    getAllCarts: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/carts`, { params });
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
    // Lấy giỏ hàng theo userId
    getCartByUserId: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/admin/carts/${userId}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa giỏ hàng theo userId
    clearCartByUserId: async (userId) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/carts/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default cartService; 