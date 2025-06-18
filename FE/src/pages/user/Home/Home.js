import React, { useState, useEffect } from 'react';
import { Carousel, Card, Row, Col, Button, Space, Input, Form, message, Typography, Layout, Rate, Avatar, Badge, Modal, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UpOutlined, MailOutlined, CheckCircleOutlined, StarOutlined, HeartOutlined, MessageOutlined, SendOutlined, CloseOutlined, CustomerServiceOutlined, ShoppingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ChatBot from '../../../components/ChatBot/ChatBot';
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

    const mockProducts = [
        {
            _id: '1',
            name: 'Kem dưỡng da',
            price: 250000,
            imageUrls: ['/images/products/product1.jpg'],
            averageRating: 4.5
        },
        {
            _id: '2',
            name: 'Sữa rửa mặt',
            price: 180000,
            imageUrls: ['/images/products/product2.jpg'],
            averageRating: 4.2
        },
        {
            _id: '3',
            name: 'Toner cân bằng da',
            price: 200000,
            imageUrls: ['/images/products/product3.jpg'],
            averageRating: 4.7
        },
        {
            _id: '4',
            name: 'Serum dưỡng trắng',
            price: 350000,
            imageUrls: ['/images/products/product4.jpg'],
            averageRating: 4.8
        },
        {
            _id: '5',
            name: 'Mặt nạ dưỡng da',
            price: 150000,
            imageUrls: ['/images/products/product5.jpg'],
            averageRating: 4.3
        }
    ];

    const mockCampaigns = [
        {
            _id: '1',
            title: 'Khuyến mãi mùa hè',
            imageUrl: '/images/campaigns/campaign1.jpg'
        },
        {
            _id: '2',
            title: 'Ưu đãi tháng 6',
            imageUrl: '/images/campaigns/campaign2.jpg'
        }
    ];

    const mockCategories = [
        {
            _id: '1',
            name: 'Chăm sóc da mặt',
            slug: 'cham-soc-da-mat'
        },
        {
            _id: '2',
            name: 'Trang điểm',
            slug: 'trang-diem'
        },
        {
            _id: '3',
            name: 'Chăm sóc tóc',
            slug: 'cham-soc-toc'
        },
        {
            _id: '4',
            name: 'Nước hoa',
            slug: 'nuoc-hoa'
        }
    ];

    const mockPosts = [
        {
            _id: '1',
            title: 'Cách chăm sóc da mùa hè',
            excerpt: 'Những bí quyết giúp làn da luôn tươi sáng trong mùa hè nóng bức...',
            imageUrl: '/images/posts/post1.jpg',
            createdAt: '2024-03-15'
        },
        {
            _id: '2',
            title: 'Top 5 sản phẩm dưỡng da bán chạy nhất',
            excerpt: 'Khám phá những sản phẩm được yêu thích nhất trong tháng...',
            imageUrl: '/images/posts/post2.jpg',
            createdAt: '2024-03-10'
        },
        {
            _id: '3',
            title: 'Xu hướng làm đẹp 2024',
            excerpt: 'Cập nhật những xu hướng làm đẹp mới nhất trong năm 2024...',
            imageUrl: '/images/posts/post3.jpg',
            createdAt: '2024-03-05'
        }
    ];

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

            <ChatBot />
        </Layout>
    );
};

export default Home; 