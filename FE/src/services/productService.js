import api from './axiosInstance';
import config from '../config';

const API_URL = config.API_BASE_URL;

const productService = {
  /**
   * Lấy tất cả sản phẩm với phân trang và bộ lọc (ADMIN)
   */
  getAllProducts: async (params = {}) => {
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
      const response = await api.get(`/admin/products?${queryParams}`);
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
      const response = await api.get(`/products/category/${categoryId}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy một sản phẩm theo ID (ADMIN)
   */
  getProductById: async (id) => {
    try {
      const response = await api.get(`/admin/products/${id}`);
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
    try {
      const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
      const response = await api.post('/admin/products', formData);
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
    try {
      const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
      const response = await api.put(`/admin/products/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Xóa sản phẩm (ADMIN)
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Xuất sản phẩm ra Excel (ADMIN)
   */
  exportProductsToExcel: async (params = {}) => {
    try {
      const { name, status, brand, categoryId } = params;
      const queryParams = new URLSearchParams({
        ...(name && { name }),
        ...(status && { status }),
        ...(brand && { brand }),
        ...(categoryId && { categoryId })
      });
      const response = await api.get(`/admin/products/export/csv?${queryParams}`, {
        responseType: 'blob'
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
    try {
      const response = await api.get(`/admin/media/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Upload hình ảnh (ADMIN)
   */
  uploadImage: async (formData) => {
    try {
      const response = await api.post('/admin/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Xóa hình ảnh (ADMIN)
   */
  deleteImage: async (id) => {
    try {
      const response = await api.delete(`/admin/media/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy thống kê sản phẩm (ADMIN)
   */
  getProductStats: async (params = {}) => {
    try {
      const response = await api.get('/admin/products/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cập nhật trạng thái sản phẩm (ADMIN)
   */
  updateProductStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/products/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo tag (ADMIN)
   */
  getProductsByTag: async (tagId, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/tag/${tagId}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Thêm tag cho sản phẩm (ADMIN)
   */
  addTagToProduct: async (productId, tagId) => {
    try {
      const response = await api.post(`/admin/products/${productId}/tags`, { tagId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Xóa tag khỏi sản phẩm (ADMIN)
   */
  removeTagFromProduct: async (productId, tagId) => {
    try {
      const response = await api.delete(`/admin/products/${productId}/tags/${tagId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo brand (ADMIN)
   */
  getProductsByBrand: async (brand, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/brand/${brand}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Tìm kiếm sản phẩm (ADMIN)
   */
  searchProducts: async (query, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/search?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm nổi bật (ADMIN)
   */
  getFeaturedProducts: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/featured?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cập nhật sản phẩm nổi bật (ADMIN)
   */
  updateFeaturedStatus: async (id, featured) => {
    try {
      const response = await api.patch(`/admin/products/${id}/featured`, { featured });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo giá (ADMIN)
   */
  getProductsByPriceRange: async (minPrice, maxPrice, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/price-range?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo ngày tạo (ADMIN)
   */
  getProductsByDateRange: async (startDate, endDate, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/date-range?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo trạng thái (ADMIN)
   */
  getProductsByStatus: async (status, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        status,
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/status/${status}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo danh mục (ADMIN)
   */
  getProductsByCategoryAdmin: async (categoryId, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/category/${categoryId}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo tag (ADMIN)
   */
  getProductsByTagAdmin: async (tagId, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/tag/${tagId}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo brand (ADMIN)
   */
  getProductsByBrandAdmin: async (brand, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/brand/${brand}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Tìm kiếm sản phẩm (ADMIN)
   */
  searchProductsAdmin: async (query, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/search?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm nổi bật (ADMIN)
   */
  getFeaturedProductsAdmin: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/featured?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cập nhật sản phẩm nổi bật (ADMIN)
   */
  updateFeaturedStatusAdmin: async (id, featured) => {
    try {
      const response = await api.patch(`/admin/products/${id}/featured`, { featured });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo giá (ADMIN)
   */
  getProductsByPriceRangeAdmin: async (minPrice, maxPrice, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/price-range?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo ngày tạo (ADMIN)
   */
  getProductsByDateRangeAdmin: async (startDate, endDate, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/date-range?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy sản phẩm theo trạng thái (ADMIN)
   */
  getProductsByStatusAdmin: async (status, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        status,
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/admin/products/status/${status}?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Helper function để lấy URL hình ảnh
export function getImageUrl(path) {
  if (!path) return '/images/products/default.jpg';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

// User functions (không cần token)
export const getAllProductsUser = async (params = {}) => {
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
    const response = await api.get(`/products?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProductByIdUser = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProductsByCategoryUser = async (categoryId, params = {}) => {
  try {
    const { page = 1, limit = 10, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    const response = await api.get(`/products/category/${categoryId}?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getImageByIdUser = async (id) => {
  try {
    const response = await api.get(`/media/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default productService;