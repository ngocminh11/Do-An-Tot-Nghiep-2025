import { mockArticles, mockCategories } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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