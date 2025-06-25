import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import postService from '../../../services/postService';

const PostList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchPosts = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await postService.getAllPosts({ page, limit: pageSize });
            setPosts(response.data);
            setPagination({
                current: response.currentPage,
                pageSize: response.perPage,
                total: response.totalItems
            });
        } catch (error) {
            setPosts([]);
            setPagination({ current: 1, pageSize: 10, total: 0 });
            message.error('Không thể tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(pagination.current, pagination.pageSize);
        // eslint-disable-next-line
    }, []);

    const handleTableChange = (pag) => {
        fetchPosts(pag.current, pag.pageSize);
    };

    const handleDelete = async (id) => {
        try {
            await postService.deletePost(id);
            message.success('Xóa bài viết thành công!');
            fetchPosts(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Không thể xóa bài viết!');
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/posts/edit/${id}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published':
                return 'green';
            case 'draft':
                return 'orange';
            case 'archived':
                return 'red';
            default:
                return 'gray';
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
            render: (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : 'N/A'
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags) => Array.isArray(tags) ? tags.join(', ') : 'N/A'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span style={{ color: getStatusColor(status), fontWeight: 'bold' }}>
                    {getStatusText(status)}
                </span>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
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
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} bài viết`
                }}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default PostList; 