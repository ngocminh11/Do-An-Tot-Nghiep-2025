import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, InputNumber, Rate, Tabs, message, Spin, Badge, Tag } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, StarFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import productService, { getImageUrl } from '../../../services/productService';
import cartService from '../../../services/cartService';
import commentService from '../../../services/commentService';
import './ProductDetail.scss';

const { TabPane } = Tabs;

// Memoized Review Item Component
const ReviewItem = React.memo(({ comment, idx }) => {
    const reviewerName = useMemo(() =>
        comment.userId?.fullName || comment.user?.fullName || comment.user?.name || 'Khách hàng',
        [comment.userId, comment.user]
    );

    const reviewDate = useMemo(() =>
        comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '',
        [comment.createdAt]
    );

    return (
        <div className="review-item fade-in" key={comment._id || idx}>
            <div className="review-header">
                <div className="reviewer-info">
                    <span className="reviewer">{reviewerName}</span>
                    <div className="review-date">Đánh giá sản phẩm này vào {reviewDate}</div>
                </div>
                <Rate
                    disabled
                    value={comment.rating || 5}
                    style={{ fontSize: 16 }}
                />
            </div>
            <div className="review-content">
                {comment.content || 'Không có nội dung đánh giá'}
            </div>

            {/* Hiển thị images nếu có */}
            {comment.images && comment.images.length > 0 && (
                <div className="review-images">
                    <div className="images-label">Hình ảnh đánh giá:</div>
                    <div className="images-grid">
                        {comment.images.map((image, imgIdx) => (
                            <img
                                key={imgIdx}
                                src={image}
                                alt={`Đánh giá ${idx + 1}`}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Admin reply */}
            {comment.reply && comment.reply.content && (
                <div className="admin-reply">
                    <div className="reply-header">
                        <div className="shop-badge">S</div>
                        <span className="shop-name">Phản hồi từ shop</span>
                        {comment.reply.repliedAt && (
                            <span className="reply-date">
                                {new Date(comment.reply.repliedAt).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                    <div className="reply-content">
                        {comment.reply.content}
                    </div>
                </div>
            )}
        </div>
    );
});

const ProductDetail = () => {
    const { productId: id } = useParams();
    const navigate = useNavigate();
    console.log('ProductDetail param id:', id);
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [imageUrls, setImageUrls] = useState([]); // object URLs cho ảnh gallery
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [ratingFilter, setRatingFilter] = useState(0); // 0 = tất cả, 1-5 = filter theo sao
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, rating
    const [selectedImage, setSelectedImage] = useState(0);

    // Memoized event handlers
    const handleQuantityChange = useCallback((value) => {
        setQuantity(value);
    }, []);

    const handleAddToCart = useCallback(async () => {
        try {
            await cartService.addToCart(id, quantity);
            message.success('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (err) {
            message.error(err?.message || 'Thêm vào giỏ hàng thất bại!');
        }
    }, [id, quantity]);

    const handleBuyNow = useCallback(() => {
        navigate(`/checkout?productId=${id}&quantity=${quantity}`);
    }, [navigate, id, quantity]);

    const handleImageSelect = useCallback((index) => {
        setSelectedImage(index);
    }, []);

    // Memoized product data
    const productData = useMemo(() => {
        if (!product) return {};

        const basic = product.basicInformation || {};
        const priceInfo = product.pricingAndInventory || {};
        const desc = product.description || {};
        const media = product.media || {};
        const mediaFiles = product.mediaFiles || {};
        const images = mainImageUrl ? [mainImageUrl, ...imageUrls.filter(u => u !== mainImageUrl)] : imageUrls;
        const mainImage = images[0] || '/images/products/default.jpg';

        return {
            basic,
            priceInfo,
            desc,
            media,
            mediaFiles,
            images,
            mainImage
        };
    }, [product, mainImageUrl, imageUrls]);

    // Memoized comments processing
    const validComments = useMemo(() => {
        return comments.filter(comment =>
            comment.userId &&
            comment.userId._id &&
            comment.productId &&
            comment.productId._id === id
        );
    }, [comments, id]);

    const ratingStats = useMemo(() => {
        return validComments.reduce((stats, comment) => {
            const rating = comment.rating || 5;
            stats[rating] = (stats[rating] || 0) + 1;
            stats.total += 1;
            stats.average += rating;
            return stats;
        }, { total: 0, average: 0 });
    }, [validComments]);

    const averageRating = useMemo(() => {
        if (ratingStats.total > 0) {
            return Math.round((ratingStats.average / ratingStats.total) * 10) / 10;
        }
        return 0;
    }, [ratingStats]);

    const totalReviews = useMemo(() => validComments.length || 0, [validComments]);

    const filteredComments = useMemo(() => {
        return validComments
            .filter(comment => ratingFilter === 0 || comment.rating === ratingFilter)
            .sort((a, b) => {
                switch (sortBy) {
                    case 'newest':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'oldest':
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    case 'rating':
                        return (b.rating || 5) - (a.rating || 5);
                    default:
                        return 0;
                }
            });
    }, [validComments, ratingFilter, sortBy]);

    // Calculate discount
    const discountInfo = useMemo(() => {
        const originalPrice = productData.priceInfo?.originalPrice || 0;
        const salePrice = productData.priceInfo?.salePrice || originalPrice;
        const discount = originalPrice > salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

        return {
            originalPrice,
            salePrice,
            discount
        };
    }, [productData.priceInfo]);

    // Optimized image loading
    const loadProductImages = useCallback(async (productData) => {
        const media = productData.media || {};
        const mediaFiles = productData.mediaFiles || {};
        let mainPath = '';
        let galleryPaths = [];

        if (mediaFiles.images && mediaFiles.images.length > 0) {
            mainPath = mediaFiles.images[0].path;
            galleryPaths = mediaFiles.images.map(img => img.path);
        } else if (media.mainImage) {
            mainPath = media.mainImage;
        }

        // Load main image
        if (mainPath) {
            try {
                const blob = await productService.getImageById(mainPath.replace('/media/', ''));
                setMainImageUrl(URL.createObjectURL(blob));
            } catch (e) {
                setMainImageUrl('');
            }
        } else {
            setMainImageUrl('');
        }

        // Load gallery images in parallel
        if (galleryPaths.length > 0) {
            const imagePromises = galleryPaths.map(async (p) => {
                try {
                    const blob = await productService.getImageById(p.replace('/media/', ''));
                    return URL.createObjectURL(blob);
                } catch {
                    return '';
                }
            });

            const urls = await Promise.all(imagePromises);
            setImageUrls(urls.filter(Boolean));
        } else if (media.imageGallery && media.imageGallery.length > 0) {
            const imagePromises = media.imageGallery.map(async (p) => {
                try {
                    const blob = await productService.getImageById(p.replace('/media/', ''));
                    return URL.createObjectURL(blob);
                } catch {
                    return '';
                }
            });

            const urls = await Promise.all(imagePromises);
            setImageUrls(urls.filter(Boolean));
        } else {
            setImageUrls([]);
        }
    }, []);

    // Optimized useEffect for product fetching
    useEffect(() => {
        if (!id) {
            setProduct(null);
            setErrorMsg('ID sản phẩm không hợp lệ');
            setLoading(false);
            return;
        }

        let isMounted = true;

        async function fetchProduct() {
            setLoading(true);
            setErrorMsg('');
            try {
                const res = await productService.getProductById(id);
                console.log('API response for getProductById:', res);

                if (!isMounted) return;

                if (res?.status === 'Error' || !res?.data) {
                    setProduct(null);
                    setErrorMsg(res?.message || 'Không tìm thấy sản phẩm');
                } else {
                    setProduct(res.data);
                    console.log('Fetched product:', res.data);

                    // Load images in background
                    loadProductImages(res.data);
                }
            } catch (err) {
                if (!isMounted) return;
                setProduct(null);
                setErrorMsg(err?.message || 'Không tìm thấy sản phẩm');
                console.log('Error fetching product:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProduct();

        return () => {
            isMounted = false;
        };
    }, [id, loadProductImages]);

    // Optimized useEffect for comments fetching
    useEffect(() => {
        if (!id) return;

        let isMounted = true;

        async function fetchComments() {
            setLoadingComments(true);
            try {
                const res = await commentService.getCommentsByProduct(id, {
                    page: 1,
                    limit: 50,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                });
                console.log('Comments response:', res);
                console.log('Product ID being viewed:', id);

                if (!isMounted) return;

                if (res && res.data && Array.isArray(res.data)) {
                    console.log('All comments received:', res.data.length);
                    setComments(res.data);
                } else if (res && Array.isArray(res)) {
                    setComments(res);
                } else {
                    setComments([]);
                }
            } catch (error) {
                if (!isMounted) return;
                console.error('Error fetching comments:', error);
                setComments([]);
            } finally {
                if (isMounted) {
                    setLoadingComments(false);
                }
            }
        }

        fetchComments();

        return () => {
            isMounted = false;
        };
    }, [id]);

    if (loading) return (
        <div className="loading-container">
            <Spin size="large" />
        </div>
    );

    if (!product) return (
        <div className="error-container">
            <ExclamationCircleOutlined className="error-icon" />
            <div className="error-message">{errorMsg || 'Không tìm thấy sản phẩm'}</div>
        </div>
    );

    // Lấy thông tin cần thiết từ product
    const basic = productData.basic;
    const priceInfo = productData.priceInfo;
    const desc = productData.desc;
    const media = productData.media;
    const mediaFiles = productData.mediaFiles;
    const images = productData.images;
    const mainImage = images[selectedImage] || images[0] || '/images/products/default.jpg';
    console.log('Product images:', images);
    console.log('Main image:', mainImage);

    return (
        <div className="product-detail fade-in">
            <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                    <div className="product-images hover-lift">
                        <img
                            src={mainImage}
                            alt={basic.productName}
                            className="main-image"
                        />
                        <div className="thumbnail-list custom-scrollbar">
                            {images.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`${basic.productName || ''} ${index + 1}`}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => handleImageSelect(index)}
                                />
                            ))}
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={12}>
                    <div className="product-info hover-lift">
                        <h1>{basic.productName || 'Không có tên'}</h1>

                        <div className="price">
                            {discountInfo.salePrice.toLocaleString('vi-VN')} VNĐ
                            {discountInfo.discount > 0 && (
                                <>
                                    <span className="original-price">
                                        {discountInfo.originalPrice.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                    <span className="discount-badge">
                                        -{discountInfo.discount}%
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="rating">
                            <Rate disabled defaultValue={averageRating || 5} />
                            <span className="review-count">({totalReviews} đánh giá)</span>
                            {averageRating > 0 && (
                                <span className="rating-score">{averageRating}</span>
                            )}
                        </div>

                        <p className="description">
                            {desc.shortDescription || desc.detailedDescription || basic.description || 'Không có mô tả'}
                        </p>

                        <div className="quantity-selector">
                            <span>Số lượng:</span>
                            <InputNumber
                                min={1}
                                max={priceInfo.stockQuantity || 99}
                                value={quantity}
                                onChange={handleQuantityChange}
                            />
                        </div>

                        <div className="actions">
                            <Button
                                type="default"
                                icon={<ShoppingCartOutlined />}
                                size="large"
                                onClick={handleAddToCart}
                            >
                                Thêm vào giỏ hàng
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleBuyNow}
                            >
                                Mua ngay
                            </Button>
                        </div>

                        <div className="product-meta">
                            <div className="meta-item">
                                <span className="label">Thương hiệu:</span>
                                <span className="value">{basic.brand || 'Không rõ'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Danh mục:</span>
                                <span className="value">
                                    {Array.isArray(basic.categoryIds) && basic.categoryIds.length > 0
                                        ? basic.categoryIds.map(cat => cat.name || cat).join(', ')
                                        : (basic.category || 'Không rõ')
                                    }
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Tình trạng:</span>
                                <span className={`status-badge ${(priceInfo.stockQuantity || 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {(priceInfo.stockQuantity || 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
                                </span>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <Card className="product-tabs hover-lift">
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Mô tả" key="1">
                        <div className="tab-content slide-up">
                            <h3>Chi tiết sản phẩm</h3>
                            <p>{desc.detailedDescription || desc.shortDescription || 'Không có mô tả chi tiết'}</p>

                            {desc.ingredients && (
                                <>
                                    <h3>Thành phần</h3>
                                    <p>
                                        {Array.isArray(desc.ingredients)
                                            ? desc.ingredients.join(', ')
                                            : desc.ingredients
                                        }
                                    </p>
                                </>
                            )}

                            {desc.usageInstructions && (
                                <>
                                    <h3>Cách sử dụng</h3>
                                    <p>
                                        {Array.isArray(desc.usageInstructions)
                                            ? desc.usageInstructions.join(' ')
                                            : desc.usageInstructions
                                        }
                                    </p>
                                </>
                            )}
                        </div>
                    </TabPane>

                    <TabPane tab={`Đánh giá sản phẩm (${totalReviews})`} key="2">
                        <div className="tab-content slide-up">
                            {/* Header với thông tin sản phẩm */}
                            <div className="reviews-header">
                                <h3>Đánh giá cho sản phẩm: {basic.productName || 'Không có tên'}</h3>
                                <p>Xem tất cả đánh giá từ khách hàng đã mua và sử dụng sản phẩm này</p>
                            </div>

                            {loadingComments ? (
                                <div className="loading-container">
                                    <Spin />
                                </div>
                            ) : totalReviews === 0 ? (
                                <div className="no-reviews">
                                    <p>Chưa có đánh giá nào cho sản phẩm <strong>{basic.productName || 'này'}</strong>.</p>
                                    <p>Hãy là người đầu tiên đánh giá sản phẩm!</p>
                                    {process.env.NODE_ENV === 'development' && (
                                        <div className="debug-info">
                                            <strong>Debug Info:</strong><br />
                                            Product ID: {id}<br />
                                            Total comments from API: {comments.length}<br />
                                            Valid comments: {validComments.length}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="reviews-section">
                                    {/* Thống kê rating */}
                                    <div className="rating-stats">
                                        <div className="rating-overview">
                                            <div className="average-rating">
                                                <div className="rating-number">{averageRating}</div>
                                                <Rate disabled value={averageRating} />
                                                <div className="rating-text">{totalReviews} đánh giá cho sản phẩm này</div>
                                            </div>
                                            <div className="rating-breakdown">
                                                {[5, 4, 3, 2, 1].map(star => (
                                                    <div key={star} className="rating-bar">
                                                        <span className="star-label">{star}★</span>
                                                        <div className="progress-bar">
                                                            <div
                                                                className="progress-fill"
                                                                style={{
                                                                    width: `${ratingStats[star] ? (ratingStats[star] / totalReviews) * 100 : 0}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="star-count">{ratingStats[star] || 0}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filter controls */}
                                    <div className="filter-controls">
                                        <select
                                            value={ratingFilter}
                                            onChange={(e) => setRatingFilter(Number(e.target.value))}
                                        >
                                            <option value={0}>Tất cả đánh giá</option>
                                            <option value={5}>5 sao</option>
                                            <option value={4}>4 sao</option>
                                            <option value={3}>3 sao</option>
                                            <option value={2}>2 sao</option>
                                            <option value={1}>1 sao</option>
                                        </select>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="newest">Mới nhất</option>
                                            <option value="oldest">Cũ nhất</option>
                                            <option value="rating">Đánh giá cao nhất</option>
                                        </select>
                                        <span className="filter-info">
                                            Hiển thị {filteredComments.length} / {totalReviews} đánh giá cho sản phẩm này
                                        </span>
                                    </div>

                                    {/* Reviews list */}
                                    <div className="reviews-list">
                                        {filteredComments.map((comment, idx) => (
                                            <ReviewItem key={comment._id || idx} comment={comment} idx={idx} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default ProductDetail; 