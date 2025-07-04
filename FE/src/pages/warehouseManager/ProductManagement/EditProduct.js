import React from 'react';

const EditProduct = () => {
    return (
        <div className="wm-edit-product">
            <h2>Chỉnh sửa sản phẩm</h2>
            <form>
                <div><label>Tên sản phẩm: <input type="text" defaultValue="Sản phẩm A" /></label></div>
                <div><label>Danh mục: <input type="text" defaultValue="Danh mục 1" /></label></div>
                <div><label>Giá: <input type="number" defaultValue={100000} /></label></div>
                <div><label>Mô tả: <textarea defaultValue="Mô tả sản phẩm A" /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default EditProduct; 