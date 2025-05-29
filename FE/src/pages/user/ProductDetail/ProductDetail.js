import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Button, InputNumber, Rate, Tabs, message } from 'antd';
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
import { mockProducts, mockReviews } from '../../../services/mockData';
import './ProductDetail.scss';

const { TabPane } = Tabs;

const ProductDetail = () => {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const product = mockProducts.find(p => p._id === id);

    if (!product) {
        return <div>Không tìm thấy sản phẩm</div>;
    }

    const handleAddToCart = () => {
        // In a real app, you would add the product to cart here
        message.success('Đã thêm sản phẩm vào giỏ hàng');
    };

    const handleAddToWishlist = () => {
        // In a real app, you would add the product to wishlist here
        message.success('Đã thêm sản phẩm vào danh sách yêu thích');
    };

    return (
        <div className="product-detail">
            <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                    <div className="product-images">
                        <img src={product.imageUrls[0]} alt={product.name} className="main-image" />
                        <div className="thumbnail-list">
                            {product.imageUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`${product.name} ${index + 1}`}
                                    className="thumbnail"
                                />
                            ))}
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={12}>
                    <div className="product-info">
                        <h1>{product.name}</h1>
                        <div className="price">{product.price.toLocaleString('vi-VN')} VNĐ</div>
                        <div className="rating">
                            <Rate disabled defaultValue={product.rating} />
                            <span className="review-count">({product.reviewCount} đánh giá)</span>
                        </div>
                        <p className="description">{product.description}</p>

                        <div className="quantity-selector">
                            <span>Số lượng:</span>
                            <InputNumber
                                min={1}
                                max={product.stockQuantity}
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
                                <span className="value">{product.brand}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Danh mục:</span>
                                <span className="value">{product.category}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Tình trạng:</span>
                                <span className="value">
                                    {product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
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
                            <p>{product.description}</p>
                            <h3>Thành phần</h3>
                            <p>{product.ingredients}</p>
                            <h3>Cách sử dụng</h3>
                            <p>{product.usage}</p>
                        </div>
                    </TabPane>

                    <TabPane tab="Đánh giá" key="2">
                        <div className="tab-content">
                            {mockReviews.map(review => (
                                <div key={review._id} className="review-item">
                                    <div className="review-header">
                                        <Rate disabled defaultValue={review.rating} />
                                        <span className="reviewer">{review.userName}</span>
                                        <span className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="review-content">{review.content}</p>
                                </div>
                            ))}
                        </div>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default ProductDetail; 