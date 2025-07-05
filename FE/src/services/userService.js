import api from './axiosInstance';

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
        const res = await api.get(`/accounts/${userId}`);
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
        const res = await api.post(`/accounts/${userId}/verify-pin`, { pin: String(pin).trim() });
        return res.data.data;
    },
    // Đổi PIN (admin routes)
    updatePin: async (userId, pin) => {
        const res = await api.patch(`/accounts/${userId}/pin`, { pin });
        return res.data.data;
    },
    // Đăng nhập trực tiếp (nếu còn accessToken)
    loginDirect: async (email, password, accessToken) => {
        const res = await api.post('/login-direct', { email, password, accessToken });
        return res.data.data; // { user, accessToken, refreshToken, role }
    },
    // Alias cho đăng ký (register)
    sendRegisterOTP: async (email) => userAPI.sendOTP(email),
    verifyRegisterOTP: async (otpToken, otp) => userAPI.verifyOTP(otpToken, otp),
}; 