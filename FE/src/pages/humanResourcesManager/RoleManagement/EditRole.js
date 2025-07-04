import React from 'react';

const EditRole = () => {
    return (
        <div className="hr-edit-role">
            <h2>Chỉnh sửa vai trò</h2>
            <form>
                <div><label>Tên vai trò: <input type="text" defaultValue="Nhân viên" /></label></div>
                <div><label>Mô tả: <input type="text" defaultValue="Quyền hạn cơ bản" /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default EditRole; 