import React from 'react';

const EditAccount = () => {
    return (
        <div className="hr-edit-account">
            <h2>Chỉnh sửa tài khoản</h2>
            <form>
                <div><label>Họ tên: <input type="text" defaultValue="Nguyễn Văn A" /></label></div>
                <div><label>Email: <input type="email" defaultValue="a@email.com" /></label></div>
                <div><label>Vai trò: <select defaultValue="Nhân viên"><option>Nhân viên</option><option>Quản lý</option></select></label></div>
                <div><label>Trạng thái: <select defaultValue="Hoạt động"><option>Hoạt động</option><option>Đã khóa</option></select></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default EditAccount; 