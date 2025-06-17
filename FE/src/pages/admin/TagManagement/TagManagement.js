import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Modal, message, Input } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import tagService from '../../../services/tagService';
import './TagManagement.scss';

const TagManagement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchText, setSearchText] = useState('');

    const fetchTags = async (page = 1, limit = 10, name = '') => {
        try {
            setLoading(true);
            const response = await tagService.getAllTags({
                page,
                limit,
                name
            });
            setTags(response.data.data);
            setPagination({
                current: response.data.currentPage,
                pageSize: response.data.perPage,
                total: response.data.totalItems
            });
        } catch (error) {
            message.error(error.message || 'Không thể tải danh sách tag');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleTableChange = (pagination) => {
        fetchTags(pagination.current, pagination.pageSize, searchText);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        fetchTags(1, pagination.pageSize, value);
    };

    const handleDelete = (tag) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa tag "${tag.name}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await tagService.deleteTag(tag._id);
                    message.success('Xóa tag thành công!');
                    fetchTags(pagination.current, pagination.pageSize, searchText);
                } catch (error) {
                    message.error(error.message || 'Có lỗi xảy ra khi xóa tag');
                }
            }
        });
    };

    const columns = [
        {
            title: 'Tên tag',
            dataIndex: 'name',
            key: 'name',
            sorter: true
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`status-badge ${status}`}>
                    {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
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
                        onClick={() => navigate(`/admin/tags/edit/${record._id}`)}
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="tag-management">
            <Card className="tag-card">
                <div className="header">
                    <h1>Quản lý tag</h1>
                    <Space>
                        <Input
                            placeholder="Tìm kiếm tag..."
                            prefix={<SearchOutlined />}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ width: 200 }}
                        />
                        <Button
                            type="primary"
                            onClick={() => navigate('/admin/tags/add')}
                        >
                            Thêm tag
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={tags}
                    rowKey="_id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};

export default TagManagement; 