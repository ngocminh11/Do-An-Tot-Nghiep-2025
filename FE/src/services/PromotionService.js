import axios from 'axios';
import config from '../config';
import Cookies from 'js-cookie';

const API_URL = config.API_BASE_URL;

const promotionService = {
    // ========== USER ==========
    // Lấy tất cả khuyến mãi cho user (public)
    getPromotions: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/promotions`, { params });
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
    // Lấy chi tiết khuyến mãi cho user
    getPromotionById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/promotions/${id}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Kiểm tra mã khuyến mãi
    validatePromotionCode: async (code) => {
        try {
            const response = await axios.post(`${API_URL}/promotions/validate`, { code });
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ========== ADMIN ==========
    // Lấy tất cả khuyến mãi (admin)
    getAllPromotions: async (params = {}) => {
        try {
            const token = Cookies.get('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`${API_URL}/admin/promotions`, { params, headers });
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
    // Lấy chi tiết khuyến mãi (admin)
    getAdminPromotionById: async (id) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/promotions/${id}`, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Tạo khuyến mãi mới (admin)
    createPromotion: async (promotionData) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/admin/promotions`, promotionData, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật khuyến mãi (admin)
    updatePromotion: async (id, promotionData) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/admin/promotions/${id}`, promotionData, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa khuyến mãi (admin)
    deletePromotion: async (id) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/admin/promotions/${id}`, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Kích hoạt/vô hiệu hóa khuyến mãi (admin)
    togglePromotionStatus: async (id, status) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.patch(`${API_URL}/admin/promotions/${id}/status`,
                { status },
                { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Thống kê khuyến mãi (admin)
    getPromotionStats: async (params = {}) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/promotions/stats`, {
                params,
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            return response.data?.data || {};
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xuất khuyến mãi ra Excel (admin)
    exportPromotions: async (params = {}) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/promotions/export`, {
                params,
                responseType: 'blob',
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default promotionService; 