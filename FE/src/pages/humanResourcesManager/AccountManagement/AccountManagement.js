import React from 'react';

const AccountManagement = () => {
    // TODO: Thay thế dữ liệu mẫu bằng API thực tế
    const accounts = [
        { id: 1, name: 'Nguyễn Văn A', email: 'a@email.com', role: 'Nhân viên', status: 'Hoạt động' },
        { id: 2, name: 'Trần Thị B', email: 'b@email.com', role: 'Quản lý', status: 'Đã khóa' },
    ];

    return (
        <div className="hr-account-management">
            <h1>Quản lý Tài khoản</h1>
            <input placeholder="Tìm kiếm tài khoản..." style={{ marginBottom: 16 }} />
            <button style={{ marginBottom: 16 }}>Thêm tài khoản</button>
            <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((a) => (
                        <tr key={a.id}>
                            <td>{a.id}</td>
                            <td>{a.name}</td>
                            <td>{a.email}</td>
                            <td>{a.role}</td>
                            <td>{a.status}</td>
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

export default AccountManagement; 