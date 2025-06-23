import api from './api';

const commentService = {
    getAllComments: () => {
        return api.get('/admin/comments').then(res => res.data);
    },

    getCommentById: (id) => {
        return api.get(`/admin/comments/${id}`).then(res => res.data);
    },

    deleteComment: (id) => {
        return api.delete(`/admin/comments/${id}`).then(res => res.data);
    },

    replyToComment: (id, replyData) => {
        return api.post(`/admin/comments/reply/${id}`, replyData).then(res => res.data);
    },
};

export default commentService; 