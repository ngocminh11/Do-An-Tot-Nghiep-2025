import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    message,
    Card,
    Row,
    Col,
    Typography,
    Divider,
    Select,
    Radio,
    Space
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import './Checkout.scss';

const { Title, Text } = Typography;
const { Option } = Select;

// Mock data for cart items and user details
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

// Mock data for addresses
const mockAddresses = [
    {
        id: '1',
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0987654321',
        address: '123 Đường ABC',
        city: 'TP Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        isDefault: true
    },
    {
        id: '2',
        fullName: 'Nguyễn Văn B',
        phoneNumber: '0987654322',
        address: '456 Đường XYZ',
        city: 'TP Hồ Chí Minh',
        district: 'Quận Bình Thạnh',
        ward: 'Phường 25',
        isDefault: false
    }
];

const Checkout = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [subtotal, setSubtotal] = useState(0);
    const [shippingCost, setShippingCost] = useState(0);
    const [total, setTotal] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState(mockAddresses.find(addr => addr.isDefault) || mockAddresses[0]);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

    useEffect(() => {
        form.setFieldsValue(mockAddresses.find(addr => addr.isDefault) || mockAddresses[0]);
        calculateTotals();
    }, []);

    const calculateTotals = () => {
        let newSubtotal = 0;
        mockCartItems.forEach(item => {
            newSubtotal += item.price * item.quantity;
        });
        setSubtotal(newSubtotal);
        setShippingCost(0); // For now, shipping is free
        setTotal(newSubtotal + shippingCost);
    };

    const handleAddressSelect = (addressId) => {
        const address = mockAddresses.find(addr => addr.id === addressId);
        if (address) {
            setSelectedAddress(address);
            form.setFieldsValue({
                fullName: address.fullName,
                phoneNumber: address.phoneNumber,
                city: address.city,
                district: address.district,
                ward: address.ward,
                address: address.address
            });
        }
    };

    const handleAddNewAddress = () => {
        setIsAddingNewAddress(true);
        form.resetFields();
    };

    const handleFinish = (values) => {
        console.log('Thông tin thanh toán:', { ...values, selectedAddress });
        message.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại CoCoo.');
        navigate('/order-confirmation');
    };

    return (
        <div className="checkout-page">
            <Title level={2} className="page-title">THANH TOÁN ĐƠN HÀNG</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title="Thông tin giao hàng" className="shipping-info-card">
                        <div className="address-selection">
                            <Title level={4}>Chọn địa chỉ giao hàng</Title>
                            <Radio.Group
                                value={selectedAddress?.id}
                                onChange={(e) => handleAddressSelect(e.target.value)}
                                className="address-list"
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {mockAddresses.map(address => (
                                        <Radio key={address.id} value={address.id}>
                                            <div className="address-item">
                                                <div className="address-header">
                                                    <Text strong>{address.fullName}</Text>
                                                    {address.isDefault && (
                                                        <Text type="secondary">(Mặc định)</Text>
                                                    )}
                                                </div>
                                                <div className="address-content">
                                                    <Text>{address.phoneNumber}</Text>
                                                    <Text>{`${address.address}, ${address.ward}, ${address.district}, ${address.city}`}</Text>
                                                </div>
                                            </div>
                                        </Radio>
                                    ))}
                                </Space>
                            </Radio.Group>
                            <Button
                                type="dashed"
                                onClick={handleAddNewAddress}
                                icon={<PlusOutlined />}
                                className="add-address-button"
                            >
                                Thêm địa chỉ mới
                            </Button>
                        </div>

                        {isAddingNewAddress && (
                            <>
                                <Divider />
                                <Title level={4}>Thêm địa chỉ mới</Title>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleFinish}
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="fullName"
                                                label="Họ và tên"
                                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="email"
                                                label="Email"
                                                rules={[{ required: true, message: 'Vui lòng nhập email!', type: 'email' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="phoneNumber"
                                                label="Số điện thoại"
                                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="city"
                                                label="Tỉnh/Thành phố"
                                                rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
                                            >
                                                <Select placeholder="Chọn Tỉnh/Thành phố">
                                                    <Option value="TP Hồ Chí Minh">TP Hồ Chí Minh</Option>
                                                    <Option value="Hà Nội">Hà Nội</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="district"
                                                label="Quận/Huyện"
                                                rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện!' }]}
                                            >
                                                <Select placeholder="Chọn Quận/Huyện">
                                                    <Option value="Quận 1">Quận 1</Option>
                                                    <Option value="Quận Bình Thạnh">Quận Bình Thạnh</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="ward"
                                                label="Phường/Xã"
                                                rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
                                            >
                                                <Select placeholder="Chọn Phường/Xã">
                                                    <Option value="Phường Bến Nghé">Phường Bến Nghé</Option>
                                                    <Option value="Phường 25">Phường 25</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Form.Item
                                        name="address"
                                        label="Địa chỉ chi tiết"
                                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' }]}
                                    >
                                        <Input.TextArea rows={2} />
                                    </Form.Item>
                                    <Form.Item
                                        name="notes"
                                        label="Ghi chú (tùy chọn)"
                                    >
                                        <Input.TextArea rows={2} placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng mong muốn..." />
                                    </Form.Item>
                                </Form>
                            </>
                        )}
                    </Card>

                    <Card title="Phương thức thanh toán" className="payment-method-card">
                        <Radio.Group defaultValue="cod" className="payment-options">
                            <Space direction="vertical">
                                <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
                                <Radio value="bank-transfer">Chuyển khoản ngân hàng</Radio>
                                <Radio value="momo">Ví điện tử MoMo</Radio>
                            </Space>
                        </Radio.Group>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Đơn hàng của bạn" className="order-summary-card">
                        <div className="order-items-list">
                            {mockCartItems.map(item => (
                                <div key={item._id} className="order-item">
                                    <img width={'100px'} src={item.imageUrl} alt={item.name} />
                                    <div className="item-details">
                                        <Text className="item-name">{item.name}</Text>
                                        <Text className="item-quantity">Số lượng: {item.quantity}</Text>
                                    </div>
                                    <Text className="item-price">{`${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ`}</Text>
                                </div>
                            ))}
                        </div>
                        <Divider />
                        <div className="summary-line">
                            <Text>Tạm tính:</Text>
                            <Text>{subtotal.toLocaleString('vi-VN')} VNĐ</Text>
                        </div>
                        <div className="summary-line">
                            <Text>Phí vận chuyển:</Text>
                            <Text>{shippingCost.toLocaleString('vi-VN')} VNĐ</Text>
                        </div>
                        <Divider />
                        <div className="summary-line total-line">
                            <Title level={4}>Tổng cộng:</Title>
                            <Title level={4}>{total.toLocaleString('vi-VN')} VNĐ</Title>
                        </div>
                        <Button
                            type="primary"
                            block
                            size="large"
                            htmlType="submit"
                            className="place-order-button"
                            onClick={() => form.submit()} // Trigger form submission
                        >
                            ĐẶT HÀNG
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Checkout; 