import React, { useState, useEffect } from 'react';
import { Carousel, Card, Row, Col, Button, Space, Input, Form, message, Typography, Layout, Rate, Avatar, Badge, Modal, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UpOutlined, MailOutlined, CheckCircleOutlined, StarOutlined, HeartOutlined, MessageOutlined, SendOutlined, CloseOutlined, CustomerServiceOutlined, ShoppingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ChatBot from '../../../components/ChatBot/ChatBot';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import './Home.scss';
import screenshotImg from '../../../upload/Screenshot 2025-06-23 162358.png';
import stylishImg from '../../../upload/a_stylish_and_simp_image_.png';
import facialImg from '../../../upload/a_bottle_of_facial_image_.png';
import cocoWImg from '../../../upload/a_bottle_of_coco_w_image_.png';
import tubeImg from '../../../upload/a_tube_of_cocoo_su_image_.png';
import productImg1 from '../../../upload/a_product_image_of_image_.png';
import productImg2 from '../../../upload/a_product_image_of_image_ (1).png';

const { Title, Text } = Typography;

const Home = () => {
    const navigate = useNavigate();
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const [newsletterForm] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const productRes = await productService.getAllProducts({ page: 1, limit: 10 });
                setProducts(productRes.data || []);
                const categoryRes = await categoryService.getAllCategories({ page: 1, limit: 10 });
                setCategories(categoryRes.data || []);
            } catch (err) {
                setProducts([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
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

    const mockCampaigns = [
        {
            _id: '1',
            title: 'Khuyến mãi mùa hè',
            imageUrl: screenshotImg
        },
        {
            _id: '2',
            title: 'Ưu đãi tháng 6',
            imageUrl: stylishImg
        }
    ];

    const skinModels = [
        {
            id: 1,
            name: 'Ngọc Trinh',
            image: facialImg,
            description: 'Làn da trắng sáng, mịn màng, không tì vết. Bí quyết: dưỡng ẩm đều đặn, chống nắng kỹ, ưu tiên sản phẩm dịu nhẹ.'
        },
        {
            id: 2,
            name: 'Hà Tăng',
            image: cocoWImg,
            description: 'Da khỏe, đều màu, ít khuyết điểm. Chú trọng làm sạch sâu, dùng serum vitamin C và kem chống nắng phổ rộng.'
        },
        {
            id: 3,
            name: 'IU',
            image: tubeImg,
            description: 'Da căng bóng kiểu Hàn, luôn tươi trẻ. Ưu tiên cấp ẩm, đắp mặt nạ và massage mặt mỗi ngày.'
        }
    ];

    return (
        <Layout className="home-page">
            <Carousel autoplay className="banner-carousel home-fade-in">
                {mockCampaigns.map(campaign => (
                    <div key={campaign._id} className="carousel-item home-scale-on-hover">
                        <img src={campaign.imageUrl} alt={campaign.title} style={{ borderRadius: '18px', boxShadow: '0 8px 32px rgba(44,62,80,0.18)', transition: 'transform 0.4s' }} />
                    </div>
                ))}
            </Carousel>

            <div className="slogan-section section-animate">
                <Title level={1}>Làm đẹp tự nhiên - tin cậy từ CoCoo</Title>
                <Space size={[16, 16]} wrap className="category-buttons">
                    {categories.map(category => (
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

            <div className="section featured-products section-animate home-fade-in">
                <Title level={2}>SẢN PHẨM NỔI BẬT</Title>
                <Row gutter={[24, 24]}>
                    {(Array.isArray(products) ? products : []).slice(0, 5).map(product => (
                        <Col xs={24} sm={12} md={8} lg={4} key={product._id} className="home-scale-on-hover">
                            <Card
                                hoverable
                                cover={<img alt={product.name} src={product.imageUrls?.[0]} style={{ transition: 'transform 0.4s' }} />}
                                className="product-card"
                                style={{ boxShadow: '0 4px 16px rgba(44,62,80,0.10)', borderRadius: '16px' }}>
                                <Card.Meta
                                    title={product.name}
                                    description={
                                        <Space direction="vertical" size={0} className="product-meta-content">
                                            <Rate allowHalf disabled defaultValue={product.averageRating} className="product-rating" />
                                            <Text className="price-text">{`${product.price?.toLocaleString('vi-VN') || ''} VNĐ`}</Text>
                                        </Space>
                                    }
                                />
                                <Button
                                    type="primary"
                                    block
                                    className="buy-now-button home-btn-animate"
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
                    <Col span={24} style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>
                        Chưa có bài viết.
                    </Col>
                </Row>
                <Button
                    type="default"
                    className="view-all-posts-button"
                    disabled
                    style={{ opacity: 0.5, pointerEvents: 'none' }}
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

            <div className="section skin-models-section section-animate home-fade-in">
                <Title level={2}>HÌNH MẪU LÀN DA ĐẸP</Title>
                <Row gutter={[24, 24]}>
                    {skinModels.map(model => (
                        <Col xs={24} sm={12} md={8} key={model.id} className="home-scale-on-hover">
                            <Card
                                hoverable
                                cover={<img alt={model.name} src={model.image} style={{ objectFit: 'cover', height: 260, borderRadius: '50%', boxShadow: '0 2px 8px rgba(44,62,80,0.10)', transition: 'transform 0.4s' }} />}
                                className="skin-model-card"
                            >
                                <Card.Meta
                                    title={model.name}
                                    description={model.description}
                                />
                                <Button
                                    type="link"
                                    onClick={() => window.open('/blog/skin-inspiration', '_blank')}
                                    style={{ marginTop: 8 }}
                                    className="home-btn-animate"
                                >
                                    Xem bí quyết
                                </Button>
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