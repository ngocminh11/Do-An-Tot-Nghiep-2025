import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Button, Rate, Pagination, Spin, message } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import { useNavigate } from 'react-router-dom';
import './AllProducts.scss';

const { Option } = Select;

const AllProducts = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const pageSize = 12;
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productService.getAllProducts();
            setProducts((res.data && res.data.data) || []);
        } catch (err) {
            message.error('Không thể tải sản phẩm!');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await categoryService.getCategories();
            setCategories(res.data || []);
        } catch (err) {
            setCategories([]);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            (product.basicInformation?.productName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
            (product.description?.shortDescription?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
            (product.description?.detailedDescription?.toLowerCase() || '').includes(searchText.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="all-products">
            <div className="filters">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả danh mục</Option>
                            {categories.map(category => (
                                <Option key={category._id} value={category._id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            value={sortBy}
                            onChange={setSortBy}
                            style={{ width: '100%' }}
                        >
                            <Option value="newest">Mới nhất</Option>
                            <Option value="price-asc">Giá tăng dần</Option>
                            <Option value="price-desc">Giá giảm dần</Option>
                            <Option value="rating">Đánh giá cao</Option>
                        </Select>
                    </Col>
                </Row>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', margin: '40px 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <Row gutter={[24, 24]} className="product-list">
                        {paginatedProducts.map(product => (
                            <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                                <Card
                                    hoverable
                                    cover={<img alt={product.basicInformation.productName} src={product.media?.mainImage || (product.media?.imageGallery && product.media.imageGallery[0]) || (product.mediaFiles?.images && product.mediaFiles.images[0]?.path) || ''} />}
                                    className="product-card"
                                    onClick={() => navigate(`/products/${product._id}`)}
                                >
                                    <Card.Meta
                                        title={product.basicInformation.productName}
                                        description={
                                            <>
                                                <div className="price">
                                                    {(product.pricingAndInventory?.salePrice || product.pricingAndInventory?.originalPrice || 0).toLocaleString('vi-VN')} VNĐ
                                                </div>
                                                <div className="short-desc">
                                                    {product.description?.shortDescription}
                                                </div>
                                            </>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div className="pagination">
                        <Pagination
                            current={currentPage}
                            total={filteredProducts.length}
                            pageSize={pageSize}
                            onChange={setCurrentPage}
                            showSizeChanger={false}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default AllProducts; 