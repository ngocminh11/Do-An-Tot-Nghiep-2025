import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Pagination, Spin, Alert, Button } from 'antd';
import postService from '../../../services/postService';
import './Blog.scss';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(6);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts(currentPage);
        // eslint-disable-next-line
    }, [currentPage]);

    const fetchPosts = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const res = await postService.getAllPosts({ page, limit: perPage });
            setPosts(res.data || []);
            setCurrentPage(res.currentPage || 1);
            setTotalItems(res.totalItems || 0);
            setPerPage(res.perPage || 6);
        } catch (err) {
            setError('Không thể tải bài viết.');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewDetail = (id) => {
        navigate(`/posts/${id}`);
    };

    return (
        <div className="blog-page">
            <Title level={1} className="blog-title">Blog Làm Đẹp</Title>
            {loading ? (
                <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />
            ) : error ? (
                <Alert type="error" message={error} showIcon style={{ margin: '40px auto', maxWidth: 400 }} />
            ) : (
                <>
                    <Row gutter={[24, 24]}>
                        {posts.length === 0 ? (
                            <Col span={24} style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>
                                Chưa có bài viết nào.
                            </Col>
                        ) : posts.map(post => (
                            <Col xs={24} sm={12} md={8} key={post._id}>
                                <Card
                                    hoverable
                                    className="blog-card"
                                    cover={post.imageUrl ? <img alt={post.title} src={post.imageUrl} style={{ height: 180, objectFit: 'cover', borderRadius: '12px 12px 0 0' }} /> : null}
                                >
                                    <Card.Meta
                                        title={<span className="blog-post-title">{post.title}</span>}
                                        description={
                                            <>
                                                <Paragraph ellipsis={{ rows: 2 }}>{post.description || post.summary || ''}</Paragraph>
                                                <Text type="secondary" style={{ fontSize: 13 }}>
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : ''}
                                                </Text>
                                            </>
                                        }
                                    />
                                    <Button type="link" onClick={() => handleViewDetail(post._id)} style={{ marginTop: 8 }}>
                                        Xem chi tiết
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {totalItems > perPage && (
                        <Pagination
                            current={currentPage}
                            pageSize={perPage}
                            total={totalItems}
                            onChange={handlePageChange}
                            style={{ margin: '32px auto 0', textAlign: 'center', display: 'block' }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Blog; 