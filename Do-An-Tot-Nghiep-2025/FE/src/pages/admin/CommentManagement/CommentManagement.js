import React, { useState, useEffect } from 'react';
import commentService from '../../../services/commentService';
import './CommentManagement.scss';
import { toast } from 'react-toastify';

const CommentManagement = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await commentService.getAllComments();
            setComments(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Lỗi khi tải bình luận!');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
            try {
                await commentService.deleteComment(id);
                toast.success('Xóa bình luận thành công!');
                fetchComments(); // Refresh the list
            } catch (error) {
                console.error('Error deleting comment:', error);
                toast.error('Lỗi khi xóa bình luận!');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="comment-management">
            <h2>Quản lý Bình luận</h2>
            <table>
                <thead>
                    <tr>
                        <th>Người dùng</th>
                        <th>Sản phẩm</th>
                        <th>Nội dung</th>
                        <th>Ngày đăng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {comments.map((comment) => (
                        <tr key={comment._id}>
                            <td>{comment.userId ? comment.userId.fullName : 'Anonymous'}</td>
                            <td>{comment.productId ? comment.productId._id : 'N/A'}</td>
                            <td>{comment.content}</td>
                            <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => handleDelete(comment._id)} className="btn-delete">
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CommentManagement; 