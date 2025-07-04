import api from './axiosInstance';

const postService = {
    // Lấy tất cả bài viết (có phân trang)
    getAllPosts: async (params = {}) => {
        try {
            const response = await api.get('/admin/posts', { params });
            if (response.data && response.data.data) {
                return {
                    data: response.data.data.data,
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

    // Lấy bài viết theo ID
    getPostById: async (id) => {
        try {
            const response = await api.get(`/admin/posts/${id}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Tạo bài viết mới
    createPost: async (postData) => {
        try {
            let config = {};
            let data = postData;
            if (postData instanceof FormData) {
                config.headers = { 'Content-Type': 'multipart/form-data' };
            } else {
                config.headers = { 'Content-Type': 'application/json' };
                data = JSON.stringify(postData);
            }
            const response = await api.post('/admin/posts', data, config);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Cập nhật bài viết
    updatePost: async (id, postData) => {
        try {
            const response = await api.put(`/admin/posts/${id}`, postData);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Xóa bài viết
    deletePost: async (id) => {
        try {
            const response = await api.delete(`/admin/posts/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Upload ảnh (nếu có route riêng, cần đồng bộ lại route này)
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await api.post('/admin/upload', formData, {
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