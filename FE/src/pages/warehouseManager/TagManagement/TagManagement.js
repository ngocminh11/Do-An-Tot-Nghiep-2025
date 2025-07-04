import React from 'react';

const TagManagement = () => {
    // TODO: Thay thế dữ liệu mẫu bằng API thực tế
    const tags = [
        { id: 1, name: 'Tag 1', description: 'Mô tả tag 1' },
        { id: 2, name: 'Tag 2', description: 'Mô tả tag 2' },
    ];

    return (
        <div className="wm-tag-management">
            <h1>Quản lý Tag</h1>
            <input placeholder="Tìm kiếm tag..." style={{ marginBottom: 16 }} />
            <button style={{ marginBottom: 16 }}>Thêm tag</button>
            <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên tag</th>
                        <th>Mô tả</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {tags.map((t) => (
                        <tr key={t.id}>
                            <td>{t.id}</td>
                            <td>{t.name}</td>
                            <td>{t.description}</td>
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

export default TagManagement; 