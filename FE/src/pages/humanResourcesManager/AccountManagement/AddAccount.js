import React from 'react';

const AddAccount = () => {
    return (
        <div className="hr-add-account">
            <h2>Thêm tài khoản mới</h2>
            <form>
                <div><label>Họ tên: <input type="text" /></label></div>
                <div><label>Email: <input type="email" /></label></div>
                <div><label>Vai trò: <select><option>Nhân viên</option><option>Quản lý</option></select></label></div>
                <div><label>Trạng thái: <select><option>Hoạt động</option><option>Đã khóa</option></select></label></div>
                <div><label>Mật khẩu: <input type="password" /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default AddAccount; 