import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { userAPI } from '../services/userService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, navigate: navigateProp, onRequireLogin }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = navigateProp || useNavigate();

    // Helper: decode JWT để lấy userId và role
    function getUserInfoFromToken(token) {
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(window.atob(payload));
            return { id: decoded.id, role: decoded.role };
        } catch {
            return { id: null, role: null };
        }
    }

    // Khi khởi tạo, luôn lấy token từ localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('[AuthContext] useEffect khởi tạo, token:', token);
        if (token && token !== 'undefined' && token !== 'null') {
            fetchUserProfile(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async (tokenParam) => {
        const token = tokenParam || localStorage.getItem('token');
        console.log('[AuthContext] fetchUserProfile, token:', token);
        try {
            const { id, role } = getUserInfoFromToken(token);
            if (!id) throw new Error('Không lấy được userId từ token');
            // Luôn gọi API lấy profile cho mọi role
            const user = await userAPI.getProfile(id);
            // Nếu user không có role, lấy từ token
            if (!user.role && role) {
                user.role = role;
            }
            setUser(user);
        } catch (error) {
            console.warn('FE: getProfile lỗi, thử refresh token', error);
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
                try {
                    const { accessToken, refreshToken: newRefreshToken } = await userAPI.refreshToken(refreshToken);
                    console.log('[AuthContext] refresh nhận về:', accessToken, newRefreshToken);
                    if (!accessToken || !newRefreshToken) {
                        console.error('[AuthContext] Không nhận được token mới khi refresh:', accessToken, newRefreshToken);
                        throw new Error('Không nhận được token mới khi refresh');
                    }
                    localStorage.setItem('token', accessToken);
                    console.log('[DEBUG] Token mới đã lưu:', localStorage.getItem('token'));
                    localStorage.setItem('refreshToken', newRefreshToken);
                    console.log('[DEBUG] RefreshToken mới đã lưu:', localStorage.getItem('refreshToken'));
                    const { id: newUserId, role: newRole } = getUserInfoFromToken(accessToken);
                    if (!newUserId) throw new Error('Không lấy được userId từ token');
                    const user = await userAPI.getProfile(newUserId);
                    // Nếu user không có role, lấy từ token
                    if (!user.role && newRole) {
                        user.role = newRole;
                    }
                    setUser(user);
                    return;
                } catch (refreshError) {
                    console.error('FE: Refresh token cũng lỗi', refreshError);
                    handleSessionExpired();
                }
            } else {
                handleSessionExpired();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSessionExpired = () => {
        // Chỉ xóa localStorage khi chắc chắn hết hạn phiên (401 từ cả accessToken và refreshToken)
        // Không xóa localStorage khi chỉ gặp lỗi tạm thời hoặc F5
        if (localStorage.getItem('token') || localStorage.getItem('refreshToken')) {
            localStorage.removeItem('token');
            console.log('[DEBUG] Token sau khi xóa:', localStorage.getItem('token'));
            localStorage.removeItem('refreshToken');
            console.log('[DEBUG] RefreshToken sau khi xóa:', localStorage.getItem('refreshToken'));
        }
        setUser(null);
        message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
        if (onRequireLogin) onRequireLogin();
        if (typeof setShowLogin === 'function') setShowLogin(true);
    };

    const loginStep1 = async (email, password) => {
        try {
            const { otpToken } = await userAPI.loginStep1(email, password);
            return { otpToken };
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Sai email hoặc mật khẩu!';
            message.error(msg);
            throw { ...error, message: msg, status: error?.response?.status };
        }
    };

    const loginStep2 = async (otpToken, otp) => {
        try {
            const data = await userAPI.loginStep2(otpToken, otp);
            if (!data) {
                throw new Error('Không nhận được data từ API');
            }
            const { user, accessToken, refreshToken } = data;
            if (!accessToken || !refreshToken) {
                throw new Error('Không nhận được accessToken hoặc refreshToken');
            }
            if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
                localStorage.setItem('token', accessToken);
                console.log('[DEBUG] Token mới đã lưu:', localStorage.getItem('token'));
            }
            if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
                localStorage.setItem('refreshToken', refreshToken);
                console.log('[DEBUG] RefreshToken mới đã lưu:', localStorage.getItem('refreshToken'));
            }
            setUser(user);
            message.success('Đăng nhập thành công!');
            navigateToRoleBasedPage(user?.role);
            return user;
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'OTP không đúng hoặc đã hết hạn!';
            message.error(msg);
            throw { ...error, message: msg, status: error?.response?.status };
        }
    };

    const navigateToRoleBasedPage = (role) => {
        // Luôn về trang chủ cho mọi role
        navigate('/');
    };

    const sendRegisterOTP = async (email) => {
        try {
            const { otpToken } = await userAPI.sendOTP(email);
            return { otpToken };
        } catch (error) {
            const msg = error?.response?.data?.message || 'Không gửi được OTP!';
            message.error(msg);
            throw error;
        }
    };

    const verifyRegisterOTP = async (otpToken, otp) => {
        try {
            const { otpToken: verifiedOtpToken, user } = await userAPI.verifyOTP(otpToken, otp);
            setUser(user);
            return { verifiedOtpToken, user };
        } catch (error) {
            const msg = error?.response?.data?.message || 'OTP không đúng hoặc đã hết hạn!';
            message.error(msg);
            throw error;
        }
    };

    const register = async (userData, verifiedOtpToken) => {
        try {
            const { user, accessToken, refreshToken } = await userAPI.register(userData, verifiedOtpToken);
            if (!accessToken || !refreshToken) {
                throw new Error('Không nhận được accessToken hoặc refreshToken');
            }
            if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
                localStorage.setItem('token', accessToken);
                console.log('[DEBUG] Token mới đã lưu:', localStorage.getItem('token'));
            }
            if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
                localStorage.setItem('refreshToken', refreshToken);
                console.log('[DEBUG] RefreshToken mới đã lưu:', localStorage.getItem('refreshToken'));
            }
            setUser(user);
            message.success('Đăng ký thành công!');
            navigateToRoleBasedPage(user?.role);
            return user;
        } catch (error) {
            const msg = error?.response?.data?.message || 'Đăng ký thất bại!';
            message.error(msg);
            throw error;
        }
    };

    const forgotPassword = async (email) => {
        try {
            const { otpToken } = await userAPI.forgotPassword(email);
            return { otpToken };
        } catch (error) {
            const msg = error?.response?.data?.message || 'Không gửi được OTP!';
            message.error(msg);
            throw error;
        }
    };

    const resetPassword = async (newPassword, otpToken) => {
        try {
            await userAPI.resetPassword(newPassword, otpToken);
            message.success('Đặt lại mật khẩu thành công!');
        } catch (error) {
            const msg = error?.response?.data?.message || 'Đặt lại mật khẩu thất bại!';
            message.error(msg);
            throw error;
        }
    };

    const updateProfile = async (userId, userData) => {
        try {
            const updatedUser = await userAPI.updateProfile(userId, userData);
            setUser(updatedUser);
            message.success('Cập nhật thông tin thành công!');
            return updatedUser;
        } catch (error) {
            const msg = error?.response?.data?.message || 'Cập nhật thông tin thất bại!';
            message.error(msg);
            throw error;
        }
    };

    const updateAccountStatus = async (userId, status) => {
        try {
            const updatedUser = await userAPI.updateAccountStatus(userId, status);
            setUser(updatedUser);
            message.success('Cập nhật trạng thái thành công!');
            return updatedUser;
        } catch (error) {
            const msg = error?.response?.data?.message || 'Cập nhật trạng thái thất bại!';
            message.error(msg);
            throw error;
        }
    };

    const verifyPin = async (userId, pin) => {
        try {
            return await userAPI.verifyPin(userId, String(pin).trim());
        } catch (error) {
            const msg = error?.response?.data?.message || 'Xác thực PIN thất bại!';
            message.error(msg);
            throw error;
        }
    };

    const updatePin = async (userId, pin) => {
        try {
            await userAPI.updatePin(userId, pin);
            message.success('Cập nhật PIN thành công!');
        } catch (error) {
            const msg = error?.response?.data?.message || 'Cập nhật PIN thất bại!';
            message.error(msg);
            throw error;
        }
    };

    const logout = () => {
        console.log('[AuthContext] LOGOUT: XÓA localStorage');
        localStorage.removeItem('token');
        console.log('[DEBUG] Token sau khi xóa:', localStorage.getItem('token'));
        localStorage.removeItem('refreshToken');
        console.log('[DEBUG] RefreshToken sau khi xóa:', localStorage.getItem('refreshToken'));
        setUser(null);
        message.success('Đăng xuất thành công!');
        navigate('/');
        if (onRequireLogin) onRequireLogin();
    };


    const value = {
        user,
        loading,
        loginStep1,
        loginStep2,
        sendRegisterOTP,
        verifyRegisterOTP,
        register,
        forgotPassword,
        resetPassword,
        updateProfile,
        updateAccountStatus,
        verifyPin,
        updatePin,
        logout,
        setUser,
        fetchUserProfile,
        handleSessionExpired
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const AuthProviderWithNavigate = ({ children, onRequireLogin }) => {
    const navigate = useNavigate();
    return (
        <AuthProvider navigate={navigate} onRequireLogin={onRequireLogin}>
            {children}
        </AuthProvider>
    );
};