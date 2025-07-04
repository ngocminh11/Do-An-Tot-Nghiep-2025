import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Row, Col, Card, Input, Select, Button, Rate, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { productService, getAllProductsUser, getImageByIdUser, getProductsByCategoryUser } from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import commentService from '../../../services/commentService';
import './AllProducts.scss';
import { useNavigate } from 'react-router-dom';
import config from '../../../config';

const { Option } = Select;

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

// Helper function to get product category ID
const getProductCategoryId = (product) => {
    return product.category ||
        product.categoryId ||
        product.basicInformation?.categoryId ||
        (Array.isArray(product.categoryIds) && product.categoryIds[0]?._id) ||
        (Array.isArray(product.categoryIds) && product.categoryIds[0]) ||
        null;
};

// Helper function to debug product structure
const debugProductStructure = (product, categories) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Product structure debug:', {
            productId: product._id,
            productName: product.name || product.basicInformation?.productName,
            category: product.category,
            categoryId: product.categoryId,
            basicInfoCategoryId: product.basicInformation?.categoryId,
            categoryIds: product.categoryIds,
            resolvedCategoryId: getProductCategoryId(product),
            availableCategories: categories.map(c => ({ id: c._id, name: c.name }))
        });
    }
};

// Memoized Product Card Component
const ProductCard = React.memo(({ product, categories, imageUrl, productRatings, onProductClick }) => {
    const productName = useMemo(() =>
        product.name || product.basicInformation?.productName || '',
        [product.name, product.basicInformation?.productName]
    );

    const productImage = useMemo(() => {
        if (imageUrl) {
            return imageUrl;
        } else if (Array.isArray(product.imageUrls) && product.imageUrls[0]) {
            return product.imageUrls[0];
        } else if (product.media && product.media.mainImage) {
            return product.media.mainImage;
        } else if (product.mediaFiles && Array.isArray(product.mediaFiles.images) && product.mediaFiles.images[0]?.path) {
            return product.mediaFiles.images[0].path;
        } else {
            return '/images/products/default.jpg';
        }
    }, [product, imageUrl]);

    const categoryName = useMemo(() => {
        // Chuẩn hóa lấy categoryId dạng string
        let productCategoryId = getProductCategoryId(product);
        if (typeof productCategoryId === 'object' && productCategoryId !== null) {
            productCategoryId = productCategoryId._id || productCategoryId.id || '';
        }
        if (Array.isArray(productCategoryId)) {
            productCategoryId = productCategoryId[0]?._id || productCategoryId[0]?.id || productCategoryId[0] || '';
        }
        if (typeof productCategoryId !== 'string') {
            productCategoryId = String(productCategoryId || '');
        }
        // Tìm category theo _id
        const cat = categories.find(c => String(c._id) === productCategoryId);
        return cat ? cat.name : 'Không phân loại';
    }, [categories, product]);

    const price = useMemo(() => {
        let priceValue = product.price;
        if (typeof priceValue !== 'number') {
            priceValue = product.pricingAndInventory?.salePrice;
        }
        if (typeof priceValue !== 'number') priceValue = 0;
        return priceValue.toLocaleString('vi-VN') + ' VNĐ';
    }, [product.price, product.pricingAndInventory?.salePrice]);

    const description = useMemo(() => {
        const desc = typeof product.description === 'string'
            ? product.description
            : (product.description?.shortDescription || product.basicInformation?.description || '');
        return desc.length > 80 ? desc.slice(0, 80) + '...' : desc;
    }, [product.description, product.basicInformation?.description]);

    // Get rating data from productRatings
    const ratingData = useMemo(() => {
        return productRatings[product._id] || { averageRating: 0, totalReviews: 0 };
    }, [productRatings, product._id]);

    // Format rating display
    const ratingDisplay = useMemo(() => {
        const { averageRating, totalReviews } = ratingData;
        if (totalReviews === 0) {
            return { stars: 0, text: 'Chưa có đánh giá' };
        }
        return {
            stars: averageRating,
            text: `${averageRating.toFixed(1)} (${totalReviews} đánh giá)`
        };
    }, [ratingData]);

    return (
        <Col xs={24} sm={12} md={8} lg={6}>
            <Card
                hoverable
                cover={
                    <img
                        alt={productName}
                        src={productImage}
                        loading="lazy"
                        style={{ height: 200, objectFit: 'cover' }}
                    />
                }
                className="product-card"
                onClick={() => product._id && onProductClick(product._id)}
            >
                <Card.Meta
                    title={productName}
                    description={
                        <>
                            <div className="category">{categoryName}</div>
                            <div className="price">{price}</div>
                            <div className="rating">
                                <Rate
                                    disabled
                                    value={ratingDisplay.stars}
                                    allowHalf
                                    style={{ fontSize: '14px' }}
                                />
                                <span className="review-count">
                                    {ratingDisplay.text}
                                </span>
                            </div>
                            <div className="short-desc">{description}</div>
                        </>
                    }
                />
            </Card>
        </Col>
    );
});

