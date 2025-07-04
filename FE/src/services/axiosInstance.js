import axios from 'axios';
import config from '../config';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: config.API_TIMEOUT || 30000,
});

// Add request interceptor to always include token
api.interceptors.request.use(
    (config) => {
        // Không gắn token cho các API auth
        const authUrls = ['/login', '/login-verify', '/register', '/send-otp', '/verify-otp', '/refresh-token'];
        if (authUrls.some(url => config.url && config.url.includes(url))) {
            return config;
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Không refresh cho các API auth
        const authUrls = ['/login', '/login-verify', '/register', '/send-otp', '/verify-otp', '/refresh-token'];
        if (authUrls.some(url => originalRequest.url && originalRequest.url.includes(url))) {
            return Promise.reject(error);
        }
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token available');
                const response = await axios.post(
                    `${config.API_BASE_URL}/refresh-token`,
                    { refreshToken }
                );
                const { accessToken, refreshToken: newRefreshToken } = response.data?.data || response.data;
                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                throw refreshError;
            }
        }
        return Promise.reject(error);
    }
);

export default api; 