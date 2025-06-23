import { mockFAQs } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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