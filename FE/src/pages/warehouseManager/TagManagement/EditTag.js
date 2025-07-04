import React from 'react';

const EditTag = () => {
    return (
        <div className="wm-edit-tag">
            <h2>Chỉnh sửa tag</h2>
            <form>
                <div><label>Tên tag: <input type="text" defaultValue="Tag 1" /></label></div>
                <div><label>Mô tả: <textarea defaultValue="Mô tả tag 1" /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default EditTag; 