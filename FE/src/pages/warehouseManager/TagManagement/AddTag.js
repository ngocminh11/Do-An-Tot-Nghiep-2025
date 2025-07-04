import React from 'react';

const AddTag = () => {
    return (
        <div className="wm-add-tag">
            <h2>Thêm tag mới</h2>
            <form>
                <div><label>Tên tag: <input type="text" /></label></div>
                <div><label>Mô tả: <textarea /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default AddTag; 