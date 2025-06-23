import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Button, Rate, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import './AllProducts.scss';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const AllProducts = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const productRes = await productService.getAllProducts({ page: 1, limit: 100 });
                setProducts(Array.isArray(productRes?.data?.data) ? productRes.data.data : []);
                const categoryRes = await categoryService.getAllCategories({ page: 1, limit: 100 });
                setCategories(Array.isArray(categoryRes?.data) ? categoryRes.data : []);
            } catch (err) {
                setProducts([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
        const name = typeof product.name === 'string' ? product.name : (product.basicInformation?.productName || '');
        const description = typeof product.description === 'string'
            ? product.description
            : (product.description?.shortDescription || product.basicInformation?.description || '');
        const matchesSearch = name.toLowerCase().includes(searchText.toLowerCase()) ||
            description.toLowerCase().includes(searchText.toLowerCase());
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
                return b.rating - a.rating;
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

            <Row gutter={[24, 24]} className="product-list">
                {paginatedProducts.map(product => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                        <Card
                            hoverable
                            cover={
                                (() => {
                                    let img = '';
                                    if (Array.isArray(product.imageUrls) && product.imageUrls[0]) {
                                        img = product.imageUrls[0];
                                    } else if (product.media && product.media.mainImage) {
                                        img = product.media.mainImage;
                                    } else if (product.mediaFiles && Array.isArray(product.mediaFiles.images) && product.mediaFiles.images[0]?.path) {
                                        img = product.mediaFiles.images[0].path;
                                    } else {
                                        img = '/images/products/default.jpg';
                                    }
                                    return <img alt={product.name || product.basicInformation?.productName || ''} src={img} />;
                                })()
                            }
                            className="product-card"
                            onClick={() => product._id && navigate(`/products/${product._id}`)}
                        >
                            <Card.Meta
                                title={product.name}
                                description={
                                    <>
                                        <div className="price">
                                            {(() => {
                                                let price = product.price;
                                                if (typeof price !== 'number') {
                                                    price = product.pricingAndInventory?.salePrice;
                                                }
                                                if (typeof price !== 'number') price = 0;
                                                return price.toLocaleString('vi-VN') + ' VNĐ';
                                            })()}
                                        </div>
                                        <div className="rating">
                                            <Rate disabled defaultValue={product.rating} />
                                            <span className="review-count">
                                                ({product.reviewCount})
                                            </span>
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
        </div>
    );
};

export default AllProducts; 