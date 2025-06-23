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
        name: '',
        status: ''
    });

    const fetchCategories = async (params = {}) => {
        setLoading(true);
        try {
            const response = await categoryService.getAllCategories({
                ...params,
                page: pagination.current,
                limit: pagination.pageSize
            });
            // response: { data, currentPage, totalItems, perPage }
            setCategories(response.data);
            setPagination({
                ...pagination,
                current: response.currentPage,
                total: response.totalItems,
                pageSize: response.perPage
            });
        } catch (error) {
            setCategories([]);
            setPagination({ ...pagination, total: 0 });
            message.error('Không thể tải danh mục sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories khi component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch categories khi có thay đổi về pagination hoặc search params
    useEffect(() => {
        fetchCategories(searchParams);
    }, [pagination.current, pagination.pageSize, searchParams]);

    // Xử lý message từ navigation
    useEffect(() => {
        if (location.state?.message) {
            message[location.state.type || 'success'](location.state.message);
            window.history.replaceState({}, document.title);
        }
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
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text || 'N/A'}</span>
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => text || 'N/A'
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            render: (text) => text || 'N/A'
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
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            if (!record._id) {
                                message.error('Không tìm thấy ID danh mục!');
                                return;
                            }
                            navigate(`/admin/categories/edit/${record._id}`);
                        }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title={`Bạn có chắc chắn muốn xóa danh mục ${record.name || 'này'}?`}
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

    const handleDelete = async (_id) => {
        if (!_id) {
            message.error('Không tìm thấy ID danh mục!');
            return;
        }
        try {
            await categoryService.deleteCategory(_id);
            message.success('Xóa danh mục thành công.');
            fetchCategories(searchParams);
        } catch (error) {
            const errorMessage = error?.message || error?.msg || 'Xóa danh mục thất bại.';
            message.error(errorMessage);
        }
    };

    const handleSearch = (value) => {
        setSearchParams({ ...searchParams, name: value });
        setPagination({ ...pagination, current: 1 });
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