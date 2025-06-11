import React, { useState, useEffect } from 'react';
import { Carousel, Card, Row, Col, Button, Space, Input, Form, message, Typography, Layout, Rate } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UpOutlined, MailOutlined, CheckCircleOutlined, StarOutlined, HeartOutlined } from '@ant-design/icons';
import { mockProducts, mockCampaigns, mockCategories, mockPosts } from '../../../services/mockData';
import './Home.scss';

const { Title, Text } = Typography;

const Home = () => {
    const navigate = useNavigate();
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const [newsletterForm] = Form.useForm();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollToTopButton(true);
            } else {
                setShowScrollToTopButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewProduct = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleViewCategory = (categorySlug) => {
        navigate(`/products?category=${categorySlug}`);
    };

    const handleNewsletterSubmit = (values) => {
        console.log('Email đăng ký:', values.email);
        message.success('Cảm ơn bạn đã đăng ký nhận tin!');
        newsletterForm.resetFields();
    };

    const handleViewPost = (postId) => {
        navigate(`/posts/${postId}`); // Giả định có route /posts/:id
    };

    return (
        <Layout className="home-page">
            <Carousel autoplay className="banner-carousel">
                {mockCampaigns.map(campaign => (
                    <div key={campaign._id} className="carousel-item">
                        <img src={campaign.imageUrl} alt={campaign.title} />
                    </div>
                ))}
            </Carousel>

            <div className="slogan-section section-animate">
                <Title level={1}>Làm đẹp tự nhiên - tin cậy từ CoCoo</Title>
                <Space size={[16, 16]} wrap className="category-buttons">
                    {mockCategories.map(category => (
                        <Button
                            key={category._id}
                            onClick={() => handleViewCategory(category.slug)}
                            className="category-button"
                        >
                            {category.name}
                        </Button>
                    ))}
                </Space>
            </div>

            <div className="section featured-products section-animate">
                <Title level={2}>SẢN PHẨM NỔI BẬT</Title>
                <Row gutter={[24, 24]}>
                    {mockProducts.slice(0, 5).map(product => (
                        <Col xs={24} sm={12} md={8} lg={4} key={product._id}>
                            <Card
                                hoverable
                                cover={<img alt={product.name} src={product.imageUrls[0]} />}
                                className="product-card"
                            >
                                <Card.Meta
                                    title={product.name}
                                    description={
                                        <Space direction="vertical" size={0} className="product-meta-content">
                                            <Rate allowHalf disabled defaultValue={product.averageRating} className="product-rating" />
                                            <Text className="price-text">{`${product.price.toLocaleString('vi-VN')} VNĐ`}</Text>
                                        </Space>
                                    }
                                />
                                <Button
                                    type="primary"
                                    block
                                    className="buy-now-button"
                                    onClick={() => handleViewProduct(product._id)}
                                >
                                    Mua ngay
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <div className="section newsletter-section section-animate">
                <Title level={2}>ĐĂNG KÝ NHẬN TIN TỨC</Title>
                <Text>Nhận các ưu đãi mới nhất và thông tin làm đẹp độc quyền từ CoCoo!</Text>
                <Form
                    form={newsletterForm}
                    onFinish={handleNewsletterSubmit}
                    layout="inline"
                    className="newsletter-form"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email của bạn!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Nhập email của bạn"
                            className="newsletter-input"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="newsletter-button">
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div className="section why-cocoo-section section-animate">
                <Title level={2}>TẠI SAO NÊN CHỌN COCOO?</Title>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={8}>
                        <Card className="why-cocoo-card">
                            <CheckCircleOutlined className="why-cocoo-icon" />
                            <Title level={4}>Sản phẩm chất lượng</Title>
                            <Text>Cam kết cung cấp các sản phẩm mỹ phẩm chính hãng, an toàn và hiệu quả.</Text>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="why-cocoo-card">
                            <StarOutlined className="why-cocoo-icon" />
                            <Title level={4}>Dịch vụ tận tâm</Title>
                            <Text>Đội ngũ tư vấn chuyên nghiệp luôn sẵn sàng hỗ trợ bạn lựa chọn sản phẩm phù hợp.</Text>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="why-cocoo-card">
                            <HeartOutlined className="why-cocoo-icon" />
                            <Title level={4}>Ưu đãi hấp dẫn</Title>
                            <Text>Thường xuyên có các chương trình khuyến mãi, quà tặng đặc biệt dành cho khách hàng thân thiết.</Text>
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className="section latest-posts-section section-animate">
                <Title level={2}>TIN TỨC MỚI NHẤT</Title>
                <Row gutter={[24, 24]}>
                    {mockPosts.slice(0, 3).map(post => (
                        <Col xs={24} sm={12} md={8} key={post._id}>
                            <Card
                                hoverable
                                cover={<img alt={post.title} src={post.imageUrl} />}
                                onClick={() => handleViewPost(post._id)}
                                className="post-card"
                            >
                                <Card.Meta
                                    title={post.title}
                                    description={post.excerpt}
                                />
                                <Text type="secondary" className="post-date">{post.createdAt}</Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Button
                    type="default"
                    className="view-all-posts-button"
                    onClick={() => navigate('/posts')}
                >
                    Xem tất cả bài viết
                </Button>
            </div>

            <div className="section promotion-campaigns section-animate">
                <Title level={2}>CHƯƠNG TRÌNH KHUYẾN MÃI</Title>
                <Row gutter={[24, 24]}>
                    {mockCampaigns.slice(0, 2).map(campaign => (
                        <Col xs={24} md={12} key={campaign._id}>
                            <Card
                                hoverable
                                cover={<img alt={campaign.title} src={campaign.imageUrl} />}
                                className="campaign-card"
                            >
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {showScrollToTopButton && (
                <Button
                    type="primary"
                    shape="circle"
                    icon={<UpOutlined />}
                    size="large"
                    className="scroll-to-top-button"
                    onClick={scrollToTop}
                />
            )}
        </Layout>
    );
};

export default Home; 