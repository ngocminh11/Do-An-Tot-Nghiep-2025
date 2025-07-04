import api from './axiosInstance';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    withCredentials: true
});

const cartService = {
    // ADMIN: Lấy tất cả giỏ hàng
    getAllCarts: async (params = {}) => {
        try {
            const response = await api.get('/admin/carts', { params });
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
    // ADMIN: Lấy giỏ hàng theo userId
    getCartByUserId: async (userId) => {
        try {
            const response = await api.get(`/admin/carts/${userId}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // ADMIN: Xóa giỏ hàng theo userId
    clearCartByUserId: async (userId) => {
        try {
            const response = await api.delete(`/admin/carts/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Lấy giỏ hàng của chính mình
    getMyCart: async () => {
        try {
            const response = await api.get('/carts/my-cart');
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Xóa toàn bộ giỏ hàng của mình
    clearMyCart: async () => {
        try {
            const response = await api.delete('/carts/clear');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Thêm sản phẩm vào giỏ hàng
    addToCart: async (productId, quantity = 1) => {
        try {
            const response = await api.post('/carts/add', { productId, quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Cập nhật số lượng sản phẩm trong giỏ hàng
    updateQuantity: async (productId, quantity) => {
        try {
            const response = await api.put('/carts/update', { productId, quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: async (productId) => {
        try {
            const response = await api.delete('/carts/remove', {
                data: { productId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Lấy đơn hàng của mình
    getUserOrders: async () => {
        try {
            const response = await api.get('/orders/my-orders');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Gửi yêu cầu hủy đơn hàng
    cancelOrder: async (orderId, data = {}) => {
        try {
            const response = await api.post(`/orders/${orderId}/cancel-request`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lắng nghe realtime cập nhật giỏ hàng
    listenCartUpdates: (callback) => {
        socket.on('cart-update', callback);
        return () => socket.off('cart-update', callback);
    }
};

export default cartService; 