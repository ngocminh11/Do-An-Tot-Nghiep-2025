import React, { useState } from 'react';
import { Table, Button, InputNumber, Card, Typography, message } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { mockCarts, mockProducts } from '../../../services/mockData';
import './Cart.scss';

const { Title } = Typography;

const Cart = () => {
    const [cartItems, setCartItems] = useState(mockCarts[0].items);

    const handleQuantityChange = (productId, quantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const handleRemoveItem = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
        message.success('Đã xóa sản phẩm khỏi giỏ hàng');
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productId',
            key: 'product',
            render: (productId) => {
                const product = mockProducts.find(p => p._id === productId);
                return (
                    <div className="product-info">
                        <img src={product.imageUrls[0]} alt={product.name} />
                        <span>{product.name}</span>
                    </div>
                );
            },
        },
        {
            title: 'Giá',
            dataIndex: 'productId',
            key: 'price',
            render: (productId) => {
                const product = mockProducts.find(p => p._id === productId);
                return `${product.price.toLocaleString('vi-VN')} VNĐ`;
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <InputNumber
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(value) => handleQuantityChange(record.productId, value)}
                />
            ),
        },
        {
            title: 'Tổng',
            key: 'total',
            render: (_, record) => {
                const product = mockProducts.find(p => p._id === record.productId);
                return `${(product.price * record.quantity).toLocaleString('vi-VN')} VNĐ`;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(record.productId)}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    const subtotal = cartItems.reduce((total, item) => {
        const product = mockProducts.find(p => p._id === item.productId);
        return total + (product.price * item.quantity);
    }, 0);

    const shipping = 30000; // 30,000 VNĐ
    const total = subtotal + shipping;

    return (
        <div className="cart-page">
            <Title level={2}>Giỏ hàng</Title>

            {cartItems.length > 0 ? (
                <div className="cart-content">
                    <Table
                        columns={columns}
                        dataSource={cartItems}
                        rowKey="productId"
                        pagination={false}
                    />

                    <Card className="cart-summary">
                        <div className="summary-item">
                            <span>Tạm tính:</span>
                            <span>{subtotal.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="summary-item">
                            <span>Phí vận chuyển:</span>
                            <span>{shipping.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="summary-item total">
                            <span>Tổng cộng:</span>
                            <span>{total.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <Button type="primary" size="large" block icon={<ShoppingOutlined />}>
                            Tiến hành thanh toán
                        </Button>
                    </Card>
                </div>
            ) : (
                <div className="empty-cart">
                    <ShoppingOutlined className="icon" />
                    <p>Giỏ hàng của bạn đang trống</p>
                    <Button type="primary" size="large">
                        Tiếp tục mua sắm
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Cart; 