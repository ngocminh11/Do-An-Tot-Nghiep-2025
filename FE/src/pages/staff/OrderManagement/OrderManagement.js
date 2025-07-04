import React from 'react';

const OrderManagement = () => {
    // TODO: Thay thế dữ liệu mẫu bằng API thực tế
    const orders = [
        { id: 1, customer: 'Nguyễn Văn A', total: 500000, status: 'Đang xử lý' },
        { id: 2, customer: 'Trần Thị B', total: 1200000, status: 'Hoàn thành' },
    ];

    return (
        <div className="staff-order-management">
            <h1>Danh sách Đơn hàng</h1>
            <input placeholder="Tìm kiếm đơn hàng..." style={{ marginBottom: 16 }} />
            <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Chi tiết</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((o) => (
                        <tr key={o.id}>
                            <td>{o.id}</td>
                            <td>{o.customer}</td>
                            <td>{o.total.toLocaleString()}₫</td>
                            <td>{o.status}</td>
                            <td><button>Xem</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* TODO: Thêm phân trang nếu cần */}
        </div>
    );
};

export default OrderManagement; 