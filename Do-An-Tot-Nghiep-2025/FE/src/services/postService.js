import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const postService = {
    // Lấy tất cả bài viết
    getAllPosts: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/posts`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy bài viết theo ID
    getPostById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/posts/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Tạo bài viết mới
    createPost: async (postData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/posts`, postData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Cập nhật bài viết
    updatePost: async (id, postData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/posts/${id}`, postData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Xóa bài viết
    deletePost: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/posts/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Upload ảnh (nếu backend hỗ trợ)
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await axios.post(`${API_URL}/admin/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default postService; 