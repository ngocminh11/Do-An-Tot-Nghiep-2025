import React from 'react';

const PromotionManagement = () => {
    // TODO: Thay thế dữ liệu mẫu bằng API thực tế
    const promotions = [
        { id: 1, name: 'Khuyến mãi 1', discount: 10, start: '2024-07-01', end: '2024-07-10' },
        { id: 2, name: 'Khuyến mãi 2', discount: 20, start: '2024-07-05', end: '2024-07-15' },
    ];

    return (
        <div className="wm-promotion-management">
            <h1>Quản lý Khuyến mãi</h1>
            <input placeholder="Tìm kiếm khuyến mãi..." style={{ marginBottom: 16 }} />
            <button style={{ marginBottom: 16 }}>Thêm khuyến mãi</button>
            <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên khuyến mãi</th>
                        <th>Giảm (%)</th>
                        <th>Bắt đầu</th>
                        <th>Kết thúc</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.discount}%</td>
                            <td>{p.start}</td>
                            <td>{p.end}</td>
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

export default PromotionManagement; 