import React from 'react';
import { Table, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mockTags } from '../../../services/mockData';
import './TagManagement.scss';

const TagManagement = () => {
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Tên tag',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
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

    const handleDelete = (tag) => {
        // You can keep the Modal.confirm logic here if you want
        // Or implement a separate delete confirmation page
        // For now, just a mock
        alert(`Xóa tag: ${tag.name}`);
    };

    return (
        <div className="tag-management">
            <div className="header">
                <h1>Quản lý tag</h1>
                <Button type="primary" onClick={() => navigate('/admin/tags/add')}>
                    Thêm tag
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={mockTags}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default TagManagement; 