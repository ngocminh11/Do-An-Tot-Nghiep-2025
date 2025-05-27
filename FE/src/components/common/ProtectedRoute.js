import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import TokenService from './TokenService';

const ProtectedRoute = ({ children, requiredRole }) => {
    const location = useLocation();
    const isAuthenticated = TokenService.isAuthenticated();
    const user = TokenService.getUser();

    if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user.roleId !== requiredRole) {
        // Redirect to home page if user doesn't have required role
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute; 