import React from 'react';

const CategoryManagement = () => {
    // TODO: Thay thế dữ liệu mẫu bằng API thực tế
    const categories = [
        { id: 1, name: 'Danh mục 1', description: 'Mô tả 1' },
        { id: 2, name: 'Danh mục 2', description: 'Mô tả 2' },
    ];

    return (
        <div className="staff-category-management">
            <h1>Danh sách Danh mục</h1>
            <input placeholder="Tìm kiếm danh mục..." style={{ marginBottom: 16 }} />
            <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên danh mục</th>
                        <th>Mô tả</th>
                        <th>Chi tiết</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((c) => (
                        <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.name}</td>
                            <td>{c.description}</td>
                            <td><button>Xem</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* TODO: Thêm phân trang nếu cần */}
        </div>
    );
};

export default CategoryManagement; 