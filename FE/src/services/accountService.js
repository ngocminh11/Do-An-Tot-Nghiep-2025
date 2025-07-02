import axios from 'axios';
import config from '../config';
import Cookies from 'js-cookie';

const API_URL = config.API_BASE_URL;

const accountService = {
    // ADMIN: Lấy tất cả người dùng với phân trang và bộ lọc
    getAllUsers: async (params = {}) => {
        try {
            const token = Cookies.get('token');
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
            const response = await axios.get(`${API_URL}/admin/accounts?${queryParams}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // ADMIN: Lấy thông tin người dùng theo ID
    getUserByIdAdmin: async (id) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`${API_URL}/admin/accounts/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // USER: Lấy thông tin người dùng theo ID (cần token)
    getUserById: async (id) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`${API_URL}/accounts/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // USER: Cập nhật thông tin người dùng (cần token)
    updateUser: async (id, userData) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.put(`${API_URL}/accounts/${id}`, userData, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // USER: Xóa người dùng (cần token)
    deleteUser: async (id) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.delete(`${API_URL}/accounts/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // USER: Tạo người dùng mới (public)
    createUser: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/accounts`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default accountService; 