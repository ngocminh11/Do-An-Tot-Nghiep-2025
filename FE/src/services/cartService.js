import axios from 'axios';
import config from '../config';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const API_URL = config.API_BASE_URL;

const socket = io('http://localhost:5000', {
    withCredentials: true
});

const cartService = {
    // ADMIN: Lấy tất cả giỏ hàng
    getAllCarts: async (params = {}) => {
        try {
            const token = Cookies.get('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`${API_URL}/admin/carts`, { params, headers });
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
            const token = Cookies.get('token');
            const response = await axios.get(`${API_URL}/admin/carts/${userId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
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
            const token = Cookies.get('token');
            const response = await axios.delete(`${API_URL}/admin/carts/${userId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Lấy giỏ hàng của chính mình
    getMyCart: async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`${API_URL}/carts/my-cart`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
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
            const token = Cookies.get('token');
            const response = await axios.delete(`${API_URL}/carts/clear`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Thêm sản phẩm vào giỏ hàng
    addToCart: async (productId, quantity = 1) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.post(
                `${API_URL}/carts/add`,
                { productId, quantity },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Cập nhật số lượng sản phẩm trong giỏ hàng
    updateQuantity: async (productId, quantity) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.put(
                `${API_URL}/carts/update`,
                { productId, quantity },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: async (productId) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.delete(
                `${API_URL}/carts/remove`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    data: { productId }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Lấy đơn hàng của mình
    getUserOrders: async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`${API_URL}/orders/my-orders`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // USER: Gửi yêu cầu hủy đơn hàng
    cancelOrder: async (orderId, data = {}) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.post(`${API_URL}/orders/${orderId}/cancel-request`, data, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
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