import React from 'react';

const AddCategory = () => {
    return (
        <div className="wm-add-category">
            <h2>Thêm danh mục mới</h2>
            <form>
                <div><label>Tên danh mục: <input type="text" /></label></div>
                <div><label>Mô tả: <textarea /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default AddCategory; 