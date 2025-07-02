import axios from 'axios';
import config from '../config';
import Cookies from 'js-cookie';

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
            const response = await axios.post(`${API_URL}/comments`, commentData);
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật bình luận của user
    updateComment: async (id, commentData) => {
        try {
            const response = await axios.put(`${API_URL}/comments/${id}`, commentData);
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa bình luận của user
    deleteComment: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/comments/${id}`);
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
            const response = await axios.put(`${API_URL}/comments/${id}/reply`, { replyContent });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // ========== ADMIN ==========
    // Lấy tất cả bình luận (admin)
    getAllComments: async (params = {}) => {
        const token = Cookies.get('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        try {
            const response = await axios.get(`${API_URL}/admin/comments`, { params, headers });
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
    // Duyệt hoặc từ chối bình luận
    approveComment: async (id, status) => {
        try {
            const response = await axios.patch(`${API_URL}/admin/comments/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xuất bình luận ra Excel
    exportComments: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/comments/export`, { params, responseType: 'blob' });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy thống kê bình luận
    getCommentStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/comments/stats`);
            return response.data?.data || {};
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default commentService; 