const AllProducts = () => {
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState({});
    const [productRatings, setProductRatings] = useState({});
    const [categoryProducts, setCategoryProducts] = useState({}); // Cache sản phẩm theo danh mục
    const navigate = useNavigate();
    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Debounced search
    const debouncedSetSearch = useCallback(
        debounce((value) => {
            setDebouncedSearchText(value);
            setCurrentPage(1); // Reset to first page when searching
        }, 300),
        []
    );

    const handleSearchChange = useCallback((e) => {
        setSearchText(e.target.value);
        debouncedSetSearch(e.target.value);
    }, [debouncedSetSearch]);

    const handleProductClick = useCallback((productId) => {
        navigate(`/products/${productId}`);
    }, [navigate]);

    // Handle category change
    const handleCategoryChange = useCallback(async (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
        setLoading(true);

        try {
            if (categoryId === 'all') {
                // Load all products
                const productRes = await getAllProductsUser({ page: 1, limit: 100 });
                const products = Array.isArray(productRes?.data?.data) ? productRes.data.data :
                    Array.isArray(productRes?.data) ? productRes.data : [];
                setProducts(products);
            } else {
                // Load products by category
                if (categoryProducts[categoryId]) {
                    // Use cached data
                    setProducts(categoryProducts[categoryId]);
                } else {
                    // Fetch from API
                    const response = await getProductsByCategoryUser(categoryId, {
                        page: 1,
                        limit: 100,
                        status: 'active'
                    });
                    const products = Array.isArray(response?.data?.data) ? response.data.data : [];
                    setProducts(products);
                    // Cache the result
                    setCategoryProducts(prev => ({ ...prev, [categoryId]: products }));
                }
            }
        } catch (error) {
            console.error('Error loading products by category:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [categoryProducts]);

    // Memoized filtered and sorted products
    const filteredProducts = useMemo(() => {
        // Only log in development and when there are significant changes
        if (process.env.NODE_ENV === 'development') {
            console.log('Filtering products:', {
                totalProducts: products.length,
                selectedCategory,
                categories: categories.map(c => ({ id: c._id, name: c.name }))
            });
        }

        const filtered = (Array.isArray(products) ? products : []).filter(product => {
            const name = typeof product.name === 'string' ? product.name : (product.basicInformation?.productName || '');
            const description = typeof product.description === 'string'
                ? product.description
                : (product.description?.shortDescription || product.basicInformation?.description || '');

            const matchesSearch = name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                description.toLowerCase().includes(debouncedSearchText.toLowerCase());

            // If category is already filtered by API, no need to filter again
            if (selectedCategory === 'all') {
                return matchesSearch;
            }

            return matchesSearch;
        });

        // Only log results in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Filtering results:', {
                totalProducts: products.length,
                filteredCount: filtered.length,
                searchText: debouncedSearchText,
                selectedCategory,
                selectedCategoryName: selectedCategory !== 'all'
                    ? categories.find(c => c._id === selectedCategory)?.name
                    : 'Tất cả'
            });
        }

        return filtered;
    }, [products, debouncedSearchText, selectedCategory, categories]);

    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return (a.price || 0) - (b.price || 0);
                case 'price-desc':
                    return (b.price || 0) - (a.price || 0);
                case 'rating':
                    const ratingA = productRatings[a._id]?.averageRating || 0;
                    const ratingB = productRatings[b._id]?.averageRating || 0;
                    return ratingB - ratingA;
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });
    }, [filteredProducts, sortBy, productRatings]);

    const paginatedProducts = useMemo(() => {
        return sortedProducts.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
    }, [sortedProducts, currentPage, pageSize]);

    // Load product ratings from comments
    const loadProductRatings = useCallback(async (products) => {
        if (!isMountedRef.current) return;

        const ratingPromises = products.map(async (product) => {
            if (!product._id || !isMountedRef.current) {
                return null;
            }

            try {
                const commentsRes = await commentService.getCommentsByProduct(product._id, {
                    page: 1,
                    limit: 100,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                });

                if (!isMountedRef.current) return null;

                const comments = Array.isArray(commentsRes.data) ? commentsRes.data : [];

                // Calculate average rating and total reviews
                const validComments = comments.filter(comment =>
                    comment.userId &&
                    comment.userId._id &&
                    comment.productId &&
                    comment.productId._id === product._id &&
                    typeof comment.rating === 'number' &&
                    comment.rating >= 1 &&
                    comment.rating <= 5
                );

                const totalReviews = validComments.length;
                const totalRating = validComments.reduce((sum, comment) => sum + comment.rating, 0);
                const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

                if (process.env.NODE_ENV === 'development') {
                    console.log(`Product ${product._id} - ${product.name || product.basicInformation?.productName}:`, {
                        totalComments: comments.length,
                        validComments: validComments.length,
                        totalRating,
                        averageRating: averageRating.toFixed(2),
                        totalReviews
                    });
                }

                return {
                    productId: product._id,
                    averageRating,
                    totalReviews
                };
            } catch (error) {
                console.error(`Error loading ratings for product ${product._id}:`, error);
                return {
                    productId: product._id,
                    averageRating: 0,
                    totalReviews: 0
                };
            }
        });

        const results = await Promise.all(ratingPromises);

        if (!isMountedRef.current) return;

        const newRatings = {};
        results.forEach(result => {
            if (result) {
                newRatings[result.productId] = {
                    averageRating: result.averageRating,
                    totalReviews: result.totalReviews
                };
            }
        });

        setProductRatings(prev => ({ ...prev, ...newRatings }));
    }, []);

    // Thay thế toàn bộ logic loadProductImages và imageUrls bằng hàm getImageUrl
    const getImageUrl = async (product) => {
        let imgPath = '';
        if (product.mediaFiles && Array.isArray(product.mediaFiles.images) && product.mediaFiles.images[0]?.path) {
            imgPath = product.mediaFiles.images[0].path;
        } else if (product.media && product.media.mainImage) {
            imgPath = product.media.mainImage;
        }
        if (!imgPath) return '/images/products/default.jpg';
        try {
            const response = await fetch(`${config.API_BASE_URL}${imgPath}`);
            if (!response.ok) throw new Error('Image fetch failed');
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch {
            // fallback sang URL trực tiếp
            if (imgPath.startsWith('http')) return imgPath;
            return `${config.API_BASE_URL}${imgPath}`;
        }
    };

    // Optimized useEffect for data fetching
    useEffect(() => {
        isMountedRef.current = true;
        async function fetchData() {
            setLoading(true);
            try {
                const [productRes, categoryRes] = await Promise.all([
                    getAllProductsUser({ page: 1, limit: 100 }),
                    categoryService.getCategories({ page: 1, limit: 100 })
                ]);
                const products = Array.isArray(productRes?.data?.data) ? productRes.data.data :
                    Array.isArray(productRes?.data) ? productRes.data : [];
                const categories = Array.isArray(categoryRes?.data) ? categoryRes.data : [];
                if (isMountedRef.current) {
                    setProducts(products);
                    setCategories(categories);
                    if (products.length > 0) {
                        await Promise.all([
                            loadProductRatings(products)
                        ]);
                    }
                }
            } catch (err) {
                if (isMountedRef.current) {
                    setProducts([]);
                    setCategories([]);
                }
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        }
        fetchData();
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!Array.isArray(products)) return;
        products.forEach(async (product) => {
            if (!imageUrls[product._id]) {
                const url = await getImageUrl(product);
                setImageUrls(prev => ({ ...prev, [product._id]: url }));
            }
        });
        // eslint-disable-next-line
    }, [products]);

    return (
        <div className="all-products">
            <div className="filters">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={handleSearchChange}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
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
                {loading ? (
                    // Loading skeleton
                    Array.from({ length: 8 }).map((_, index) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={index}>
                            <Card loading={true} className="product-card" />
                        </Col>
                    ))
                ) : paginatedProducts.length > 0 ? (
                    paginatedProducts.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            categories={categories}
                            imageUrl={imageUrls[product._id]}
                            productRatings={productRatings}
                            onProductClick={handleProductClick}
                        />
                    ))
                ) : (
                    // No products found
                    <Col span={24}>
                        <div className="no-products">
                            <div className="no-products-content">
                                <h3>Không tìm thấy sản phẩm</h3>
                                <p>
                                    {debouncedSearchText || selectedCategory !== 'all'
                                        ? 'Thử thay đổi từ khóa tìm kiếm hoặc danh mục khác'
                                        : 'Hiện tại chưa có sản phẩm nào'
                                    }
                                </p>
                                {(debouncedSearchText || selectedCategory !== 'all') && (
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            setSearchText('');
                                            setDebouncedSearchText('');
                                            setSelectedCategory('all');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Col>
                )}
            </Row>

            {!loading && filteredProducts.length > 0 && (
                <div className="pagination">
                    <Pagination
                        current={currentPage}
                        total={filteredProducts.length}
                        pageSize={pageSize}
                        onChange={setCurrentPage}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
};

export default AllProducts; 