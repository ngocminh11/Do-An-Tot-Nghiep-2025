import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { userAPI } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile(token);
        } else {
            setLoading(false);
        }
    }, []);

    // Helper: decode JWT để lấy userId
    function getUserIdFromToken(token) {
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(window.atob(payload));
            return decoded.id;
        } catch {
            return null;
        }
    }

    const fetchUserProfile = async (token) => {
        try {
            console.log('FE: Gọi getProfile với token:', token);
            const userId = getUserIdFromToken(token);
            if (!userId) throw new Error('Không lấy được userId từ token');
            const user = await userAPI.getProfile(token, userId);
            setUser(user);
        } catch (error) {
            console.warn('FE: getProfile lỗi, thử refresh token', error);
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    console.log('FE: Gọi refreshToken với:', refreshToken);
                    const { accessToken } = await userAPI.refreshToken(refreshToken);
                    localStorage.setItem('token', accessToken);
                    const userId = getUserIdFromToken(accessToken);
                    if (!userId) throw new Error('Không lấy được userId từ token');
                    const user = await userAPI.getProfile(accessToken, userId);
                    setUser(user);
                    return;
                } catch (refreshError) {
                    console.error('FE: Refresh token cũng lỗi', refreshError);
                    localStorage.clear();
                    setUser(null);
                }
            } else {
                localStorage.clear();
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const loginStep1 = async (email, password) => {
        try {
            const { otpToken } = await userAPI.loginStep1(email, password);
            return { otpToken };
        } catch (error) {
            message.error(error.response?.data?.message || 'Sai email hoặc mật khẩu!');
            throw error;
        }
    };

    const loginStep2 = async (otpToken, otp) => {
        try {
            const data = await userAPI.loginStep2(otpToken, otp);
            console.log('DATA loginStep2:', data);
            console.log("otpToken", otpToken);
            console.log("otp", otp);
            if (!data) {
                console.warn('loginStep2: Không nhận được data từ userAPI.loginStep2');
            }
            // Nếu chỉ có otpToken, báo lỗi rõ ràng
            if (data && data.otpToken && !data.accessToken) {
                message.error('API trả về sai format! Đăng nhập OTP phải trả về user, accessToken, refreshToken.');
                throw new Error('API trả về sai format cho loginStep2');
            }
            const { user, accessToken, refreshToken } = data || {};
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            message.success('Đăng nhập thành công!');
            return user;
        } catch (error) {
            message.error(error.response?.data?.message || error.message || 'OTP không đúng hoặc đã hết hạn!');
            throw error;
        }
    };

    const sendRegisterOTP = async (email) => {
        try {
            const { otpToken } = await userAPI.sendOTP(email);
            return { otpToken };
        } catch (error) {
            message.error(error.response?.data?.message || 'Không gửi được OTP!');
            throw error;
        }
    };

    const verifyRegisterOTP = async (otpToken, otp) => {
        try {
            const { otpToken: verifiedOtpToken } = await userAPI.verifyOTP(otpToken, otp);
            return { verifiedOtpToken };
        } catch (error) {
            message.error(error.response?.data?.message || 'OTP không đúng hoặc đã hết hạn!');
            throw error;
        }
    };

    const register = async (userData, verifiedOtpToken) => {
        try {
            const { user, accessToken, refreshToken } = await userAPI.register(userData, verifiedOtpToken);
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            message.success('Đăng ký thành công!');
            return user;
        } catch (error) {
            message.error(error.response?.data?.message || 'Đăng ký thất bại!');
            throw error;
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        message.success('Đăng xuất thành công!');
    };

    const value = {
        user,
        loading,
        loginStep1,
        loginStep2,
        sendRegisterOTP,
        verifyRegisterOTP,
        register,
        logout,
        setUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 