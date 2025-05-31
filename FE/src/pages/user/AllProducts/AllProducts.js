import React, { useState } from 'react';
import { Row, Col, Card, Input, Select, Button, Rate, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { mockProducts, mockCategories } from '../../../services/mockData';
import './AllProducts.scss';

const { Option } = Select;

const AllProducts = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    const filteredProducts = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
            product.description.toLowerCase().includes(searchText.toLowerCase());
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
                            {mockCategories.map(category => (
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
                            cover={<img alt={product.name} src={product.imageUrls[0]} />}
                            className="product-card"
                        >
                            <Card.Meta
                                title={product.name}
                                description={
                                    <>
                                        <div className="price">
                                            {product.price.toLocaleString('vi-VN')} VNĐ
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