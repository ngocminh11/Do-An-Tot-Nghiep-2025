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
    Divider,
    Checkbox
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Cart.scss';
import cartService from '../../../services/cartService';
import productService, { getImageByIdUser } from '../../../services/productService';
import config from '../../../config';

const { Title, Text } = Typography;

// Memoized Cart Item Component
const CartItem = React.memo(({ record, imageUrls, categories, tags }) => {
    const product = record.productId || {};
    const productName = product.basicInformation?.productName || product.name || '';
    const productImage = useMemo(() => {
        if (imageUrls[product._id]) return imageUrls[product._id];
        if (product.mediaFiles && Array.isArray(product.mediaFiles.images) && product.mediaFiles.images[0]?.path) {
            const path = product.mediaFiles.images[0].path;
            return path.startsWith('http') ? path : `${config.API_BASE_URL}${path}`;
        }
        if (product.media && product.media.mainImage) return product.media.mainImage;
        return '/images/products/default.jpg';
    }, [imageUrls, product]);
    const categoryNames = useMemo(() => {
        if (!Array.isArray(product.basicInformation?.categoryIds)) return [];
        return product.basicInformation.categoryIds.map(cat =>
            typeof cat === 'object' ? cat.name : (categories.find(c => c._id === cat)?.name || 'Không phân loại')
        );
    }, [product, categories]);
    const tagNames = useMemo(() => {
        if (!Array.isArray(product.basicInformation?.tagIds)) return [];
        return product.basicInformation.tagIds.map(tag =>
            typeof tag === 'object' ? tag.name : (tags.find(t => t._id === tag)?.name || 'Không tag')
        );
    }, [product, tags]);
    const priceInfo = product.pricingAndInventory || {};
    const itemTotal = (priceInfo.salePrice || 0) * record.quantity;
    return (
        <div className="cart-product-card">
            <img
                src={productImage}
                alt={productName}
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 12 }}
                loading="lazy"
            />
            <div className="cart-product-info">
                <div className="cart-product-title">{productName}</div>
                <div className="category">{categoryNames.join(', ')}</div>
                <div className="tags">{tagNames.map(name => <span key={name} className="tag-item">{name}</span>)}</div>
                <div className="price">
                    {priceInfo.salePrice?.toLocaleString('vi-VN')} VNĐ
                    {priceInfo.originalPrice > priceInfo.salePrice && (
                        <span className="original-price">{priceInfo.originalPrice.toLocaleString('vi-VN')} VNĐ</span>
                    )}
                </div>
                <div className="stock-status">
                    {priceInfo.stockQuantity > 0 ? (
                        <span className="in-stock">Còn {priceInfo.stockQuantity} {priceInfo.unit || ''}</span>
                    ) : (
                        <span className="out-of-stock">Hết hàng</span>
                    )}
                </div>
                <div className="status">
                    <span className={`status-badge status-${(product.basicInformation?.status || '').replace(/\s/g, '').toLowerCase()}`}>{product.basicInformation?.status || 'N/A'}</span>
                </div>
            </div>
        </div>
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

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState({});
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    // Memoized event handlers
    const handleQuantityChange = useCallback(async (value, recordId) => {
        const item = cartItems.find(i => i._id === recordId);
        if (!item) return;
        const product = item.productId;
        const productId = product?._id;
        const stock = product?.pricingAndInventory?.stockQuantity ?? 0;
        if (value > stock) {
            message.error(`Chỉ còn ${stock} sản phẩm trong kho.`);
            return;
        }
        try {
            await cartService.updateQuantity(productId, value);
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
        const product = item.productId;
        const productId = product?._id;
        try {
            await cartService.removeFromCart(productId);
            setCartItems(prevItems => prevItems.filter(i => i._id !== recordId));
            message.success('Sản phẩm đã được xóa khỏi giỏ hàng!');
        } catch (err) {
            message.error('Không thể xóa sản phẩm khỏi giỏ hàng!');
        }
    }, [cartItems]);

    const handleDeleteSelected = async () => {
        if (selectedRowKeys.length === 0) return;
        try {
            await Promise.all(selectedRowKeys.map(id => {
                const item = cartItems.find(i => i._id === id);
                if (item) return cartService.removeFromCart(item.productId?._id);
                return null;
            }));
            setCartItems(prev => prev.filter(i => !selectedRowKeys.includes(i._id)));
            setSelectedRowKeys([]);
            message.success('Đã xóa các sản phẩm đã chọn!');
        } catch {
            message.error('Không thể xóa các sản phẩm đã chọn!');
        }
    };

    const handleClearCart = async () => {
        try {
            await cartService.clearMyCart();
            setCartItems([]);
            setSelectedRowKeys([]);
            message.success('Đã xóa tất cả sản phẩm trong giỏ hàng!');
        } catch {
            message.error('Không thể xóa tất cả sản phẩm!');
        }
    };

    const handleCheckout = useCallback(() => {
        const itemsToCheckout = cartItems.filter(i => selectedRowKeys.includes(i._id));
        if (itemsToCheckout.length === 0) {
            message.warning('Vui lòng chọn sản phẩm muốn thanh toán!');
            return;
        }
        localStorage.setItem('checkoutItems', JSON.stringify(itemsToCheckout));
        navigate('/checkout');
    }, [navigate, cartItems, selectedRowKeys]);

    // Memoized calculations
    const calculateTotals = useCallback(() => {
        let newSubtotal = 0;
        cartItems.forEach(item => {
            if (selectedRowKeys.includes(item._id)) {
                newSubtotal += item.price * item.quantity;
            }
        });
        setSubtotal(newSubtotal);
        setTotal(newSubtotal);
    }, [cartItems, selectedRowKeys]);

    // Memoized table columns
    const columns = useMemo(() => [
        {
            title: <Checkbox
                checked={selectedRowKeys.length === cartItems.length && cartItems.length > 0}
                indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < cartItems.length}
                onChange={e => {
                    if (e.target.checked) {
                        setSelectedRowKeys(cartItems.map(i => i._id));
                    } else {
                        setSelectedRowKeys([]);
                    }
                }}
            />,
            dataIndex: 'checkbox',
            key: 'checkbox',
            render: (_, record) => (
                <Checkbox
                    checked={selectedRowKeys.includes(record._id)}
                    onChange={e => {
                        if (e.target.checked) {
                            setSelectedRowKeys(keys => [...keys, record._id]);
                        } else {
                            setSelectedRowKeys(keys => keys.filter(k => k !== record._id));
                        }
                    }}
                />
            ),
            width: 50
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <CartItem
                    record={record}
                    imageUrls={imageUrls}
                    categories={categories}
                    tags={tags}
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
    ], [imageUrls, handleQuantityChange, handleDelete, cartItems, selectedRowKeys, categories, tags]);

    // Optimized image loading
    const loadProductImages = useCallback(async (items) => {
        const imagePromises = items.map(async (item) => {
            const product = item.productId;
            const pid = product?._id;
            let imgPath = '';
            if (product.mediaFiles && Array.isArray(product.mediaFiles.images) && product.mediaFiles.images[0]?.path) {
                imgPath = product.mediaFiles.images[0].path;
            } else if (product.media && product.media.mainImage) {
                imgPath = product.media.mainImage;
            }
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

    // Optimized useEffect for cart fetching
    useEffect(() => {
        let isMounted = true;

        const fetchCart = async () => {
            setLoading(true);
            try {
                const cart = await cartService.getMyCart();
                if (!isMounted) return;

                if (cart && Array.isArray(cart.items)) {
                    const processedItems = cart.items.map(item => {
                        const product = item.productId;
                        const detail = product?.detailId;
                        // Merge như normalizeProductUser
                        const merged = {
                            ...product,
                            ...(detail && {
                                pricingAndInventory: detail.pricingAndInventory,
                                description: detail.description,
                                technicalDetails: detail.technicalDetails,
                                seo: detail.seo,
                                policy: detail.policy,
                                media: detail.media,
                                mediaFiles: detail.mediaFiles,
                                isDeleted: detail.isDeleted,
                                createdAt: detail.createdAt,
                                updatedAt: detail.updatedAt,
                            })
                        };
                        return {
                            _id: item._id || product?._id,
                            productId: merged,
                            name: merged.basicInformation?.productName || merged.name || '',
                            price: merged.pricingAndInventory?.salePrice || 0,
                            quantity: item.quantity
                        };
                    });

                    setCartItems(processedItems);

                    // Load images in background
                    loadProductImages(processedItems);
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

    // Lấy danh mục và tag khi mount
    useEffect(() => {
        async function fetchMeta() {
            try {
                const [categoryRes, tagRes] = await Promise.all([
                    productService.getCategories ? productService.getCategories({ page: 1, limit: 100 }) : [],
                    productService.getAllTags ? productService.getAllTags({ page: 1, limit: 100 }) : []
                ]);
                setCategories(Array.isArray(categoryRes?.data) ? categoryRes.data : []);
                setTags(Array.isArray(tagRes?.data) ? tagRes.data : []);
            } catch (err) {
                setCategories([]);
                setTags([]);
            }
        }
        fetchMeta();
    }, []);

    return (
        <div className="cart-page">
            <Title level={2} className="page-title">GIỎ HÀNG CỦA BẠN</Title>
            <Row gutter={[32, 32]}>
                <Col xs={24} lg={16}>
                    <div className="cart-list">
                        {cartItems.length === 0 ? (
                            <div className="cart-empty">Giỏ hàng của bạn đang trống.</div>
                        ) : (
                            cartItems.map(item => (
                                <div className="cart-item-card" key={item._id}>
                                    <img
                                        src={(() => {
                                            const product = item.productId;
                                            if (product.mediaFiles && Array.isArray(product.mediaFiles.images) && product.mediaFiles.images[0]?.path) {
                                                const path = product.mediaFiles.images[0].path;
                                                return path.startsWith('http') ? path : `${config.API_BASE_URL}${path}`;
                                            }
                                            if (product.media && product.media.mainImage) return product.media.mainImage;
                                            return '/images/products/default.jpg';
                                        })()}
                                        alt={item.productId.basicInformation?.productName || ''}
                                        className="cart-item-image"
                                    />
                                    <div className="cart-item-info">
                                        <div className="cart-item-title">{item.productId.basicInformation?.productName || ''}</div>
                                        <div className="cart-item-tags">{(item.productId.basicInformation?.tagIds || []).map(tag => <span key={typeof tag === 'object' ? tag._id : tag} className="tag-item">{typeof tag === 'object' ? tag.name : (tags.find(t => t._id === tag)?.name || 'Không tag')}</span>)}</div>
                                        <div className="cart-item-category">{(item.productId.basicInformation?.categoryIds || []).map(cat => typeof cat === 'object' ? cat.name : (categories.find(c => c._id === cat)?.name || 'Không phân loại')).join(', ')}</div>
                                        <div className="cart-item-price">
                                            {item.productId.pricingAndInventory?.salePrice?.toLocaleString('vi-VN')} VNĐ
                                            {item.productId.pricingAndInventory?.originalPrice > item.productId.pricingAndInventory?.salePrice && (
                                                <span className="original-price">{item.productId.pricingAndInventory?.originalPrice.toLocaleString('vi-VN')} VNĐ</span>
                                            )}
                                        </div>
                                        <div className="cart-item-qty">
                                            <InputNumber
                                                min={1}
                                                max={item.productId.pricingAndInventory?.stockQuantity || 0}
                                                value={item.quantity}
                                                onChange={value => handleQuantityChange(value, item._id)}
                                                style={{ width: 90 }}
                                            />
                                            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(item._id)} />
                                        </div>
                                        <div className="cart-item-status">
                                            <span className={`status-badge status-${(item.productId.basicInformation?.status || '').replace(/\s/g, '').toLowerCase()}`}>{item.productId.basicInformation?.status || 'N/A'}</span>
                                            {item.productId.pricingAndInventory?.stockQuantity > 0 ? (
                                                <span className="in-stock" style={{ marginLeft: 8 }}>Còn {item.productId.pricingAndInventory.stockQuantity} {item.productId.pricingAndInventory.unit || ''}</span>
                                            ) : (
                                                <span className="out-of-stock" style={{ marginLeft: 8 }}>Hết hàng</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {cartItems.length > 0 && (
                        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
                            <Button danger onClick={handleDeleteSelected} disabled={selectedRowKeys.length === 0}>
                                Xóa sản phẩm đã chọn
                            </Button>
                            <Button danger onClick={handleClearCart} disabled={cartItems.length === 0}>
                                Xóa tất cả
                            </Button>
                        </div>
                    )}
                </Col>
                <Col xs={24} lg={8}>
                    <CartSummary
                        subtotal={subtotal}
                        total={total}
                        onCheckout={handleCheckout}
                        cartItems={cartItems.filter(i => selectedRowKeys.includes(i._id))}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default Cart; 