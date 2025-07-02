import axios from 'axios';
import config from '../config';
import Cookies from 'js-cookie';

const API_URL = config.API_BASE_URL;

// Tạo một instance riêng để dễ kiểm soát interceptor
const axiosInstance = axios.create();

// Biến toàn cục để serialize refresh token
let refreshTokenPromise = null;

// Sửa interceptor: KHÔNG tự động xóa token khi refresh thất bại
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Chỉ xử lý lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Nếu đã có một refreshTokenPromise đang chạy, chờ nó xong rồi retry
      if (refreshTokenPromise) {
        await refreshTokenPromise;
        // Sau khi refresh xong, lấy token mới nhất từ cookie và retry
        const token = Cookies.get('token');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      }

      // Nếu chưa có, tạo mới
      refreshTokenPromise = (async () => {
        try {
          const refreshToken = Cookies.get('refreshToken');
          console.log('[FE] Interceptor (mới) - refreshToken lấy từ cookie:', refreshToken);
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // Gọi API refresh token
          const res = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data?.data || res.data;
          console.log('[FE] Interceptor - accessToken mới nhận về:', accessToken);
          if (newRefreshToken) {
            Cookies.set('refreshToken', newRefreshToken, { expires: 7, path: '/', sameSite: 'Lax' });
            console.log('[FE] Interceptor - refreshToken mới nhận về:', newRefreshToken);
          }
          Cookies.set('token', accessToken, { expires: 7, path: '/', sameSite: 'Lax' });
        } catch (refreshError) {
          console.error('[FE] Interceptor - refresh token failed:', refreshError);
          throw refreshError;
        } finally {
          refreshTokenPromise = null;
        }
      })();

      // Chờ refresh xong rồi retry request với token mới
      await refreshTokenPromise;
      const token = Cookies.get('token');
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
  }
);

const productService = {
  /**
   * Lấy tất cả sản phẩm với phân trang và bộ lọc (ADMIN)
   */
  getAllProducts: async (params = {}) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const { page = 1, limit = 10, name, status, brand, categoryId } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(name && { name }),
        ...(status && { status }),
        ...(brand && { brand }),
        ...(categoryId && { categoryId })
      });
      const response = await axiosInstance.get(`${API_URL}/admin/products?${queryParams}`, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo danh mục (PUBLIC)
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const { page = 1, limit = 10, status } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });
      const response = await axios.get(`${API_URL}/products/category/${categoryId}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy một sản phẩm theo ID (ADMIN)
   */
  getProductById: async (id) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const response = await axiosInstance.get(`${API_URL}/admin/products/${id}`, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Tạo sản phẩm mới (ADMIN)
   * @param {FormData|Object} formData
   */
  createProduct: async (formData) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
      const response = await axiosInstance.post(`${API_URL}/admin/products`, formData, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cập nhật sản phẩm (ADMIN)
   * @param {string} id
   * @param {FormData|Object} formData
   */
  updateProduct: async (id, formData) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
      const response = await axiosInstance.put(`${API_URL}/admin/products/${id}`, formData, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Xóa sản phẩm (ADMIN)
   */
  deleteProduct: async (id) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const response = await axiosInstance.delete(`${API_URL}/admin/products/${id}`, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Xuất sản phẩm ra Excel (ADMIN)
   */
  exportProductsToExcel: async (params = {}) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const { name, status, brand, categoryId } = params;
      const queryParams = new URLSearchParams({
        ...(name && { name }),
        ...(status && { status }),
        ...(brand && { brand }),
        ...(categoryId && { categoryId })
      });
      const response = await axiosInstance.get(`${API_URL}/admin/products/export/csv?${queryParams}`, {
        responseType: 'blob',
        headers
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy hình ảnh theo ID (ADMIN)
   */
  getImageById: async (id) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const response = await axiosInstance.get(`${API_URL}/admin/media/${id}`, {
        responseType: 'blob',
        headers
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm gợi ý cho chatbot dựa trên từ khóa/vấn đề da (PUBLIC)
   */
  getRecommendedProductsForChatbot: async (query) => {
    const response = await axios.get(`${API_URL}/products/recommend?query=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },

  /**
   * Lấy sản phẩm theo danh mục (ADMIN)
   */
  getProductsByCategoryAdmin: async (categoryId, params = {}) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const { page = 1, limit = 10, status } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });
      const response = await axiosInstance.get(`${API_URL}/admin/products/category/${categoryId}?${queryParams}`, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
    * Nhập kho sản phẩm (PATCH /admin/products/:id/inventory)
    * @param {string} id
    * @param {Object} param1 { quantity, originalPrice, pin }
    */
  updateInventory: async (id, { quantity, originalPrice, pin }) => {
    // Luôn lấy token mới nhất từ cookie NGAY TRƯỚC KHI GỬI REQUEST
    const token = Cookies.get('token');
    console.log('[FE] updateInventory - token:', token);
    console.log('[FE] updateInventory - payload:', { quantity, originalPrice, pin });
    if (!token) {
      throw { message: 'Token không tồn tại!', status: 401 };
    }

    try {
      const payload = {};
      if (typeof quantity === 'number' && !isNaN(quantity)) payload.quantity = quantity;
      if (typeof originalPrice === 'number' && !isNaN(originalPrice)) payload.originalPrice = originalPrice;
      if (typeof pin === 'string' && pin.length > 0) payload.pin = pin;

      // Lấy token mới nhất từ cookie NGAY TRƯỚC KHI GỬI REQUEST
      const latestToken = Cookies.get('token');
      const headers = { Authorization: `Bearer ${latestToken}` };
      const response = await axiosInstance.patch(
        `${API_URL}/admin/products/${id}/inventory`,
        payload,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('[FE] updateInventory - error:', error);
      const errorMessage = error.response?.data?.message || error.message;

      if (error?.status === 401 || error?.code === 401 || errorMessage?.toLowerCase().includes('token')) {
        throw {
          message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!',
          status: 401
        };
      }

      if (errorMessage?.toLowerCase().includes('pin')) {
        throw { message: 'Mã PIN không đúng hoặc không đủ quyền!' };
      }

      throw { message: errorMessage || 'Nhập kho thất bại' };
    }
  },

  /**
   * Đổi trạng thái sản phẩm (PATCH /admin/products/:id/status)
   */
  changeStatus: async (id, status) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const response = await axiosInstance.patch(`${API_URL}/admin/products/${id}/status`, { status }, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy log thao tác của 1 sản phẩm (GET /admin/products/:id/logs)
   */
  getProductLogs: async (id, params = {}) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const { page = 1, limit = 20 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await axiosInstance.get(`${API_URL}/admin/products/${id}/logs?${queryParams}`, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy toàn bộ log thao tác sản phẩm (GET /admin/products/logs/all)
   */
  getAllProductLogs: async (params = {}) => {
    const token = Cookies.get('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const { page = 1, limit = 20 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await axiosInstance.get(`${API_URL}/admin/products/logs/all?${queryParams}`, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Hàm trả về URL đầy đủ cho ảnh
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_URL + path;
}

export default productService;