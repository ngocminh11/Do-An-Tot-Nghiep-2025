import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check for admin token on mount
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            setIsAuthenticated(true);
            setIsAdmin(true);
            setUser({ role: 'admin' });
        }
    }, []);

    const login = (userData) => {
        if (userData.role === 'admin') {
            localStorage.setItem('adminToken', 'admin-token');
            setIsAdmin(true);
        }
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isAdmin,
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 