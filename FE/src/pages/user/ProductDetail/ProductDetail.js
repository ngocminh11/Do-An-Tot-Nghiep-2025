import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Button, InputNumber, Rate, Tabs, message, Spin } from 'antd';
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import './ProductDetail.scss';

const { TabPane } = Tabs;

const ProductDetail = () => {
    const { productId: id } = useParams();
    console.log('ProductDetail param id:', id);
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!id) {
            setProduct(null);
            setErrorMsg('ID sản phẩm không hợp lệ');
            setLoading(false);
            return;
        }
        async function fetchProduct() {
            setLoading(true);
            setErrorMsg('');
            try {
                const res = await productService.getProductById(id);
                console.log('API response for getProductById:', res);
                if (res?.status === 'Error' || !res?.data) {
                    setProduct(null);
                    setErrorMsg(res?.message || 'Không tìm thấy sản phẩm');
                } else {
                    setProduct(res.data);
                    console.log('Fetched product:', res.data);
                }
            } catch (err) {
                setProduct(null);
                setErrorMsg(err?.message || 'Không tìm thấy sản phẩm');
                console.log('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id]);

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;
    if (!product) return <div style={{ color: 'red', textAlign: 'center', margin: 40 }}>{errorMsg || 'Không tìm thấy sản phẩm'}</div>;

    // Lấy thông tin cần thiết từ product
    const basic = product.basicInformation || {};
    const priceInfo = product.pricingAndInventory || {};
    const desc = product.description || {};
    const media = product.media || {};
    const mediaFiles = product.mediaFiles || {};
    const images = Array.isArray(mediaFiles.images) && mediaFiles.images.length > 0
        ? mediaFiles.images.map(img => img.path)
        : (Array.isArray(media.imageGallery) && media.imageGallery.length > 0 ? media.imageGallery : (media.mainImage ? [media.mainImage] : []));
    const mainImage = images[0] || '/images/products/default.jpg';
    console.log('Product images:', images);
    console.log('Main image:', mainImage);

    return (
        <div className="product-detail">
            <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                    <div className="product-images">
                        <img src={mainImage} alt={basic.productName} className="main-image" />
                        <div className="thumbnail-list">
                            {images.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`${basic.productName || ''} ${index + 1}`}
                                    className="thumbnail"
                                />
                            ))}
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={12}>
                    <div className="product-info">
                        <h1>{basic.productName || 'Không có tên'}</h1>
                        <div className="price">{(priceInfo.salePrice || priceInfo.originalPrice || 0).toLocaleString('vi-VN')} VNĐ</div>
                        <div className="rating">
                            <Rate disabled defaultValue={product.averageRating || 5} />
                            {/* <span className="review-count">({product.reviewCount || 0} đánh giá)</span> */}
                        </div>
                        <p className="description">{desc.shortDescription || desc.detailedDescription || basic.description || ''}</p>

                        <div className="quantity-selector">
                            <span>Số lượng:</span>
                            <InputNumber
                                min={1}
                                max={priceInfo.stockQuantity || 99}
                                value={quantity}
                                onChange={setQuantity}
                            />
                        </div>

                        <div className="actions">
                            <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                size="large"
                                onClick={() => message.success('Đã thêm sản phẩm vào giỏ hàng')}
                            >
                                Thêm vào giỏ hàng
                            </Button>
                            <Button
                                icon={<HeartOutlined />}
                                size="large"
                                onClick={() => message.success('Đã thêm sản phẩm vào danh sách yêu thích')}
                            >
                                Yêu thích
                            </Button>
                        </div>

                        <div className="product-meta">
                            <div className="meta-item">
                                <span className="label">Thương hiệu:</span>
                                <span className="value">{basic.brand || 'Không rõ'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Danh mục:</span>
                                <span className="value">{Array.isArray(basic.categoryIds) && basic.categoryIds.length > 0 ? basic.categoryIds.map(cat => cat.name || cat).join(', ') : (basic.category || 'Không rõ')}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Tình trạng:</span>
                                <span className="value">{(priceInfo.stockQuantity || 0) > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
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
                            <p>{desc.detailedDescription || desc.shortDescription || ''}</p>
                            <h3>Thành phần</h3>
                            <p>{Array.isArray(desc.ingredients) ? desc.ingredients.join(', ') : desc.ingredients || ''}</p>
                            <h3>Cách sử dụng</h3>
                            <p>{Array.isArray(desc.usageInstructions) ? desc.usageInstructions.join(' ') : desc.usageInstructions || ''}</p>
                        </div>
                    </TabPane>
                    {/* Tab đánh giá có thể bổ sung sau */}
                </Tabs>
            </Card>
        </div>
    );
};

export default ProductDetail; 