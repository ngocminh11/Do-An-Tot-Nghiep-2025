import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Spin, Tag, Input } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import categoryService from '../../../services/categoryService';
import './CategoryManagement.scss';

const { Search } = Input;

const CategoryManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchParams, setSearchParams] = useState({
        name: ''
    });

    const fetchCategories = async (params = {}) => {
        setLoading(true);
        try {
            const response = await categoryService.getAll({
                ...params,
                page: pagination.current,
                limit: pagination.pageSize
            });

            setCategories(response.items);
            setPagination({
                ...pagination,
                total: response.pagination.totalItems,
                current: response.pagination.currentPage,
                pageSize: response.pagination.perPage
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error(error.message || 'Không thể tải danh mục sản phẩm');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state?.message) {
            message[location.state.type || 'success'](location.state.message);
            window.history.replaceState({}, document.title);
        }
        fetchCategories(searchParams);
    }, [location, pagination.current, pagination.pageSize]);

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
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug'
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
            await categoryService.delete(id);
            message.success('Xóa danh mục thành công.');
            fetchCategories(searchParams);
        } catch (error) {
            message.error(error.message || 'Xóa danh mục thất bại.');
        }
    };

    const handleSearch = (value) => {
        setSearchParams({ name: value });
        setPagination({ ...pagination, current: 1 });
        fetchCategories({ name: value });
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    return (
        <div className="category-management">
            <div className="header">
                <h1>Quản lý danh mục</h1>
                <div className="actions">
                    <Search
                        placeholder="Tìm kiếm theo tên"
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        style={{ width: 300, marginRight: 16 }}
                    />
                    <Button type="primary" onClick={() => navigate('/admin/categories/add')}>
                        Thêm danh mục
                    </Button>
                </div>
            </div>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Table
                    columns={columns}
                    dataSource={categories}
                    rowKey="_id"
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            )}
        </div>
    );
};

export default CategoryManagement; 