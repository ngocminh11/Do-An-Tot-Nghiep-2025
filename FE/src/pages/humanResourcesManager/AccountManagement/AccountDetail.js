import React from 'react';

const AccountDetail = () => {
    // TODO: Lấy dữ liệu tài khoản từ API hoặc props
    const account = {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'a@email.com',
        role: 'Nhân viên',
        status: 'Hoạt động',
    };

    return (
        <div className="hr-account-detail">
            <h2>Chi tiết tài khoản</h2>
            <p><b>ID:</b> {account.id}</p>
            <p><b>Họ tên:</b> {account.name}</p>
            <p><b>Email:</b> {account.email}</p>
            <p><b>Vai trò:</b> {account.role}</p>
            <p><b>Trạng thái:</b> {account.status}</p>
            {/* TODO: Thêm các thông tin khác nếu cần */}
        </div>
    );
};

export default AccountDetail; 