import React, { useState, useEffect, useCallback } from 'react';
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
import cartService from '../../../services/cartService';
import orderService from '../../../services/orderService';
import AddressForm from '../../../components/common/AddressForm';
import { useAuth } from '../../../contexts/AuthContext';
import accountService from '../../../services/accountService';
import { productService, getImageByIdUser } from '../../../services/productService';
import config from '../../../config';

const { Title, Text } = Typography;
const { Option } = Select;

const getImageUrl = async (imgPath) => {
    if (!imgPath) return '/images/products/default.jpg';
    try {
        const response = await fetch(`${config.API_BASE_URL}${imgPath}`);
        if (!response.ok) throw new Error('Image fetch failed');
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch {
        if (imgPath.startsWith('http')) return imgPath;
        return `${config.API_BASE_URL}${imgPath}`;
    }
};

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [shippingCost, setShippingCost] = useState(0);
    const [total, setTotal] = useState(0);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [imageUrls, setImageUrls] = useState({});

    useEffect(() => {
        // Lấy địa chỉ giao hàng từ backend khi user thay đổi
        const fetchAddresses = async () => {
            if (user && user._id) {
                try {
                    const res = await accountService.getUserById(user._id);
                    setAddresses(res.data.addresses || []);
                } catch (e) {
                    setAddresses([]);
                }
            }
        };
        fetchAddresses();
    }, [user]);

    const loadProductImages = useCallback(async (items) => {
        const imagePromises = items.map(async (item) => {
            const pid = item.productId || item._id;
            let imgPath = item.imageUrl;
            if (imgPath && !imageUrls[pid]) {
                try {
                    const url = await getImageUrl(imgPath);
                    return { productId: pid, url };
                } catch (e) {
                    return null;
                }
            }
            return null;
        });
        const results = await Promise.all(imagePromises);
        const newImageUrls = {};
        results.forEach(result => {
            if (result) {
                newImageUrls[result.productId] = result.url;
            }
        });
        setImageUrls(prev => ({ ...prev, ...newImageUrls }));
    }, [imageUrls]);

    useEffect(() => {
        // Ưu tiên lấy sản phẩm từ localStorage (checkoutItems)
        const checkoutItems = localStorage.getItem('checkoutItems');
        if (checkoutItems) {
            try {
                const parsed = JSON.parse(checkoutItems);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Đảm bảo dữ liệu có đầy đủ thông tin cần thiết
                    const validatedItems = parsed.map(item => ({
                        _id: item._id || item.productId,
                        productId: item.productId,
                        name: item.name || 'Không có tên',
                        imageUrl: item.imageUrl || '',
                        price: item.price || 0,
                        quantity: item.quantity || 1
                    }));
                    setCartItems(validatedItems);
                    loadProductImages(validatedItems);
                    return;
                }
            } catch {
                setCartItems([]);
            }
        }
        // Nếu không có, fallback về toàn bộ giỏ hàng
        const fetchCart = async () => {
            try {
                const cart = await cartService.getMyCart();
                if (cart && Array.isArray(cart.items)) {
                    const mapped = cart.items.map(item => ({
                        _id: item._id || item.productId?._id || item.productId,
                        productId: item.productId?._id || item.productId,
                        name: item.productId?.basicInformation?.productName || item.productId?.name || '',
                        imageUrl: item.productId?.media?.mainImage || '',
                        price: item.productId?.pricingAndInventory?.salePrice || 0,
                        quantity: item.quantity
                    }));
                    setCartItems(mapped);
                    loadProductImages(mapped);
                } else {
                    setCartItems([]);
                }
            } catch (err) {
                setCartItems([]);
            }
        };
        fetchCart();
    }, []);

    useEffect(() => {
        // Log cartItems để debug hình ảnh
        console.log('cartItems in Checkout:', cartItems);
        calculateTotals();
    }, [cartItems]);

    const calculateTotals = () => {
        let newSubtotal = 0;
        cartItems.forEach(item => {
            newSubtotal += item.price * item.quantity;
        });
        setSubtotal(newSubtotal);
        setShippingCost(0); // For now, shipping is free
        setTotal(newSubtotal + shippingCost);
    };

    const handleAddressSelect = (addressId) => {
        const address = addresses.find(addr => addr.id === addressId);
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

    const handleFinish = async (values) => {
        try {
            // Map payment method values to match BE enum
            const paymentMethodMap = {
                'cod': 'COD',
                'bank-transfer': 'BankTransfer',
                'momo': 'Momo'
            };

            // Chuẩn bị dữ liệu đơn hàng đúng với backend
            const orderData = {
                items: cartItems.map(item => ({
                    product: item.productId, // backend expects 'product' ID only
                    quantity: item.quantity
                })),
                paymentMethod: paymentMethodMap[values.paymentMethod] || 'COD',
                notes: values.notes || '',
                promotionCode: values.voucher || ''
            };

            // Nếu chọn MoMo thì set luôn trạng thái đã thanh toán
            if (orderData.paymentMethod === 'Momo') {
                orderData.status = 'Đã thanh toán';
            }

            console.log('Sending order data:', orderData); // Debug log

            await orderService.createOrder(orderData);
            message.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại CoCoo.');
            // Xoá giỏ hàng sau khi đặt hàng thành công
            if (user && user._id) await cartService.clearCartByUserId(user._id);
            // Xóa checkoutItems từ localStorage sau khi đặt hàng thành công
            localStorage.removeItem('checkoutItems');
            // Cập nhật lại addresses
            const res = await accountService.getUserById(user._id);
            setAddresses(res.data.addresses || []);
            navigate('/order-confirmation');
        } catch (err) {
            console.error('Order creation error:', err); // Debug log
            message.error(err?.message || 'Đặt hàng thất bại!');
        }
    };

    return (
        <div className="checkout-page minimal-checkout">
            <Title level={3} className="page-title" style={{ textAlign: 'center', marginBottom: 16 }}>THANH TOÁN</Title>
            {/* Hiển thị thông báo nếu đang mua ngay */}
            {cartItems.length === 1 && localStorage.getItem('checkoutItems') && (
                <div style={{ textAlign: 'center', marginBottom: 16, color: '#1890ff' }}>
                    <Text>Bạn đang mua ngay sản phẩm này</Text>
                </div>
            )}
            <Row gutter={[18, 18]} justify="center">
                <Col xs={24} lg={11}>
                    <Card className="order-summary-card minimal-order-list" bodyStyle={{ padding: 18 }}>
                        <Title level={5} style={{ marginBottom: 8 }}>Sản phẩm</Title>
                        {cartItems.map(item => (
                            <div key={item._id} className="order-item minimal-order-item" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <img
                                    width={54}
                                    height={54}
                                    src={imageUrls[item._id] || '/images/products/default.jpg'}
                                    alt={item.name}
                                    style={{ borderRadius: 8, objectFit: 'cover', marginRight: 12 }}
                                />
                                <div style={{ flex: 1 }}>
                                    <Text strong>{item.name}</Text>
                                    <div style={{ fontSize: 13, color: '#888' }}>x{item.quantity}</div>
                                </div>
                                <Text style={{ minWidth: 80, textAlign: 'right' }}>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</Text>
                            </div>
                        ))}
                    </Card>
                </Col>
                <Col xs={24} lg={13}>
                    <Card className="checkout-main-card" bodyStyle={{ padding: 18, maxWidth: 520, margin: '0 auto' }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFinish}
                        >
                            {/* Địa chỉ giao hàng */}
                            <div className="address-selection minimal-address">
                                <Title level={5} style={{ marginBottom: 8 }}>Địa chỉ giao hàng</Title>
                                <Radio.Group
                                    value={selectedAddress?.id}
                                    onChange={(e) => handleAddressSelect(e.target.value)}
                                    className="address-list"
                                    style={{ width: '100%' }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {addresses.map(address => (
                                            <Radio key={address.id} value={address.id} style={{ width: '100%' }}>
                                                <div style={{ fontSize: 13 }}>
                                                    <Text strong>{address.fullName}</Text> - {address.phoneNumber}<br />
                                                    <span style={{ color: '#888' }}>{`${address.address}, ${address.ward}, ${address.district}, ${address.city}`}</span>
                                                    {address.isDefault && <Text type="secondary" style={{ marginLeft: 8 }}>(Mặc định)</Text>}
                                                </div>
                                            </Radio>
                                        ))}
                                    </Space>
                                </Radio.Group>
                                <Button
                                    type="link"
                                    onClick={handleAddNewAddress}
                                    icon={<PlusOutlined />}
                                    style={{ padding: 0, marginTop: 4 }}
                                >
                                    Thêm địa chỉ mới
                                </Button>
                            </div>
                            {isAddingNewAddress && (
                                <div style={{ margin: '8px 0' }}>
                                    <AddressForm
                                        form={form}
                                        onFinish={handleFinish}
                                        submitText="Lưu địa chỉ và đặt hàng"
                                    />
                                </div>
                            )}
                            <Divider style={{ margin: '12px 0' }} />
                            {/* Phương thức thanh toán */}
                            <Form.Item name="paymentMethod" initialValue="cod" rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]} style={{ marginBottom: 8 }}>
                                <Radio.Group className="payment-options" style={{ width: '100%' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
                                        <Radio value="bank-transfer">Chuyển khoản ngân hàng</Radio>
                                        <Radio value="momo">Ví MoMo</Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                            {/* Voucher */}
                            <Form.Item name="voucher" style={{ marginBottom: 8 }}>
                                <Input placeholder="Mã giảm giá (nếu có)" allowClear />
                            </Form.Item>
                            <Divider style={{ margin: '12px 0' }} />
                            {/* Tổng tiền */}
                            <div className="summary-line minimal-summary" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                                <span>Tạm tính</span>
                                <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="summary-line minimal-summary" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                                <span>Phí vận chuyển</span>
                                <span>{shippingCost.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="summary-line total-line minimal-summary" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 17, margin: '8px 0' }}>
                                <span>Tổng cộng</span>
                                <span style={{ color: '#d4380d' }}>{total.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                className="place-order-button minimal-place-order"
                                style={{ width: '100%', marginTop: 12 }}
                            >
                                ĐẶT HÀNG
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Checkout; 