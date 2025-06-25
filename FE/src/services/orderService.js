import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const orderService = {
    // ========== USER ==========
    // Tạo đơn hàng mới
    createOrder: async (orderData) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/orders`,
                orderData,
                accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy tất cả đơn hàng của user
    getUserOrders: async () => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/orders/my-orders`,
                accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}
            );
            return response.data?.data || [];
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy chi tiết đơn hàng của user
    getUserOrderById: async (id) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/orders/${id}`,
                accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}
            );
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Gửi yêu cầu huỷ đơn hàng (user)
    cancelRequestByUser: async (id) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/orders/${id}/cancel-request`,
                {},
                accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ========== ADMIN ==========
    // Lấy tất cả đơn hàng (admin)
    getAllOrders: async (params = {}) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/orders`, {
                params,
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
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
            const accessToken = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/admin/orders/${id}`,
                accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}
            );
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật trạng thái đơn hàng (admin)
    updateOrderStatus: async (id, status) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.patch(
                `${API_URL}/admin/orders/${id}/status`,
                { status },
                accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Phản hồi yêu cầu huỷ đơn (admin)
    respondCancelRequest: async (id, data) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/admin/orders/${id}/respond-cancel`,
                data,
                accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật đơn hàng (admin)
    updateOrder: async (id, orderData) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/admin/orders/${id}`,
                orderData,
                accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}
            );
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa đơn hàng (admin)
    deleteOrder: async (id) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.delete(
                `${API_URL}/admin/orders/${id}`,
                accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Thống kê đơn hàng (admin)
    getOrderStats: async (params = {}) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/orders/stats`, {
                params,
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            return response.data?.data || {};
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xuất đơn hàng ra Excel (admin)
    exportOrders: async (params = {}) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/orders/export`, {
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

export default orderService; 