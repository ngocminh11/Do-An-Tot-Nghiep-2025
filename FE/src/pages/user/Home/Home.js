import React from 'react';
import { Carousel, Card, Row, Col, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { mockProducts, mockCampaigns } from '../../../services/mockData';
import './Home.scss';

const Home = () => {
    const navigate = useNavigate();

    const handleViewProduct = (productId) => {
        navigate(`/products/${productId}`);
    };

    return (
        <div className="home-page">
            <Carousel autoplay className="banner-carousel">
                {mockCampaigns.map(campaign => (
                    <div key={campaign._id} className="carousel-item">
                        <img src={campaign.imageUrl} alt={campaign.title} />
                        <div className="carousel-content">
                            <h2>{campaign.title}</h2>
                            <p>{campaign.description}</p>
                        </div>
                    </div>
                ))}
            </Carousel>

            <div className="featured-products">
                <h2>Sản phẩm nổi bật</h2>
                <Row gutter={[16, 16]}>
                    {mockProducts.slice(0, 4).map(product => (
                        <Col xs={24} sm={12} md={6} key={product._id}>
                            <Card
                                hoverable
                                cover={<img alt={product.name} src={product.imageUrls[0]} />}
                            >
                                <Card.Meta
                                    title={product.name}
                                    description={`${product.price.toLocaleString('vi-VN')} VNĐ`}
                                />
                                <Button
                                    type="primary"
                                    block
                                    style={{ marginTop: 16 }}
                                    onClick={() => handleViewProduct(product._id)}
                                >
                                    Xem chi tiết
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default Home; 