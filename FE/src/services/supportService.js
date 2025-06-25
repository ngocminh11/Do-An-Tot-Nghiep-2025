import { mockSupportTickets } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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