import api from './axiosInstance';

const orderService = {
    // ========== USER ==========
    // Tạo đơn hàng mới
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy tất cả đơn hàng của user
    getUserOrders: async () => {
        try {
            const response = await api.get('/orders/my-orders');
            return response.data?.data || [];
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy chi tiết đơn hàng của user
    getUserOrderById: async (id) => {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Gửi yêu cầu huỷ đơn hàng (user)
    cancelRequestByUser: async (id) => {
        try {
            const response = await api.post(`/orders/${id}/cancel-request`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ========== ADMIN ==========
    // Lấy tất cả đơn hàng (admin)
    getAllOrders: async (params = {}) => {
        try {
            const response = await api.get('/admin/orders', { params });
            // Trả về object có key data là mảng đơn hàng
            return {
                data: response.data?.data?.data || [],
                currentPage: response.data?.data?.currentPage,
                total: response.data?.data?.total,
                perPage: response.data?.data?.perPage
            };
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy chi tiết đơn hàng (admin)
    getOrderById: async (id) => {
        try {
            const response = await api.get(`/admin/orders/${id}`);
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật trạng thái đơn hàng (admin)
    updateOrderStatus: async (id, data) => {
        try {
            const response = await api.patch(`/admin/orders/${id}/status`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Phản hồi yêu cầu huỷ đơn (admin)
    respondCancelRequest: async (id, data) => {
        try {
            const response = await api.post(`/admin/orders/${id}/respond-cancel`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật đơn hàng (admin)
    updateOrder: async (id, orderData) => {
        try {
            const response = await api.put(`/admin/orders/${id}`, orderData);
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa đơn hàng (admin)
    deleteOrder: async (id) => {
        try {
            const response = await api.delete(`/admin/orders/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Thống kê đơn hàng (admin)
    getOrderStats: async (params = {}) => {
        try {
            const response = await api.get('/admin/orders/stats', { params });
            return response.data?.data || {};
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xuất đơn hàng ra Excel (admin)
    exportOrders: async (params = {}) => {
        try {
            const response = await api.get('/admin/orders/export', {
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