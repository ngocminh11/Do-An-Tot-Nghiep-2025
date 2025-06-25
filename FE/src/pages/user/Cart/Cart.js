import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import cartService from '../../../services/cartService';
import productService from '../../../services/productService';

const { Title, Text } = Typography;

// Memoized Cart Item Component
const CartItem = React.memo(({ record, imageUrls, onQuantityChange, onDelete }) => {
    const itemTotal = useMemo(() =>
        (record.price * record.quantity).toLocaleString('vi-VN') + ' VNĐ',
        [record.price, record.quantity]
    );

    const productImage = useMemo(() =>
        imageUrls[record.productId] || record.imageUrl || '/images/products/default.jpg',
        [imageUrls, record.productId, record.imageUrl]
    );

    return (
        <Space>
            <img
                src={productImage}
                alt={record.name}
                style={{ width: 60, height: 60, objectFit: 'cover' }}
                loading="lazy"
            />
            <Text>{record.name}</Text>
        </Space>
    );
});

// Memoized Cart Summary Component
const CartSummary = React.memo(({ subtotal, total, onCheckout, cartItems }) => {
    const isCheckoutDisabled = useMemo(() => cartItems.length === 0, [cartItems.length]);

    return (
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
                <div className="summary-item">
                    <Text strong>Tổng cộng:</Text>
                    <Text strong>{total.toLocaleString('vi-VN')} VNĐ</Text>
                </div>
                <Button
                    type="primary"
                    size="large"
                    block
                    onClick={onCheckout}
                    disabled={isCheckoutDisabled}
                >
                    Tiến hành thanh toán
                </Button>
            </Space>
        </Card>
    );
});

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState({}); // key: productId, value: objectURL

    // Memoized event handlers
    const handleQuantityChange = useCallback(async (value, recordId) => {
        const item = cartItems.find(i => i._id === recordId);
        if (!item) return;
        try {
            await cartService.updateQuantity(item.productId, value);
            setCartItems(prevItems =>
                prevItems.map(i =>
                    i._id === recordId ? { ...i, quantity: value } : i
                )
            );
        } catch (err) {
            message.error('Không thể cập nhật số lượng!');
        }
    }, [cartItems]);

    const handleDelete = useCallback(async (recordId) => {
        const item = cartItems.find(i => i._id === recordId);
        if (!item) return;
        try {
            await cartService.removeFromCart(item.productId);
            setCartItems(prevItems => prevItems.filter(i => i._id !== recordId));
            message.success('Sản phẩm đã được xóa khỏi giỏ hàng!');
        } catch (err) {
            message.error('Không thể xóa sản phẩm khỏi giỏ hàng!');
        }
    }, [cartItems]);

    const handleCheckout = useCallback(() => {
        navigate('/checkout');
    }, [navigate]);

    // Memoized calculations
    const calculateTotals = useCallback(() => {
        let newSubtotal = 0;
        cartItems.forEach(item => {
            newSubtotal += item.price * item.quantity;
        });
        setSubtotal(newSubtotal);
        setTotal(newSubtotal);
    }, [cartItems]);

    // Memoized table columns
    const columns = useMemo(() => [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <CartItem
                    record={record}
                    imageUrls={imageUrls}
                    onQuantityChange={handleQuantityChange}
                    onDelete={handleDelete}
                />
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
    ], [imageUrls, handleQuantityChange, handleDelete]);

    // Optimized image loading
    const loadProductImages = useCallback(async (items) => {
        const imagePromises = items.map(async (item) => {
            const pid = item.productId?._id || item.productId;
            let imgPath = item.productId?.media?.mainImage || item.imageUrl;

            if (imgPath && !imageUrls[pid]) {
                try {
                    const blob = await productService.getImageById(imgPath.replace('/media/', ''));
                    const objectUrl = URL.createObjectURL(blob);
                    return { productId: pid, url: objectUrl };
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

    // Optimized useEffect for cart fetching
    useEffect(() => {
        let isMounted = true;

        const fetchCart = async () => {
            setLoading(true);
            try {
                const cart = await cartService.getMyCart();
                if (!isMounted) return;

                if (cart && Array.isArray(cart.items)) {
                    const processedItems = cart.items.map(item => ({
                        _id: item._id || item.productId?._id || item.productId,
                        productId: item.productId?._id || item.productId,
                        name: item.productId?.basicInformation?.productName || item.productId?.name || '',
                        imageUrl: item.productId?.media?.mainImage || '',
                        price: item.productId?.pricingAndInventory?.salePrice || 0,
                        quantity: item.quantity
                    }));

                    setCartItems(processedItems);

                    // Load images in background
                    loadProductImages(cart.items);
                } else {
                    setCartItems([]);
                }
            } catch (err) {
                if (isMounted) {
                    setCartItems([]);
                    message.error('Không thể tải giỏ hàng!');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCart();

        return () => {
            isMounted = false;
        };
    }, [loadProductImages]);

    // Optimized useEffect for totals calculation
    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

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
                    <CartSummary
                        subtotal={subtotal}
                        total={total}
                        onCheckout={handleCheckout}
                        cartItems={cartItems}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default Cart; 