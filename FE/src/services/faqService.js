import axios from 'axios';
import config from '../config';

const API_URL = config.API_BASE_URL;

const faqService = {
    // Lấy tất cả FAQ
    getFAQs: async () => {
        try {
            const response = await axios.get(`${API_URL}/faqs`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            return [];
        }
    },

    // Lấy FAQ theo category
    getFAQsByCategory: async (category) => {
        try {
            const response = await axios.get(`${API_URL}/faqs`, {
                params: { category },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching FAQs by category:', error);
            return [];
        }
    }
};

export default faqService; 