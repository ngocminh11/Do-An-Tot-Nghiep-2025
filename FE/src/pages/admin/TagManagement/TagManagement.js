import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Modal, message, Input, Row, Col, Tag as AntTag } from 'antd';
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
            setTags(response.data);
            setPagination({
                current: response.currentPage,
                pageSize: response.perPage,
                total: response.totalItems
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
                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                    {tags.length === 0 ? (
                        <Col span={24} style={{ textAlign: 'center', color: '#888' }}>Không có tag nào.</Col>
                    ) : (
                        tags.map(tag => (
                            <Col xs={24} sm={12} md={8} lg={6} key={tag._id}>
                                <Card
                                    className="tag-menu-card"
                                    actions={[
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            onClick={() => navigate(`/admin/tags/edit/${tag._id}`)}
                                            size="small"
                                        >Sửa</Button>,
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDelete(tag)}
                                            size="small"
                                        >Xóa</Button>
                                    ]}
                                >
                                    <div style={{ fontWeight: 'bold', fontSize: 18 }}>{tag.name}</div>
                                    <div style={{ color: '#888', margin: '8px 0' }}>{tag.description || 'Không mô tả'}</div>
                                    <div style={{ marginBottom: 8 }}>
                                        <AntTag color={tag.status === 'active' ? 'green' : 'red'}>
                                            {tag.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                        </AntTag>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#aaa' }}>Ngày tạo: {new Date(tag.createdAt).toLocaleDateString('vi-VN')}</div>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            </Card>
        </div>
    );
};

export default TagManagement; 