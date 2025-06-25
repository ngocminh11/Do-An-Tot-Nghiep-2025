import axios from 'axios';
import config from '../config';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: config.API_TIMEOUT,
    withCredentials: true
});

export const userAPI = {
    // Gửi OTP (cho đăng ký, quên mật khẩu...)
    sendOTP: async (email) => {
        const res = await api.post('/send-otp', { email });
        return res.data.data; // { otpToken }
    },
    // Xác minh OTP (trả về otpToken mới đã xác thực)
    verifyOTP: async (otpToken, otp) => {
        const res = await api.post('/verify-otp', { otpToken, otp });
        return res.data.data; // { otpToken }
    },
    // Đăng ký (cần otpToken đã xác thực)
    register: async (userData, otpToken) => {
        const res = await api.post('/register', userData, {
            headers: { Authorization: `Bearer ${otpToken}` }
        });
        return res.data.data; // { user, accessToken, refreshToken }
    },
    // Đăng nhập bước 1: kiểm tra email+password, gửi OTP
    loginStep1: async (email, password) => {
        const res = await api.post('/login', { email, password });
        return res.data.data; // { otpToken }
    },
    // Đăng nhập bước 2: xác minh OTP, trả về token
    loginStep2: async (otpToken, otp) => {
        console.log('FE: Gọi API /login-verify với otpToken:', otpToken, 'otp:', otp);
        const res = await api.post('/login-verify', { otpToken, otp });
        console.log('FE: Response từ /login-verify:', res.data);
        return res.data.data; // { user, accessToken, refreshToken }
    },
    // Làm mới access token
    refreshToken: async (refreshToken) => {
        const res = await api.post('/refresh-token', { refreshToken });
        return res.data.data; // { accessToken }
    },
    // Lấy profile: cần truyền userId và accessToken
    getProfile: async (accessToken, userId) => {
        const res = await api.get(`/accounts/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
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
    }
}; 