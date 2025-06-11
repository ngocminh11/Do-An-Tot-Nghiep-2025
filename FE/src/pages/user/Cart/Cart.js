import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    InputNumber,
    Popconfirm,
    message,
    Card,
    Row,
    Col,
    Typography,
    Divider
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Cart.scss';

const { Title, Text } = Typography;

const mockCartItems = [
    {
        _id: '1',
        productId: '1',
        name: 'Serum Vitamin C Chống Lão Hóa',
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80',
        price: 250000,
        quantity: 2
    },
    {
        _id: '2',
        productId: '2',
        name: 'Kem Dưỡng Ẩm Hyaluronic Acid',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
        price: 350000,
        quantity: 1
    }
];

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(mockCartItems);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        calculateTotals();
    }, [cartItems]);

    const calculateTotals = () => {
        let newSubtotal = 0;
        cartItems.forEach(item => {
            newSubtotal += item.price * item.quantity;
        });
        setSubtotal(newSubtotal);
        // For now, no discount or shipping logic
        setTotal(newSubtotal);
    };

    const handleQuantityChange = (value, recordId) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === recordId ? { ...item, quantity: value } : item
            )
        );
    };

    const handleDelete = (recordId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== recordId));
        message.success('Sản phẩm đã được xóa khỏi giỏ hàng!');
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <img src={record.imageUrl} alt={record.name} style={{ width: 60, height: 60, objectFit: 'cover' }} />
                    <Text>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <InputNumber
                    min={1}
                    value={quantity}
                    onChange={(value) => handleQuantityChange(value, record._id)}
                    style={{ width: 90 }}
                />
            ),
        },
        {
            title: 'Tổng cộng',
            key: 'itemTotal',
            render: (_, record) => `${(record.price * record.quantity).toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Popconfirm
                    title="Bạn có chắc muốn xoá sản phẩm này?"
                    onConfirm={() => handleDelete(record._id)}
                    okText="Xoá"
                    cancelText="Huỷ"
                >
                    <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="cart-page">
            <Title level={2} className="page-title">GIỎ HÀNG CỦA BẠN</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card className="cart-items-card">
                        <Table
                            columns={columns}
                            dataSource={cartItems}
                            rowKey="_id"
                            pagination={false}
                            summary={pageData => {
                                return (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={3} align="right">
                                            <Text strong>Tổng phụ:</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} colSpan={2} align="left">
                                            <Text strong>{subtotal.toLocaleString('vi-VN')} VNĐ</Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                );
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Tóm tắt đơn hàng" className="cart-summary-card">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div className="summary-item">
                                <Text>Tổng phụ:</Text>
                                <Text>{subtotal.toLocaleString('vi-VN')} VNĐ</Text>
                            </div>
                            <div className="summary-item">
                                <Text>Phí vận chuyển:</Text>
                                <Text>Miễn phí</Text>
                            </div>
                            <Divider />
                            <div className="summary-item total-price">
                                <Title level={4}>Tổng cộng:</Title>
                                <Title level={4}>{total.toLocaleString('vi-VN')} VNĐ</Title>
                            </div>
                            <Button
                                type="primary"
                                block
                                size="large"
                                className="checkout-button"
                                onClick={() => navigate('/checkout')}
                            >
                                TIẾN HÀNH THANH TOÁN
                            </Button>
                            <Button
                                type="default"
                                block
                                size="large"
                                className="continue-shopping-button"
                                onClick={() => navigate('/products')}
                            >
                                TIẾP TỤC MUA SẮM
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Cart; 