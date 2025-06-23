import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, InputNumber, Tabs, message, Spin } from 'antd';
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import './ProductDetail.scss';

const { TabPane } = Tabs;

const ProductDetail = () => {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProduct();
        // eslint-disable-next-line
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await productService.getProductById(id);
            setProduct(res.data);
        } catch (err) {
            message.error('Không thể tải sản phẩm!');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        // TODO: Gọi API hoặc Redux để thêm vào giỏ hàng thực tế
        message.success('Đã thêm sản phẩm vào giỏ hàng');
    };

    const handleAddToWishlist = () => {
        message.success('Đã thêm sản phẩm vào danh sách yêu thích');
    };

    const handleBuyNow = () => {
        // Lưu sản phẩm mua ngay vào localStorage (dữ liệu thực tế)
        if (!product) return;
        const buyNowItem = [{
            _id: product._id,
            productId: product._id,
            name: product.basicInformation?.productName,
            imageUrl: product.media?.mainImage || (product.media?.imageGallery && product.media.imageGallery[0]) || '',
            price: product.pricingAndInventory?.salePrice || product.pricingAndInventory?.originalPrice || 0,
            quantity: quantity
        }];
        localStorage.setItem('buyNowItems', JSON.stringify(buyNowItem));
        navigate('/checkout?buynow=1');
    };

    if (loading || !product) {
        return <div style={{ textAlign: 'center', margin: '40px 0' }}><Spin size="large" /></div>;
    }

    const {
        basicInformation = {},
        pricingAndInventory = {},
        media = {},
        description = {},
        technicalDetails = {},
        policy = {},
    } = product;

    return (
        <div className="product-detail">
            <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                    <div className="product-images">
                        <img src={media.mainImage || (media.imageGallery && media.imageGallery[0]) || ''} alt={basicInformation.productName} className="main-image" />
                        <div className="thumbnail-list">
                            {(media.imageGallery || []).map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`${basicInformation.productName} ${index + 1}`}
                                    className="thumbnail"
                                />
                            ))}
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={12}>
                    <div className="product-info">
                        <h1>{basicInformation.productName}</h1>
                        <div className="price">
                            {(pricingAndInventory.salePrice || pricingAndInventory.originalPrice || 0).toLocaleString('vi-VN')} VNĐ
                        </div>
                        <div className="stock">
                            {pricingAndInventory.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </div>
                        <p className="description">{description.shortDescription}</p>

                        <div className="quantity-selector">
                            <span>Số lượng:</span>
                            <InputNumber
                                min={1}
                                max={pricingAndInventory.stockQuantity}
                                value={quantity}
                                onChange={setQuantity}
                            />
                        </div>

                        <div className="actions">
                            <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                size="large"
                                onClick={handleAddToCart}
                            >
                                Thêm vào giỏ hàng
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                style={{ background: '#1976d2', borderColor: '#1976d2' }}
                                onClick={handleBuyNow}
                            >
                                Mua ngay
                            </Button>
                            <Button
                                icon={<HeartOutlined />}
                                size="large"
                                onClick={handleAddToWishlist}
                            >
                                Yêu thích
                            </Button>
                        </div>

                        <div className="product-meta">
                            <div className="meta-item">
                                <span className="label">Thương hiệu:</span>
                                <span className="value">{basicInformation.brand}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Danh mục:</span>
                                <span className="value">
                                    {(basicInformation.categoryIds || []).map(cat => cat.name).join(', ')}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Tình trạng:</span>
                                <span className="value">
                                    {pricingAndInventory.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                </span>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <Card className="product-tabs">
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Mô tả" key="1">
                        <div className="tab-content">
                            <h3>Chi tiết sản phẩm</h3>
                            <p>{description.detailedDescription}</p>
                            <h3>Thành phần</h3>
                            <ul>
                                {(description.ingredients || []).map((ing, idx) => <li key={idx}>{ing}</li>)}
                            </ul>
                            <h3>Cách sử dụng</h3>
                            <ul>
                                {(description.usageInstructions || []).map((ins, idx) => <li key={idx}>{ins}</li>)}
                            </ul>
                            <h3>Thông tin kỹ thuật</h3>
                            <ul>
                                <li>Kích thước/Khối lượng: {technicalDetails.sizeOrWeight}</li>
                                <li>Loại da phù hợp: {(technicalDetails.suitableSkinTypes || []).join(', ')}</li>
                                <li>Xuất xứ: {technicalDetails.origin}</li>
                                <li>Chứng nhận: {(technicalDetails.certifications || []).join(', ')}</li>
                            </ul>
                            <h3>Chính sách</h3>
                            <ul>
                                <li>Vận chuyển/Bảo hành: {policy.shippingReturnWarranty}</li>
                                {(policy.additionalOptions || []).map((opt, idx) => <li key={idx}>{opt}</li>)}
                            </ul>
                        </div>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default ProductDetail; 