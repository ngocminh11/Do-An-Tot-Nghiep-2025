import { mockRevenueReports, mockProductStats, mockUserLogs } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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