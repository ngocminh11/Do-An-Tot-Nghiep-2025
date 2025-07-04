import React from 'react';

const EditCategory = () => {
    return (
        <div className="wm-edit-category">
            <h2>Chỉnh sửa danh mục</h2>
            <form>
                <div><label>Tên danh mục: <input type="text" defaultValue="Danh mục 1" /></label></div>
                <div><label>Mô tả: <textarea defaultValue="Mô tả 1" /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default EditCategory; 