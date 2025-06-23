import api from './api';

const cartService = {
    getAllCarts: () => {
        return api.get('/admin/cart').then(res => res.data);
    },

    getCartByUserId: (userId) => {
        return api.get(`/admin/cart/${userId}`).then(res => res.data);
    },

    clearCartByUserId: (userId) => {
        return api.delete(`/admin/cart/${userId}`).then(res => res.data);
    },
};

export default cartService; 