import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';

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

    const fetchUserProfile = async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const data = await response.json();
            if (data.success) {
                setUser(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                message.success('Đăng nhập thành công!');
                return true;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                message.success('Đăng ký thành công!');
                return true;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        message.success('Đăng xuất thành công!');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 