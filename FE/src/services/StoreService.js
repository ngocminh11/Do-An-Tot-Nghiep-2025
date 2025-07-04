import api from './axiosInstance';

const storeService = {
    // Lấy danh sách phiếu nhập/xuất kho (có phân trang, lọc)
    getAll: async (params = {}) => {
        try {
            const { page = 1, limit = 20, type, status } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(type && { type }),
                ...(status && { status })
            });
            const response = await api.get(`/admin/storage?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy chi tiết 1 phiếu
    getById: async (id) => {
        try {
            const response = await api.get(`/admin/storage/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Tạo mới phiếu nhập/xuất kho
    create: async (data) => {
        try {
            const response = await api.post('/admin/storage', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật phiếu
    update: async (id, data) => {
        try {
            const response = await api.put(`/admin/storage/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Xóa phiếu
    delete: async (id) => {
        try {
            const response = await api.delete(`/admin/storage/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Duyệt phiếu nhập kho (chuyển trạng thái, yêu cầu mã PIN nếu duyệt)
    changeStatus: async (id, status, pin) => {
        try {
            const payload = { status };
            if (pin) payload.pin = pin;
            const response = await api.patch(`/admin/storage/${id}/status`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Hủy phiếu nhập kho (chuyển trạng thái sang Trả Hàng, có thể yêu cầu mã PIN nếu cần)
    cancelStorage: async (id, pin) => {
        return await storeService.changeStatus(id, 'Trả Hàng', pin);
    },

    // Lấy danh sách phiếu nhập kho (filter import only, dùng cho quản lý nhập kho)
    getAllImportStorage: async (params = {}) => {
        try {
            const { page = 1, limit = 20, status } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status && { status })
            });
            const response = await api.get(`/admin/storage/import-list?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default storeService; 