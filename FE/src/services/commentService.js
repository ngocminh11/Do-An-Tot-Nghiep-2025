import api from './axiosInstance';

const commentService = {
    // ========== USER ==========
    // Lấy tất cả bình luận cho user (public)
    getComments: async (params = {}) => {
        try {
            const response = await api.get('/comments', { params });
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
            const response = await api.get(`/comments/product/${productId}`, { params });
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
            const response = await api.post('/comments', commentData);
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật bình luận của user
    updateComment: async (id, commentData) => {
        try {
            const response = await api.put(`/comments/${id}`, commentData);
            return response.data?.data || null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xóa bình luận của user
    deleteComment: async (id) => {
        try {
            const response = await api.delete(`/comments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy chi tiết bình luận (user)
    getCommentById: async (id) => {
        try {
            const response = await api.get(`/comments/${id}`);
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
            const response = await api.put(`/comments/${id}/reply`, { replyContent });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // ========== ADMIN ==========
    // Lấy tất cả bình luận (admin)
    getAllComments: async (params = {}) => {
        try {
            const response = await api.get('/admin/comments', { params });
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
            const response = await api.patch(`/admin/comments/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Xuất bình luận ra Excel
    exportComments: async (params = {}) => {
        try {
            const response = await api.get('/admin/comments/export', { 
                params, 
                responseType: 'blob' 
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Lấy thống kê bình luận
    getCommentStats: async () => {
        try {
            const response = await api.get('/admin/comments/stats');
            return response.data?.data || {};
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default commentService; 