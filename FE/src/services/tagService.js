import axios from 'axios';
// Assuming mockTags are defined in mockData.js and we'll use them here for now
import { mockTags } from './mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const tagService = {
    // Lấy tất cả tags (mock)
    getAllTags: async () => {
        await delay(300);
        return mockTags;
    },

    // Lấy một tag theo ID (mock)
    getTagById: async (id) => {
        await delay(300);
        const tag = mockTags.find(t => String(t._id) === String(id));
        if (!tag) throw new Error('Tag not found (mock)');
        return tag;
    },

    // Tạo tag mới (mock)
    createTag: async (tagData) => {
        await delay(300);
        const newTag = { _id: Date.now().toString(), ...tagData };
        mockTags.push(newTag); // Add to mock data
        console.log('Mock tag created:', newTag);
        return newTag;
    },

    // Cập nhật tag (mock)
    updateTag: async (id, tagData) => {
        await delay(300);
        const index = mockTags.findIndex(t => String(t._id) === String(id));
        if (index === -1) throw new Error('Tag not found (mock)');
        const updatedTag = { ...mockTags[index], ...tagData, _id: String(id) };
        mockTags[index] = updatedTag; // Update mock data
        console.log('Mock tag updated:', updatedTag);
        return updatedTag;
    },

    // Xóa tag (mock)
    deleteTag: async (id) => {
        await delay(300);
        const initialLength = mockTags.length;
        mockTags = mockTags.filter(t => String(t._id) !== String(id)); // Remove from mock data
        if (mockTags.length === initialLength) throw new Error('Tag not found (mock)');
        console.log('Mock tag deleted:', id);
        return { message: 'Tag deleted successfully (mock)' };
    },
};

export default tagService; 