import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Spin, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import categoryService from '../../../services/categoryService';
import './CategoryManagement.scss';

const CategoryManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra và hiển thị thông báo từ state navigation
        if (location.state?.message) {
            message[location.state.type || 'success'](location.state.message);
            // Xóa state để tránh hiển thị lại khi refresh
            window.history.replaceState({}, document.title);
        }

        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await categoryService.getAllCategories();
                setCategories(response);
            } catch (error) {
                console.error('Error fetching categories:', error);
                message.error('Không thể tải danh mục sản phẩm');
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [location]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'warning';
            case 'archived':
                return 'error';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: 'Danh mục cha',
            dataIndex: 'parentCategory',
            key: 'parentCategory',
            render: (parentId) => {
                if (!parentId) return 'Không có';
                const parent = categories.find(c => c._id === parentId);
                return parent ? parent.name : 'Không xác định';
            }
        },
        {
            title: 'Vị trí',
            dataIndex: 'position',
            key: 'position',
            sorter: (a, b) => a.position - b.position
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status === 'active' ? 'Hoạt động' :
                        status === 'inactive' ? 'Không hoạt động' : 'Đã lưu trữ'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admin/categories/edit/${record._id}`)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title={`Bạn có chắc chắn muốn xóa danh mục ${record.name}?`}
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        okType="danger"
                        cancelText="Hủy"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleDelete = async (id) => {
        try {
            await categoryService.deleteCategory(id);
            message.success('Xóa danh mục thành công.');
            setCategories(categories.filter(cat => cat._id !== id));
        } catch (error) {
            const errorMessage = error.message || 'Xóa danh mục thất bại.';
            message.error(errorMessage);
        }
    };

    return (
        <div className="category-management">
            <div className="header">
                <h1>Quản lý danh mục</h1>
                <Button type="primary" onClick={() => navigate('/admin/categories/add')}>
                    Thêm danh mục
                </Button>
            </div>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Table
                    columns={columns}
                    dataSource={categories}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};

export default CategoryManagement; 