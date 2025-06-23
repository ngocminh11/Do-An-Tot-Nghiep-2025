import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const commentService = {
    // Lấy tất cả bình luận
    getAllComments: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/comments`, { params });
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
    // Lấy chi tiết bình luận
    getCommentById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/comments/${id}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa bình luận
    deleteComment: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/comments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Trả lời bình luận
    replyToComment: async (id, replyData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/comments/reply/${id}`, replyData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default commentService; 