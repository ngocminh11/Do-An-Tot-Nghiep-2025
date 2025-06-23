import api from './api';

const authService = {
    login: (data) => api.post('/auth/login', data).then(res => res.data),
    register: (data) => api.post('/auth/register', data).then(res => res.data),
    logout: () => api.post('/auth/logout').then(res => res.data),
    verifyToken: () => api.get('/auth/verify-token').then(res => res.data),
};

export default authService; 