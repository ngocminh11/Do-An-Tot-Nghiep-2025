import React from 'react';

const CategoryDetail = () => {
    // TODO: Lấy dữ liệu danh mục từ API hoặc props
    const category = {
        id: 1,
        name: 'Danh mục 1',
        description: 'Mô tả 1',
    };

    return (
        <div className="staff-category-detail">
            <h2>Chi tiết danh mục</h2>
            <p><b>ID:</b> {category.id}</p>
            <p><b>Tên:</b> {category.name}</p>
            <p><b>Mô tả:</b> {category.description}</p>
            {/* TODO: Thêm các thông tin khác nếu cần */}
        </div>
    );
};

export default CategoryDetail; 