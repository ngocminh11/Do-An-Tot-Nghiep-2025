import React from 'react';

const ProductDetail = () => {
    // TODO: Lấy dữ liệu sản phẩm từ API hoặc props
    const product = {
        id: 1,
        name: 'Sản phẩm A',
        category: 'Danh mục 1',
        price: 100000,
        description: 'Mô tả sản phẩm A',
    };

    return (
        <div className="staff-product-detail">
            <h2>Chi tiết sản phẩm</h2>
            <p><b>ID:</b> {product.id}</p>
            <p><b>Tên:</b> {product.name}</p>
            <p><b>Danh mục:</b> {product.category}</p>
            <p><b>Giá:</b> {product.price.toLocaleString()}₫</p>
            <p><b>Mô tả:</b> {product.description}</p>
            {/* TODO: Thêm các thông tin khác nếu cần */}
        </div>
    );
};

export default ProductDetail; 