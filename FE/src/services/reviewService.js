import { mockReviews } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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