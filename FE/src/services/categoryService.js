// src/services/categoryService.js
import axios from 'axios'

/**
 * Khởi tạo một instance Axios có baseURL trỏ vào
 * http://localhost:5000/admin/categories (có thể override bằng env)
 */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'
const BASE_URL = `${API_BASE}/admin/categories`

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 10_000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// Interceptor để unwrap object sendSuccess => trả về luôn payload.data
client.interceptors.response.use(
    res => {
        const payload = res.data
        if (payload.success) {
            return payload.data
        }
        // Nếu API trả success: false thì throw để catch vào catch của caller
        return Promise.reject(new Error(payload.message || 'Unknown error'))
    },
    err => {
        console.error('API Error:', err.response?.data || err.message)
        const msg = err.response?.data?.message || err.message
        return Promise.reject(new Error(msg))
    }
)

const categoryService = {
    /**
     * Lấy danh sách categories kèm pagination + filters
     * @param {Object} params
     *   - name: filter theo tên bắt đầu bằng…
     *   - slug: filter slug
     *   - page: trang hiện tại
     *   - limit: số item mỗi trang
     */
    getAll: async (params = {}) => {
        try {
            const { data, currentPage, totalPages, totalItems, perPage } =
                await client.get('/', { params })

            return {
                items: data,
                pagination: { currentPage, totalPages, totalItems, perPage },
            }
        } catch (error) {
            console.error('Error in getAll:', error)
            throw error
        }
    },

    /**
     * Lấy chi tiết 1 category theo id
     * @param {String} id
     */
    getById: async id => {
        try {
            return await client.get(`/${id}`)
        } catch (error) {
            console.error('Error in getById:', error)
            throw error
        }
    },

    /**
     * Tạo mới category
     * @param {{ name: String, description?: String, status?: String }} payload
     */
    create: async ({ name, description = '', status = 'active' }) => {
        try {
            return await client.post('/', { name, description, status })
        } catch (error) {
            console.error('Error in create:', error)
            throw error
        }
    },

    /**
     * Cập nhật category
     * @param {String} id
     * @param {{ name?: String, description?: String, status?: String }} payload
     */
    update: async (id, payload = {}) => {
        try {
            // build body chỉ chứa các field thực sự có giá trị
            const body = {}
            if (payload.name) body.name = payload.name
            if (payload.description !== undefined) body.description = payload.description
            if (payload.status) body.status = payload.status

            return await client.put(`/${id}`, body)
        } catch (error) {
            console.error('Error in update:', error)
            throw error
        }
    },

    /**
     * Xóa category
     * @param {String} id
     */
    delete: async id => {
        try {
            return await client.delete(`/${id}`)
        } catch (error) {
            console.error('Error in delete:', error)
            throw error
        }
    },
}

export default categoryService