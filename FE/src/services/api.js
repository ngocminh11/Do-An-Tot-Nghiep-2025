import {
    mockUsers,
    mockUserDetails,
    mockRoles,
    mockPermissions,
    mockRolePermissions,
    mockProducts,
    mockCategories,
    mockCarts,
    mockOrders,
    mockDiscounts,
    mockCampaigns,
    mockReviews,
    mockArticles,
    mockFAQs,
    mockSupportTickets,
    mockRevenueReports,
    mockProductStats,
    mockUserLogs
} from './mockData';
import axios from 'axios';
import config from '../config';

// Configure axios defaults
axios.defaults.baseURL = config.API_BASE_URL;
axios.defaults.timeout = config.API_TIMEOUT;

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// User related API calls
export const userAPI = {
    login: async (email, password) => {
        await delay(500);
        const user = mockUsers.find(u => u.email === email);
        if (!user) throw new Error('User not found');
        return user;
    },

    register: async (userData) => {
        await delay(500);
        return { ...userData, _id: Date.now().toString() };
    },

    getProfile: async (userId) => {
        await delay(500);
        return mockUsers.find(u => u._id === userId);
    },

    updateProfile: async (userId, data) => {
        await delay(500);
        return { ...data, _id: userId };
    },

    refreshToken: async () => {
        await delay(500);
        return "mock-refresh-token";
    }
};

// Product related API calls
export const productAPI = {
    getProducts: async (filters = {}) => {
        try {
            const response = await axios.get('/api/products', { params: filters });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProduct: async (productId) => {
        try {
            const response = await axios.get(`/api/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createProduct: async (productData) => {
        try {
            const response = await axios.post('/api/products', productData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateProduct: async (productId, data) => {
        try {
            const response = await axios.put(`/api/products/${productId}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteProduct: async (productId) => {
        try {
            const response = await axios.delete(`/api/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAll: async () => productAPI.getProducts(),
    getById: async (id) => productAPI.getProduct(id),
    getCategories: async () => categoryAPI.getCategories(),
    create: async (data) => productAPI.createProduct(data),
    update: async (id, data) => productAPI.updateProduct(id, data),
};

// Order related API calls
export const orderAPI = {
    getOrders: async (filters = {}) => {
        await delay(500);
        return mockOrders;
    },

    getOrder: async (orderId) => {
        await delay(500);
        return mockOrders.find(o => o._id === orderId);
    },

    createOrder: async (orderData) => {
        await delay(500);
        return { ...orderData, _id: Date.now().toString() };
    },

    updateOrderStatus: async (orderId, status) => {
        await delay(500);
        return { orderId, status };
    },

    getAll: async () => orderAPI.getOrders(),
    getById: async (id) => orderAPI.getOrder(id),
    create: async (data) => orderAPI.createOrder(data),
    update: async (id, data) => orderAPI.updateOrderStatus(id, data.status),
};

// Category related API calls
export const categoryAPI = {
    getCategories: async () => {
        await delay(500);
        return mockCategories;
    },

    createCategory: async (categoryData) => {
        await delay(500);
        return { ...categoryData, _id: Date.now().toString() };
    },

    updateCategory: async (categoryId, data) => {
        await delay(500);
        return { ...data, _id: categoryId };
    },

    deleteCategory: async (categoryId) => {
        await delay(500);
        return { success: true };
    }
};

// Review related API calls
export const reviewAPI = {
    getReviews: async (productId) => {
        await delay(500);
        return mockReviews.filter(r => r.productId === productId);
    },

    createReview: async (reviewData) => {
        await delay(500);
        return { ...reviewData, _id: Date.now().toString() };
    },

    updateReview: async (reviewId, data) => {
        await delay(500);
        return { ...data, _id: reviewId };
    },

    deleteReview: async (reviewId) => {
        await delay(500);
        return { success: true };
    }
};

// Article related API calls
export const articleAPI = {
    getArticles: async () => {
        await delay(500);
        return mockArticles;
    },

    getArticle: async (articleId) => {
        await delay(500);
        return mockArticles.find(a => a._id === articleId);
    },

    createArticle: async (articleData) => {
        await delay(500);
        return { ...articleData, _id: Date.now().toString() };
    },

    updateArticle: async (articleId, data) => {
        await delay(500);
        return { ...data, _id: articleId };
    },

    deleteArticle: async (articleId) => {
        await delay(500);
        return { success: true };
    },

    getAllCategories: async () => {
        await delay(500);
        return { data: mockCategories };
    },

    getPostsByCategory: async (categoryId) => {
        await delay(500);
        return { data: mockArticles.filter(a => a.category === categoryId) };
    }
};

// FAQ related API calls
export const faqAPI = {
    getFAQs: async () => {
        await delay(500);
        return mockFAQs;
    },

    createFAQ: async (faqData) => {
        await delay(500);
        return { ...faqData, _id: Date.now().toString() };
    },

    updateFAQ: async (faqId, data) => {
        await delay(500);
        return { ...data, _id: faqId };
    },

    deleteFAQ: async (faqId) => {
        await delay(500);
        return { success: true };
    }
};

// Support ticket related API calls
export const supportAPI = {
    getTickets: async () => {
        await delay(500);
        return mockSupportTickets;
    },

    getTicket: async (ticketId) => {
        await delay(500);
        return mockSupportTickets.find(t => t._id === ticketId);
    },

    createTicket: async (ticketData) => {
        await delay(500);
        return { ...ticketData, _id: Date.now().toString() };
    },

    updateTicket: async (ticketId, data) => {
        await delay(500);
        return { ...data, _id: ticketId };
    }
};

// Analytics related API calls
export const analyticsAPI = {
    getRevenueReports: async () => {
        await delay(500);
        return mockRevenueReports;
    },

    getProductStats: async () => {
        await delay(500);
        return mockProductStats;
    },

    getUserLogs: async () => {
        await delay(500);
        return mockUserLogs;
    }
}; 