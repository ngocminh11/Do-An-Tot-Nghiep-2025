import React from 'react';

const RoleManagement = () => {
    // TODO: Thay thế dữ liệu mẫu bằng API thực tế
    const roles = [
        { id: 1, name: 'Nhân viên', description: 'Quyền hạn cơ bản' },
        { id: 2, name: 'Quản lý', description: 'Quyền hạn cao' },
    ];

    return (
        <div className="hr-role-management">
            <h1>Quản lý Vai trò</h1>
            <button style={{ marginBottom: 16 }}>Thêm vai trò</button>
            <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên vai trò</th>
                        <th>Mô tả</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((r) => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.name}</td>
                            <td>{r.description}</td>
                            <td>
                                <button>Sửa</button>{' '}
                                <button>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoleManagement; 