import api from './axiosInstance';

const categoryService = {
    // Lấy tất cả danh mục cho user (public access)
    getCategories: async (params = {}) => {
        try {
            const response = await api.get('/categories', { params });
            // Chuẩn hóa dữ liệu trả về cho FE
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

    // Lấy tất cả danh mục (có phân trang)
    getAllCategories: async (params = {}) => {
        try {
            const response = await api.get('/admin/categories', { params });
            // Chuẩn hóa dữ liệu trả về cho FE
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

    // Lấy danh mục theo ID
    getCategoryById: async (id) => {
        try {
            const response = await api.get(`/categories/${id}`);
            // BE trả về { data: {...} }
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy danh mục kèm theo danh sách sản phẩm
    getCategoryWithProducts: async (id, params = {}) => {
        try {
            const { page = 1, limit = 10, status } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status && { status })
            });

            const response = await api.get(`/categories/${id}/products?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Tạo danh mục mới
    createCategory: async (categoryData) => {
        try {
            const response = await api.post('/admin/categories', {
                name: categoryData.name,
                description: categoryData.description,
                status: categoryData.status || 'active'
            });
            // BE trả về { data: {...}, message }
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Cập nhật danh mục
    updateCategory: async (id, categoryData) => {
        try {
            const response = await api.put(`/admin/categories/${id}`, {
                name: categoryData.name,
                description: categoryData.description,
                status: categoryData.status
            });
            // BE trả về { data: {...}, message }
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Xóa danh mục
    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/admin/categories/${id}`);
            // BE trả về { data: null, message }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default categoryService; 