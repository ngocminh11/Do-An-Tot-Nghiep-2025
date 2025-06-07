import React, { useState } from 'react';
import { Table, Button, Space, Tag, Image, Tooltip, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LikeOutlined, VideoCameraOutlined, PictureOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Mock data for posts
const mockPosts = [
    {
        _id: '1',
        title: 'Cách trị mụn hiệu quả',
        content: 'Nội dung bài viết về trị mụn...',
        mediaUrl: 'https://via.placeholder.com/100',
        mediaType: 'image',
        tag: 'Chăm sóc da',
        skinProblem: 'Mụn',
        likes: 5,
    },
    {
        _id: '2',
        title: 'Video hướng dẫn dưỡng da',
        content: 'Video hướng dẫn...',
        mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        mediaType: 'video',
        tag: 'Dưỡng da',
        skinProblem: 'Da khô',
        likes: 2,
    },
];

const PostList = () => {
    const [posts, setPosts] = useState(mockPosts);
    const navigate = useNavigate();

    const handleDelete = (id) => {
        setPosts(posts.filter(post => post._id !== id));
        message.success('Đã xoá bài viết (mock)');
    };

    const handleLike = (id) => {
        setPosts(posts.map(post => post._id === id ? { ...post, likes: post.likes + 1 } : post));
    };

    const columns = [
        {
            title: 'Media',
            dataIndex: 'mediaUrl',
            key: 'mediaUrl',
            render: (url, record) =>
                record.mediaType === 'image' ? (
                    <Image src={url} width={60} height={60} alt="post" style={{ objectFit: 'cover' }} preview={false} />
                ) : (
                    <video width={60} height={60} controls>
                        <source src={url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ),
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Tag',
            dataIndex: 'tag',
            key: 'tag',
            render: tag => <Tag color="blue">{tag}</Tag>,
        },
        {
            title: 'Vấn đề da',
            dataIndex: 'skinProblem',
            key: 'skinProblem',
        },
        {
            title: 'Lượt thích',
            dataIndex: 'likes',
            key: 'likes',
            render: (likes, record) => (
                <Button icon={<LikeOutlined />} onClick={() => handleLike(record._id)}>{likes}</Button>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} onClick={() => navigate(`   /admin/posts/edit/${record._id}`)} />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc muốn xoá bài viết này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xoá"
                        cancelText="Huỷ"
                    >
                        <Tooltip title="Xoá">
                            <Button danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="post-management">
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Quản lý bài viết</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/posts/add')}>
                    Thêm bài viết
                </Button>
            </div>
            <Table columns={columns} dataSource={posts} rowKey="_id" />
        </div>
    );
};

export default PostList; 