import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const promotionService = {
    // Lấy tất cả khuyến mãi
    getAllPromotions: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/promotions`, { params });
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
    // Lấy chi tiết khuyến mãi
    getPromotionById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/promotions/${id}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Tạo khuyến mãi mới
    createPromotion: async (promotionData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/promotions`, promotionData);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật khuyến mãi
    updatePromotion: async (id, promotionData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/promotions/${id}`, promotionData);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa khuyến mãi
    deletePromotion: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/promotions/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default promotionService; 