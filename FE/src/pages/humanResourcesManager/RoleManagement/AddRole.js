import React from 'react';

const AddRole = () => {
    return (
        <div className="hr-add-role">
            <h2>Thêm vai trò mới</h2>
            <form>
                <div><label>Tên vai trò: <input type="text" /></label></div>
                <div><label>Mô tả: <input type="text" /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default AddRole; 