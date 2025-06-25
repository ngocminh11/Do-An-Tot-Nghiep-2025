import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const commentService = {
    // ========== USER ==========
    // Lấy tất cả bình luận cho user (public)
    getComments: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/comments`, { params });
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
    // Lấy bình luận theo sản phẩm
    getCommentsByProduct: async (productId, params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/comments/product/${productId}`, { params });
            console.log('getCommentsByProduct response:', response.data);

            // Xử lý response structure: data.data.data (nested)
            if (response.data && response.data.data) {
                const responseData = response.data.data;
                return {
                    data: responseData.data || responseData || [],
                    currentPage: responseData.currentPage || 1,
                    totalItems: responseData.totalItems || 0,
                    perPage: responseData.perPage || 10,
                    productId: responseData.productId || productId
                };
            }
            return { data: [], currentPage: 1, totalItems: 0, perPage: 10, productId };
        } catch (error) {
            console.error('Error in getCommentsByProduct:', error);
            throw error.response?.data || error;
        }
    },
    // Tạo bình luận mới (user)
    createComment: async (commentData) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/comments`, commentData, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật bình luận của user
    updateComment: async (id, commentData) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/comments/${id}`, commentData, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa bình luận của user
    deleteComment: async (id) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/comments/${id}`, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy chi tiết bình luận (user)
    getCommentById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/comments/${id}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Phản hồi bình luận (user - có thể dùng cho admin reply)
    replyToComment: async (id, replyContent) => {
        try {
            const accessToken = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/comments/${id}/reply`, { replyContent }, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default commentService; 