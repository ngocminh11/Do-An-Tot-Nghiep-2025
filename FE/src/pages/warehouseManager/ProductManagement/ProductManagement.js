import React from 'react';

const ProductManagement = () => {
    // TODO: Thay thế dữ liệu mẫu bằng API thực tế
    const products = [
        { id: 1, name: 'Sản phẩm A', category: 'Danh mục 1', price: 100000 },
        { id: 2, name: 'Sản phẩm B', category: 'Danh mục 2', price: 200000 },
    ];

    return (
        <div className="wm-product-management">
            <h1>Quản lý Sản phẩm</h1>
            <input placeholder="Tìm kiếm sản phẩm..." style={{ marginBottom: 16 }} />
            <button style={{ marginBottom: 16 }}>Thêm sản phẩm</button>
            <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.category}</td>
                            <td>{p.price.toLocaleString()}₫</td>
                            <td>
                                <button>Xem</button>{' '}
                                <button>Sửa</button>{' '}
                                <button>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* TODO: Thêm phân trang nếu cần */}
        </div>
    );
};

export default ProductManagement; 