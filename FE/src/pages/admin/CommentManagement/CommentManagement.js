import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    Card,
    Row,
    Col,
    Statistic,
    message,
    Popconfirm,
    Tooltip,
    Tag,
    Rate,
    Avatar
} from 'antd';
import {
    DeleteOutlined,
    DownloadOutlined,
    ReloadOutlined,
    SearchOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    MessageOutlined
} from '@ant-design/icons';
import commentService from '../../../services/commentService';
import './CommentManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

const CommentManagement = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [replyForm] = Form.useForm();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        productId: ''
    });
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchComments();
        fetchStats();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters
            };
            const response = await commentService.getAllComments(params);
            setComments(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.totalItems || 0
            }));
        } catch (error) {
            message.error('Không thể tải danh sách bình luận');
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await commentService.getCommentStats();
            setStats(response);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleViewComment = (comment) => {
        setSelectedComment(comment);
        setIsModalVisible(true);
    };

    const handleReplyComment = (comment) => {
        setSelectedComment(comment);
        replyForm.resetFields();
        setReplyModalVisible(true);
    };

    const handleDeleteComment = async (id) => {
        try {
            await commentService.deleteComment(id);
            message.success('Xóa bình luận thành công');
            fetchComments();
        } catch (error) {
            message.error('Không thể xóa bình luận');
        }
    };

    const handleApproveComment = async (id, status) => {
        try {
            await commentService.approveComment(id, status);
            message.success(`Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} bình luận`);
            fetchComments();
        } catch (error) {
            message.error('Không thể cập nhật trạng thái bình luận');
        }
    };

    const handleSubmitReply = async (values) => {
        try {
            await commentService.replyToComment(selectedComment._id, values);
            message.success('Trả lời bình luận thành công');
            setReplyModalVisible(false);
            fetchComments();
        } catch (error) {
            message.error('Không thể trả lời bình luận');
        }
    };

    const handleExportComments = async () => {
        try {
            const blob = await commentService.exportComments(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `comments_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            message.success('Xuất file thành công');
        } catch (error) {
            message.error('Không thể xuất file');
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            dataIndex: ['user', 'fullName'],
            key: 'user',
            width: 150,
            render: (name, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar size="small" style={{ marginRight: 8 }}>
                        {name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <span>{name}</span>
                </div>
            )
        },
        {
            title: 'Sản phẩm',
            dataIndex: ['product', 'basicInformation', 'productName'],
            key: 'product',
            width: 200,
            ellipsis: true
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            render: (rating) => <Rate disabled defaultValue={rating} />
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            width: 300,
            ellipsis: true,
            render: (content) => (
                <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {content}
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const statusConfig = {
                    'pending': { color: 'warning', text: 'Chờ duyệt' },
                    'approved': { color: 'success', text: 'Đã duyệt' },
                    'rejected': { color: 'error', text: 'Từ chối' }
                };
                const config = statusConfig[status] || { color: 'default', text: status };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewComment(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Trả lời">
                        <Button
                            icon={<MessageOutlined />}
                            size="small"
                            onClick={() => handleReplyComment(record)}
                        />
                    </Tooltip>
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Phê duyệt">
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    size="small"
                                    onClick={() => handleApproveComment(record._id, 'approved')}
                                />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button
                                    danger
                                    icon={<CloseOutlined />}
                                    size="small"
                                    onClick={() => handleApproveComment(record._id, 'rejected')}
                                />
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc muốn xóa bình luận này?"
                            onConfirm={() => handleDeleteComment(record._id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleTableChange = (paginationInfo) => {
        setPagination(prev => ({
            ...prev,
            current: paginationInfo.current,
            pageSize: paginationInfo.pageSize
        }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    return (
        <div className="comment-management">
            <div className="header">
                <h1>Quản lý bình luận</h1>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchComments}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExportComments}
                    >
                        Xuất Excel
                    </Button>
                </Space>
            </div>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng bình luận"
                            value={stats.totalComments || 0}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Chờ duyệt"
                            value={stats.pendingComments || 0}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã duyệt"
                            value={stats.approvedComments || 0}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đánh giá trung bình"
                            value={stats.averageRating || 0}
                            precision={1}
                            suffix="/5"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col span={8}>
                        <Input
                            placeholder="Tìm kiếm theo nội dung bình luận..."
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            value={filters.status}
                            onChange={(value) => handleFilterChange('status', value)}
                            style={{ width: '100%' }}
                        >
                            <Option value="pending">Chờ duyệt</Option>
                            <Option value="approved">Đã duyệt</Option>
                            <Option value="rejected">Từ chối</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={comments}
                rowKey="_id"
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} bình luận`
                }}
                onChange={handleTableChange}
                loading={loading}
                scroll={{ x: 1400 }}
            />

            {/* Comment Detail Modal */}
            <Modal
                title="Chi tiết bình luận"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedComment && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Người dùng:</strong> {selectedComment.user?.fullName}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Sản phẩm:</strong> {selectedComment.product?.basicInformation?.productName}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Đánh giá:</strong> <Rate disabled defaultValue={selectedComment.rating} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Nội dung:</strong>
                            <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                                {selectedComment.content}
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Trạng thái:</strong>
                            <Tag color={selectedComment.status === 'approved' ? 'green' :
                                selectedComment.status === 'rejected' ? 'red' : 'orange'}>
                                {selectedComment.status === 'approved' ? 'Đã duyệt' :
                                    selectedComment.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                            </Tag>
                        </div>
                        <div>
                            <strong>Ngày tạo:</strong> {new Date(selectedComment.createdAt).toLocaleString('vi-VN')}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reply Modal */}
            <Modal
                title="Trả lời bình luận"
                open={replyModalVisible}
                onCancel={() => setReplyModalVisible(false)}
                footer={null}
                width={500}
            >
                <Form
                    form={replyForm}
                    layout="vertical"
                    onFinish={handleSubmitReply}
                >
                    <Form.Item
                        name="replyContent"
                        label="Nội dung trả lời"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung trả lời!' }]}
                    >
                        <TextArea rows={4} placeholder="Nhập nội dung trả lời..." />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Gửi trả lời
                            </Button>
                            <Button onClick={() => setReplyModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CommentManagement; 