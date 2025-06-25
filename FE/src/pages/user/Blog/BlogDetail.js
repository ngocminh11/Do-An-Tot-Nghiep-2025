import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Alert, Button, Card } from 'antd';
import postService from '../../../services/postService';
import './Blog.scss';

const { Title, Text, Paragraph } = Typography;

const BlogDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPost();
        // eslint-disable-next-line
    }, [id]);

    const fetchPost = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await postService.getPostById(id);
            setPost(res);
        } catch (err) {
            setError('Không thể tải bài viết.');
            setPost(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="blog-page">
            <Button type="link" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
                ← Quay lại Blog
            </Button>
            {loading ? (
                <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />
            ) : error ? (
                <Alert type="error" message={error} showIcon style={{ margin: '40px auto', maxWidth: 400 }} />
            ) : post ? (
                <Card className="blog-card" style={{ maxWidth: 800, margin: '0 auto' }}>
                    {post.imageUrl && (
                        <img
                            alt={post.title}
                            src={post.imageUrl}
                            style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: '12px 12px 0 0', marginBottom: 24 }}
                        />
                    )}
                    <Title level={2} className="blog-post-title">{post.title}</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : ''}
                    </Text>
                    <Paragraph style={{ marginTop: 16 }}>{post.content || post.description || ''}</Paragraph>
                </Card>
            ) : null}
        </div>
    );
};

export default BlogDetail; 