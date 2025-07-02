import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { message } from 'antd';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const { setShowLogin } = useAuthModal();

    if (loading) {
        return <div>Loading...</div>; // Hoặc component loading
    }

    if (!user) {
        // Chỉ mở modal nếu đã xác thực xong mà vẫn chưa có user
        setTimeout(() => setShowLogin(true), 0);
        return <Navigate to="/" replace />;
    }

    // Hỗ trợ requiredRole là mảng hoặc string
    if (requiredRole) {
        if (Array.isArray(requiredRole)) {
            if (!requiredRole.includes(user.role)) {
                message.error('Bạn không có quyền truy cập trang này!');
                return <Navigate to="/" replace />;
            }
        } else {
            if (user.role !== requiredRole) {
                message.error('Bạn không có quyền truy cập trang này!');
                return <Navigate to="/" replace />;
            }
        }
    }

    return children;
};

export default ProtectedRoute;