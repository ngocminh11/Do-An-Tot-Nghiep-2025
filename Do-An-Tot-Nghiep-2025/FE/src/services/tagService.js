import axios from 'axios';
import config from '../config';

const API_URL = config.API_URL || 'http://localhost:5000';

const tagService = {
    getAllTags: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/admin/tags`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getTagById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/tags/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createTag: async (tagData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/tags`, tagData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateTag: async (id, tagData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/tags/${id}`, tagData);
            return response.data;
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