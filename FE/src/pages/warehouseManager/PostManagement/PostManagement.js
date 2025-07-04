import React from 'react';

const PostManagement = () => {
    // TODO: Thay thế dữ liệu mẫu bằng API thực tế
    const posts = [
        { id: 1, title: 'Bài viết 1', author: 'Admin', date: '2024-07-01' },
        { id: 2, title: 'Bài viết 2', author: 'User', date: '2024-07-02' },
    ];

    return (
        <div className="wm-post-management">
            <h1>Quản lý Bài viết</h1>
            <input placeholder="Tìm kiếm bài viết..." style={{ marginBottom: 16 }} />
            <button style={{ marginBottom: 16 }}>Thêm bài viết</button>
            <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Ngày đăng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.title}</td>
                            <td>{p.author}</td>
                            <td>{p.date}</td>
                            <td>
                                <button>Xem</button>{' '}
                                <button>Sửa</button>{' '}
                                <button>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* TODO: Thêm phân trang nếu cần */}
        </div>
    );
};

export default PostManagement; 