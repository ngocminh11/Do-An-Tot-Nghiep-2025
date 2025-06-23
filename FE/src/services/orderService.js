import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const orderService = {
    // Lấy tất cả đơn hàng
    getAllOrders: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/orders`, { params });
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
    // Lấy chi tiết đơn hàng
    getOrderById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/orders/${id}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: async (id, status) => {
        try {
            const response = await axios.patch(`${API_URL}/admin/orders/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Phản hồi yêu cầu huỷ đơn
    respondCancelRequest: async (id, data) => {
        try {
            const response = await axios.post(`${API_URL}/admin/orders/${id}/respond-cancel`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật đơn hàng
    updateOrder: async (id, orderData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/orders/${id}`, orderData);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa đơn hàng
    deleteOrder: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/orders/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default orderService; 