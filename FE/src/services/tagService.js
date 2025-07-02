import axios from 'axios';
import config from '../config';
import Cookies from 'js-cookie';

const API_URL = config.API_BASE_URL || 'http://localhost:5000';

const tagService = {
    getAllTags: async (params = {}) => {
        const token = Cookies.get('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        try {
            const response = await axios.get(`${API_URL}/admin/tags`, {
                params,
                headers
            });
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
            throw error.response?.data || error.message;
        }
    },

    getTagById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/tags/${id}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createTag: async (tagData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/tags`, tagData);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateTag: async (id, tagData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/tags/${id}`, tagData);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteTag: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/tags/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default tagService; 