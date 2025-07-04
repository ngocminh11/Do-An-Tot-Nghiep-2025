import React from 'react';

const OrderDetail = () => {
    // TODO: Lấy dữ liệu đơn hàng từ API hoặc props
    const order = {
        id: 1,
        customer: 'Nguyễn Văn A',
        total: 500000,
        status: 'Đang xử lý',
        items: [
            { name: 'Sản phẩm A', quantity: 2, price: 100000 },
            { name: 'Sản phẩm B', quantity: 1, price: 300000 },
        ],
    };

    return (
        <div className="staff-order-detail">
            <h2>Chi tiết đơn hàng</h2>
            <p><b>ID:</b> {order.id}</p>
            <p><b>Khách hàng:</b> {order.customer}</p>
            <p><b>Tổng tiền:</b> {order.total.toLocaleString()}₫</p>
            <p><b>Trạng thái:</b> {order.status}</p>
            <h3>Sản phẩm:</h3>
            <ul>
                {order.items.map((item, idx) => (
                    <li key={idx}>{item.name} - SL: {item.quantity} - Giá: {item.price.toLocaleString()}₫</li>
                ))}
            </ul>
            {/* TODO: Thêm các thông tin khác nếu cần */}
        </div>
    );
};

export default OrderDetail; 