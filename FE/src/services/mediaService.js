import api from './axiosInstance';

const mediaService = {
    /**
     * Lấy ảnh từ GridFS theo id (trả về blob)
     * @param {string} id - id của ảnh trong GridFS
     * @returns {Promise<Blob>}
     */
    getImageById: async (id) => {
        const response = await api.get(`/admin/media/${id}`, { responseType: 'blob' });
        return response.data;
    },

};

export default mediaService; 