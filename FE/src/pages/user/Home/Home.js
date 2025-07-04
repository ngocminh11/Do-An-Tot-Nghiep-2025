import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Carousel, Card, Row, Col, Button, Space, Input, Form, message, Typography, Layout, Rate, Avatar, Badge, Modal, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UpOutlined, MailOutlined, CheckCircleOutlined, StarOutlined, HeartOutlined, MessageOutlined, SendOutlined, CloseOutlined, CustomerServiceOutlined, ShoppingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ChatBot from '../../../components/ChatBot/ChatBot';
import { productService, getAllProductsUser } from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import './Home.scss';
import screenshotImg from '../../../upload/an_elegant_product_image_.png';
import stylishImg from '../../../upload/a_stylish_and_simp_image_.png';
import facialImg from '../../../upload/a_bottle_of_facial_image_.png';
import cocoWImg from '../../../upload/a_bottle_of_coco_w_image_.png';
import tubeImg from '../../../upload/a_tube_of_cocoo_su_image_.png';
import productImg1 from '../../../upload/a_product_image_of_image_.png';
import config from '../../../config';

const { Title, Text } = Typography;

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Memoized Product Card Component
const ProductCard = React.memo(({ product, onViewProduct, productImg1 }) => {
    const imageUrl = useMemo(() => getImageUrl(product.imageUrls?.[0]), [product.imageUrls]);

    return (
        <Col xs={24} sm={12} md={8} lg={4} className="home-scale-on-hover">
            <Card
                hoverable
                cover={
                    <img
                        alt={product.name}
                        src={imageUrl || productImg1}
                        onError={e => { e.target.onerror = null; e.target.src = productImg1; }}
                        style={{
                            transition: 'transform 0.4s',
                            height: 180,
                            objectFit: 'cover',
                            borderRadius: '12px 12px 0 0'
                        }}
                        loading="lazy"
                    />
                }
                className="product-card"
                style={{ boxShadow: '0 4px 16px rgba(44,62,80,0.10)', borderRadius: '16px' }}
            >
                <Card.Meta
                    title={product.name}
                    description={
                        <Space direction="vertical" size={0} className="product-meta-content">
                            <Rate allowHalf disabled defaultValue={product.averageRating || 0} className="product-rating" />
                            <Text className="price-text">{`${product.price?.toLocaleString('vi-VN') || ''} VNĐ`}</Text>
                        </Space>
                    }
                />
                <Button
                    type="primary"
                    block
                    className="buy-now-button home-btn-animate"
                    onClick={() => onViewProduct(product._id)}
                >
                    Mua ngay
                </Button>
            </Card>
        </Col>
    );
});

// Memoized Category Button Component
const CategoryButton = React.memo(({ category, onViewCategory }) => (
    <Button
        key={category._id}
        onClick={() => onViewCategory(category.slug)}
        className="category-button"
    >
        {category.name}
    </Button>
));

const Home = () => {
    const navigate = useNavigate();
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const [newsletterForm] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState({});

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

    useEffect(() => {
        if (!Array.isArray(products)) return;
        products.forEach(async (product) => {
            let imgPath = '';
            if (product.mediaFiles && Array.isArray(product.mediaFiles.images) && product.mediaFiles.images[0]?.path) {
                imgPath = product.mediaFiles.images[0].path;
            } else if (product.media && product.media.mainImage) {
                imgPath = product.media.mainImage;
            }
            if (imgPath && !imageUrls[product._id]) {
                const url = await getImageUrl(imgPath);
                setImageUrls(prev => ({ ...prev, [product._id]: url }));
            }
        });
        // eslint-disable-next-line
    }, [products]);

    // Memoized event handlers
    const handleScroll = useCallback(
        debounce(() => {
            if (window.scrollY > 300) {
                setShowScrollToTopButton(true);
            } else {
                setShowScrollToTopButton(false);
            }
        }, 100),
        []
    );

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleViewProduct = useCallback((productId) => {
        navigate(`/products/${productId}`);
    }, [navigate]);

    const handleViewCategory = useCallback((categorySlug) => {
        navigate(`/products?category=${categorySlug}`);
    }, [navigate]);

    const handleNewsletterSubmit = useCallback((values) => {
        console.log('Email đăng ký:', values.email);
        message.success('Cảm ơn bạn đã đăng ký nhận tin!');
        newsletterForm.resetFields();
    }, [newsletterForm]);

    const handleViewPost = useCallback((postId) => {
        navigate(`/posts/${postId}`);
    }, [navigate]);

    // Memoized static data
    const mockCampaigns = useMemo(() => [
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
    ], []);

    const skinModels = useMemo(() => [
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
    ], []);

    // Optimized useEffect for scroll event
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    // Optimized useEffect for data fetching
    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            setLoading(true);
            try {
                const [productRes, categoryRes] = await Promise.all([
                    getAllProductsUser({ page: 1, limit: 10 }),
                    categoryService.getCategories({ page: 1, limit: 10 })
                ]);

                if (isMounted) {
                    setProducts(productRes.data || []);
                    setCategories(categoryRes.data || []);
                }
            } catch (err) {
                if (isMounted) {
                    setProducts([]);
                    setCategories([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Memoized product list
    const productList = useMemo(() => {
        const validProducts = Array.isArray(products) ? products : [];
        return validProducts.slice(0, 5);
    }, [products]);

    return (
        <Layout className="home-page">
            <Carousel
                autoplay
                className="banner-carousel home-fade-in"
                dots={{ position: 'bottom' }}
                effect="fade"
                autoplaySpeed={5000}
                pauseOnHover={true}
            >
                {mockCampaigns.map(campaign => (
                    <div key={campaign._id} className="carousel-item home-scale-on-hover">
                        <img
                            src={campaign.imageUrl}
                            alt={campaign.title}
                            style={{
                                borderRadius: '18px',
                                boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
                                transition: 'transform 0.4s',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                ))}
            </Carousel>

            <div className="slogan-section section-animate">
                <Title level={1}>Làm đẹp tự nhiên - tin cậy từ CoCoo</Title>
                <Space size={[16, 16]} wrap className="category-buttons">
                    {categories.map(category => (
                        <CategoryButton key={category._id} category={category} onViewCategory={handleViewCategory} />
                    ))}
                </Space>
            </div>

            <div className="section featured-products section-animate home-fade-in">
                <Title level={2}>SẢN PHẨM NỔI BẬT</Title>
                <Row gutter={[24, 24]}>
                    {productList.map(product => (
                        <ProductCard key={product._id} product={product} onViewProduct={handleViewProduct} productImg1={productImg1} />
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