import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Spin } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../../services/categoryService';
import './CategoryManagement.scss';

const CategoryManagement = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await categoryService.getAllCategories({ limit: 9999 });
                console.log("danh mục",response);
                const categoriesData = Array.isArray(response) ? response : [];
                setCategories(categoriesData.map(cat => ({ ...cat, _id: String(cat._id) })));
            } catch (error) {
                console.error('Error fetching categories:', error);
                message.error('Không thể tải danh mục sản phẩm');
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Danh mục cha',
            dataIndex: 'parentId',
            key: 'parentId',
            render: (parentId) => {
                if (!parentId) return 'Không có';
                const parent = categories.find(c => String(c._id) === String(parentId));
                return parent ? parent.name : `Unknown (${parentId})`;
            }
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
            const updatedCategories = categories.filter(cat => String(cat._id) !== String(id));
            setCategories(updatedCategories);
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