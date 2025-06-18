import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const accountService = {
    // Lấy tất cả người dùng với phân trang và bộ lọc
    getAllUsers: async (params = {}) => {
        try {
            const { page = 1, limit = 10, fullName, email, phone, role, sortBy, sortOrder } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(fullName && { fullName }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(role && { role }),
                ...(sortBy && { sortBy }),
                ...(sortOrder && { sortOrder })
            });

            const response = await axios.get(`${API_URL}/admin/accounts?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy thông tin người dùng theo ID
    getUserById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/accounts/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Tạo người dùng mới
    createUser: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/accounts`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật thông tin người dùng
    updateUser: async (id, userData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/accounts/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Xóa người dùng
    deleteUser: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/accounts/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default accountService; 