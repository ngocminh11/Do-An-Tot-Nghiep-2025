import React from 'react';

const AddProduct = () => {
    return (
        <div className="wm-add-product">
            <h2>Thêm sản phẩm mới</h2>
            <form>
                <div><label>Tên sản phẩm: <input type="text" /></label></div>
                <div><label>Danh mục: <input type="text" /></label></div>
                <div><label>Giá: <input type="number" /></label></div>
                <div><label>Mô tả: <textarea /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default AddProduct; 