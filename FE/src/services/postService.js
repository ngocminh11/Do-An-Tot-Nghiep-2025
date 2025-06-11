import axios from 'axios';

const API_URL = 'http://localhost:5000';

const postService = {
    // Lấy tất cả bài viết
    getAllPosts: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/posts`, { params });
            return response.data;
        } catch (error) {
            console.error('Error in getAllPosts:', error);
            throw error.response?.data || error;
        }
    },

    // Lấy bài viết theo ID
    getPostById: async (id) => {
        try {
            console.log('Fetching post with id:', id);
            const response = await axios.get(`${API_URL}/admin/posts/${id}`);
            console.log('Post response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in getPostById:', error);
            throw error.response?.data || error;
        }
    },

    // Tạo bài viết mới
    createPost: async (postData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/posts`, postData);
            return response.data;
        } catch (error) {
            console.error('Error in createPost:', error);
            throw error.response?.data || error;
        }
    },

    // Cập nhật bài viết
    updatePost: async (id, postData) => {
        try {
            console.log('Updating post with data:', { id, postData });
            const response = await axios.put(`${API_URL}/admin/posts/${id}`, postData);
            return response.data;
        } catch (error) {
            console.error('Error in updatePost:', error);
            throw error.response?.data || error;
        }
    },

    // Xóa bài viết
    deletePost: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/posts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error in deletePost:', error);
            throw error.response?.data || error;
        }
    },

    // Upload ảnh
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
            console.error('Error in uploadImage:', error);
            throw error.response?.data || error;
        }
    }
};

export default postService; 