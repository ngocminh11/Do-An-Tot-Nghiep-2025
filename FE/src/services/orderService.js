import axios from 'axios';
import config from '../config';
import Cookies from 'js-cookie';

const API_URL = config.API_BASE_URL;

const orderService = {
    // ========== USER ==========
    // Tạo đơn hàng mới
    createOrder: async (orderData) => {
        try {
            const response = await axios.post(
                `${API_URL}/orders`,
                orderData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy tất cả đơn hàng của user
    getUserOrders: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/orders/my-orders`
            );
            return response.data?.data || [];
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy chi tiết đơn hàng của user
    getUserOrderById: async (id) => {
        try {
            const response = await axios.get(
                `${API_URL}/orders/${id}`
            );
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Gửi yêu cầu huỷ đơn hàng (user)
    cancelRequestByUser: async (id) => {
        try {
            const response = await axios.post(
                `${API_URL}/orders/${id}/cancel-request`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ========== ADMIN ==========
    // Lấy tất cả đơn hàng (admin)
    getAllOrders: async (params = {}) => {
        const token = Cookies.get('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        try {
            const response = await axios.get(`${API_URL}/admin/orders`, { params, headers });
            if (response.data && response.data.data) {
                return {
                    data: response.data.data.data || response.data.data,
                    currentPage: response.data.data.currentPage,
                    total: response.data.data.total,
                    perPage: response.data.data.perPage
                };
            }
            return { data: [], currentPage: 1, total: 0, perPage: 10 };
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy chi tiết đơn hàng (admin)
    getOrderById: async (id) => {
        try {
            const response = await axios.get(
                `${API_URL}/admin/orders/${id}`
            );
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật trạng thái đơn hàng (admin)
    updateOrderStatus: async (id, status) => {
        try {
            const response = await axios.patch(
                `${API_URL}/admin/orders/${id}/status`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Phản hồi yêu cầu huỷ đơn (admin)
    respondCancelRequest: async (id, data) => {
        try {
            const response = await axios.post(
                `${API_URL}/admin/orders/${id}/respond-cancel`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật đơn hàng (admin)
    updateOrder: async (id, orderData) => {
        try {
            const response = await axios.put(
                `${API_URL}/admin/orders/${id}`
            );
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa đơn hàng (admin)
    deleteOrder: async (id) => {
        try {
            const response = await axios.delete(
                `${API_URL}/admin/orders/${id}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Thống kê đơn hàng (admin)
    getOrderStats: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/orders/stats`, {
                params
            });
            return response.data?.data || {};
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xuất đơn hàng ra Excel (admin)
    exportOrders: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/orders/export`, {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default orderService; 