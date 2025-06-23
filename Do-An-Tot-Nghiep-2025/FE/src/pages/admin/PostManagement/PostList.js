import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Dữ liệu mẫu
const mockPosts = [
    {
        _id: '1',
        title: 'Cách chăm sóc da mụn hiệu quả',
        slug: 'cach-cham-soc-da-mun',
        excerpt: 'Hướng dẫn chi tiết cách chăm sóc da mụn tại nhà...',
        status: 'published',
        category: 'skincare',
        tags: ['skincare', 'acne'],
        createdAt: '2024-03-15'
    },
    {
        _id: '2',
        title: 'Top 10 sản phẩm dưỡng da tốt nhất 2024',
        slug: 'top-10-san-pham-duong-da',
        excerpt: 'Danh sách các sản phẩm dưỡng da được đánh giá cao...',
        status: 'published',
        category: 'reviews',
        tags: ['skincare', 'reviews'],
        createdAt: '2024-03-14'
    },
    {
        _id: '3',
        title: 'Hướng dẫn trang điểm cơ bản',
        slug: 'huong-dan-trang-diem-co-ban',
        excerpt: 'Các bước trang điểm cơ bản cho người mới bắt đầu...',
        status: 'draft',
        category: 'makeup',
        tags: ['makeup', 'tutorial'],
        createdAt: '2024-03-13'
    }
];

const PostList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState(mockPosts);

    const handleDelete = (id) => {
        setPosts(posts.filter(post => post._id !== id));
        message.success('Xóa bài viết thành công!');
    };

    const handleEdit = (id) => {
        const postId = id.trim();
        console.log('Navigating to edit post:', postId);
        navigate(`/admin/posts/edit/${postId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published':
                return 'success';
            case 'draft':
                return 'warning';
            case 'archived':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'published':
                return 'Đã xuất bản';
            case 'draft':
                return 'Bản nháp';
            case 'archived':
                return 'Đã lưu trữ';
            default:
                return status;
        }
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug'
        },
        {
            title: 'Tóm tắt',
            dataIndex: 'excerpt',
            key: 'excerpt',
            ellipsis: true
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (text) => text.charAt(0).toUpperCase() + text.slice(1)
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags) => tags.join(', ')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span style={{
                    color: getStatusColor(status),
                    fontWeight: 'bold'
                }}>
                    {getStatusText(status)}
                </span>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt'
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record._id)}
                        />
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
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>Quản lý bài viết</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/admin/posts/add')}
                >
                    Thêm bài viết
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={posts}
                rowKey="_id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} bài viết`
                }}
            />
        </div>
    );
};

export default PostList; 