import api from './axiosInstance';

const accountService = {
    // ADMIN: Lấy tất cả người dùng với phân trang và bộ lọc
    getAllUsers: async (params = {}) => {
        try {
            const { page = 1, limit = 10, fullName, email, phone, role, accountStatus, sortBy, sortOrder } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(fullName && { fullName }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(role && { role }),
                ...(accountStatus && { accountStatus }),
                ...(sortBy && { sortBy }),
                ...(sortOrder && { sortOrder })
            });
            const response = await api.get(`/admin/accounts?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // ADMIN: Lấy thông tin người dùng theo ID
    getUserByIdAdmin: async (id) => {
        try {
            const response = await api.get(`/admin/accounts/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // USER: Lấy thông tin người dùng theo ID (cần token)
    getUserById: async (id) => {
        try {
            const response = await api.get(`/accounts/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // USER: Cập nhật thông tin người dùng (cần token)
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/accounts/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // USER: Xóa người dùng (cần token)
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/accounts/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // USER: Tạo người dùng mới (public)
    createUser: async (userData) => {
        try {
            const response = await api.post('/accounts', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default accountService; 