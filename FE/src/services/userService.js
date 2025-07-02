import axios from 'axios';
import config from '../config';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: config.API_TIMEOUT
});

// Add request interceptor to always include token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Sửa phần interceptor response
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('refreshToken');
                if (!refreshToken) throw new Error('No refresh token available');

                // Sửa thành POST với body đúng format
                const response = await axios.post(
                    `${config.API_BASE_URL}/refresh-token`,
                    { refreshToken } // Đúng payload backend yêu cầu
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data?.data || response.data;

                Cookies.set('token', accessToken, { expires: 7, path: '/', sameSite: 'Lax' });
                Cookies.set('refreshToken', newRefreshToken, { expires: 7, path: '/', sameSite: 'Lax' });
                console.log('[userService] set token/refreshToken khi refresh:', accessToken, newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                Cookies.remove('token', { path: '/' });
                Cookies.remove('refreshToken', { path: '/' });
                console.log('[userService] XÓA COOKIE khi refresh lỗi');
                throw refreshError;
            }
        }
        return Promise.reject(error);
    }
);

export const userAPI = {
    // Gửi OTP (cho đăng ký, quên mật khẩu...)
    sendOTP: async (email) => {
        const res = await api.post('/send-otp', { email });
        return res.data.data; // { otpToken }
    },
    // Xác minh OTP (trả về otpToken mới đã xác thực và user info)
    verifyOTP: async (otpToken, otp) => {
        const res = await api.post('/verify-otp', { otpToken, otp });
        // Backend trả về { otpToken, user }
        return res.data.data; // { otpToken, user }
    },
    // Đăng ký (cần otpToken đã xác thực)
    register: async (userData, otpToken) => {
        // Chỉ lấy đúng các trường backend yêu cầu
        const {
            fullName,
            email,
            password,
            phone,
            skinType,
            address,
            gender
        } = userData;
        const payload = { fullName, email, password, phone, skinType, address, gender };
        console.log('FE gửi đăng ký:', payload, 'Token:', otpToken);
        try {
            const res = await api.post('/register', payload, {
                headers: { Authorization: `Bearer ${otpToken}` }
            });
            console.log('FE nhận response đăng ký:', res);
            return res.data.data; // { user, accessToken, refreshToken }
        } catch (err) {
            console.error('FE lỗi khi gọi API /register:', err);
            throw err;
        }
    },
    // Đăng nhập bước 1: kiểm tra email+password, gửi OTP
    loginStep1: async (email, password) => {
        const res = await api.post('/login', { email, password });
        return res.data.data; // { otpToken }
    },
    // Đăng nhập bước 2: xác minh OTP, trả về token
    loginStep2: async (otpToken, otp) => {
        const res = await api.post('/login-verify', { otpToken, otp });
        // Backend trả về { user, accessToken, refreshToken, role }
        return res.data.data; // { user, accessToken, refreshToken, role }
    },
    // Làm mới access token
    refreshToken: async (refreshToken) => {
        const res = await api.post('/refresh-token', { refreshToken });
        // Backend giờ trả về { accessToken, refreshToken }
        return res.data.data; // { accessToken, refreshToken }
    },
    // Lấy profile: cần truyền userId và accessToken
    getProfile: async (userId) => {
        const token = Cookies.get('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get(`/accounts/${userId}`, { headers });
        return res.data.data; // user
    },
    // Quên mật khẩu: gửi OTP
    forgotPassword: async (email) => {
        const res = await api.post('/forgot-password', { email });
        return res.data.data; // { otpToken }
    },
    // Đặt lại mật khẩu (cần otpToken đã xác thực)
    resetPassword: async (newPassword, otpToken) => {
        const res = await api.post('/reset-password', { newPassword }, {
            headers: { Authorization: `Bearer ${otpToken}` }
        });
        return res.data.data;
    },
    // Cập nhật thông tin cá nhân (user routes)
    updateProfile: async (userId, userData) => {
        const res = await api.put(`/accounts/${userId}`, userData);
        return res.data.data;
    },
    // Cập nhật trạng thái tài khoản (user routes)
    updateAccountStatus: async (userId, status) => {
        const res = await api.patch(`/accounts/${userId}/status`, { accountStatus: status });
        return res.data.data;
    },
    // Xác thực PIN (admin routes)
    verifyPin: async (userId, pin) => {
        const res = await api.post(`/accounts/${userId}/verify-pin`, { pin });
        return res.data.data;
    },
    // Đổi PIN (admin routes)
    updatePin: async (userId, pin) => {
        const res = await api.patch(`/accounts/${userId}/pin`, { pin });
        return res.data.data;
    }
}; 