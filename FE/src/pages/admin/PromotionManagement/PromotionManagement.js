import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Switch,
    Card,
    Row,
    Col,
    Statistic,
    message,
    Popconfirm,
    Tooltip,
    Tag,
    InputNumber
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ReloadOutlined,
    SearchOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import promotionService from '../../../services/PromotionService';
import './PromotionManagement.scss';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const PromotionManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });
    const [stats, setStats] = useState({});

    // Check if user has permission to access this page
    useEffect(() => {
        if (!user) {
            navigate('/'); // Không redirect sang /login, về trang chủ
            return;
        }
        
        const allowedRoles = ['Quản Lý Kho', 'Quản Lý Chính', 'Nhân Viên'];
        if (!allowedRoles.includes(user.role)) {
            message.error('Bạn không có quyền truy cập trang này');
            navigate('/admin');
            return;
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user && ['Quản Lý Kho', 'Quản Lý Chính', 'Nhân Viên'].includes(user.role)) {
            fetchPromotions();
            fetchStats();
        }
    }, [pagination.current, pagination.pageSize, filters, user]);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters
            };
            const response = await promotionService.getAllPromotions(params);
            setPromotions(response.data?.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.totalItems || 0,
                current: response.currentPage || 1,
                pageSize: response.perPage || 10
            }));
        } catch (error) {
            message.error('Không thể tải danh sách khuyến mãi');
            console.error('Error fetching promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const params = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (typeof value === 'string' && value.trim() !== '') params[key] = value;
                if (typeof value === 'number') params[key] = value;
            });
            const response = await promotionService.getPromotionStats(params);
            setStats(response);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleCreatePromotion = () => {
        if (!['Quản Lý Kho', 'Quản Lý Chính'].includes(user.role)) {
            message.error('Bạn không có quyền tạo khuyến mãi');
            return;
        }
        setEditingPromotion(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditPromotion = (promotion) => {
        if (!['Quản Lý Kho', 'Quản Lý Chính'].includes(user.role)) {
            message.error('Bạn không có quyền chỉnh sửa khuyến mãi');
            return;
        }
        setEditingPromotion(promotion);
        form.setFieldsValue({
            ...promotion,
            dateRange: [promotion.startDate ? new Date(promotion.startDate) : null,
            promotion.endDate ? new Date(promotion.endDate) : null]
        });
        setModalVisible(true);
    };

    const handleDeletePromotion = async (id) => {
        if (!['Quản Lý Kho', 'Quản Lý Chính'].includes(user.role)) {
            message.error('Bạn không có quyền xóa khuyến mãi');
            return;
        }
        try {
            await promotionService.deletePromotion(id);
            message.success('Xóa khuyến mãi thành công');
            fetchPromotions();
        } catch (error) {
            message.error('Không thể xóa khuyến mãi');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (!['Quản Lý Kho', 'Quản Lý Chính'].includes(user.role)) {
            message.error('Bạn không có quyền cập nhật trạng thái khuyến mãi');
            return;
        }
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await promotionService.togglePromotionStatus(id, newStatus);
            message.success('Cập nhật trạng thái thành công');
            fetchPromotions();
        } catch (error) {
            message.error('Không thể cập nhật trạng thái');
        }
    };

    const handleExportPromotions = async () => {
        try {
            const blob = await promotionService.exportPromotions(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `promotions_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            message.success('Xuất file thành công');
        } catch (error) {
            message.error('Không thể xuất file');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const [startDate, endDate] = values.dateRange || [];
            const promotionData = {
                ...values,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString()
            };

            if (editingPromotion) {
                await promotionService.updatePromotion(editingPromotion._id, promotionData);
                message.success('Cập nhật khuyến mãi thành công');
            } else {
                await promotionService.createPromotion(promotionData);
                message.success('Tạo khuyến mãi thành công');
            }

            setModalVisible(false);
            fetchPromotions();
        } catch (error) {
            message.error('Không thể lưu khuyến mãi');
        }
    };

    const columns = [
        {
            title: 'Mã khuyến mãi',
            dataIndex: 'code',
            key: 'code',
            width: 120,
        },
        {
            title: 'Tên khuyến mãi',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: 'Loại',
            dataIndex: 'discountType',
            key: 'discountType',
            width: 100,
            render: (type) => {
                const typeLabels = {
                    'percentage': 'Phần trăm',
                    'fixed': 'Số tiền cố định'
                };
                return typeLabels[type] || type;
            }
        },
        {
            title: 'Giá trị',
            dataIndex: 'discountValue',
            key: 'discountValue',
            width: 100,
            render: (value, record) => {
                if (record.discountType === 'percentage') {
                    return `${value}%`;
                }
                return `${value?.toLocaleString('vi-VN')} VNĐ`;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            )
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 120,
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 120,
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
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
                            onClick={() => handleEditPromotion(record)}
                        />
                    </Tooltip>
                    {['Quản Lý Kho', 'Quản Lý Chính'].includes(user?.role) && (
                        <>
                            <Tooltip title="Chỉnh sửa">
                                <Button
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => handleEditPromotion(record)}
                                />
                            </Tooltip>
                            <Tooltip title={record.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                <Switch
                                    checked={record.status === 'active'}
                                    onChange={() => handleToggleStatus(record._id, record.status)}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="Xóa">
                                <Popconfirm
                                    title="Bạn có chắc muốn xóa khuyến mãi này?"
                                    onConfirm={() => handleDeletePromotion(record._id)}
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
                        </>
                    )}
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
        <div className="promotion-management">
            <div className="header">
                <h1>Quản lý khuyến mãi</h1>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchPromotions}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                    {['Quản Lý Kho', 'Quản Lý Chính'].includes(user?.role) && (
                        <>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreatePromotion}
                            >
                                Thêm khuyến mãi
                            </Button>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={handleExportPromotions}
                            >
                                Xuất Excel
                            </Button>
                        </>
                    )}
                </Space>
            </div>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng khuyến mãi"
                            value={stats.total || 0}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.active || 0}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Không hoạt động"
                            value={stats.inactive || 0}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã hết hạn"
                            value={stats.expired || 0}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col span={8}>
                        <Input
                            placeholder="Tìm kiếm theo mã hoặc tên khuyến mãi..."
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
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Không hoạt động</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={promotions}
                rowKey="_id"
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} khuyến mãi`
                }}
                onChange={handleTableChange}
                loading={loading}
                scroll={{ x: 1200 }}
            />

            <Modal
                title={editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Mã khuyến mãi"
                                rules={[{ required: true, message: 'Vui lòng nhập mã khuyến mãi!' }]}
                            >
                                <Input placeholder="VD: SUMMER2024" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên khuyến mãi"
                                rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi!' }]}
                            >
                                <Input placeholder="Tên khuyến mãi" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="discountType"
                                label="Loại giảm giá"
                                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}
                            >
                                <Select placeholder="Chọn loại giảm giá">
                                    <Option value="percentage">Phần trăm (%)</Option>
                                    <Option value="fixed">Số tiền cố định (VNĐ)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="discountValue"
                                label="Giá trị giảm"
                                rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm!' }]}
                            >
                                <InputNumber
                                    placeholder="Giá trị"
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => {
                                        const discountType = form.getFieldValue('discountType');
                                        return discountType === 'percentage' ? `${value}%` : `${value}`;
                                    }}
                                    parser={(value) => value.replace(/[^\d]/g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="minOrderValue"
                                label="Giá trị đơn hàng tối thiểu"
                            >
                                <InputNumber
                                    placeholder="0"
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="maxDiscountAmount"
                                label="Giảm giá tối đa"
                            >
                                <InputNumber
                                    placeholder="Không giới hạn"
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian áp dụng"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng!' }]}
                    >
                        <RangePicker
                            style={{ width: '100%' }}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={3} placeholder="Mô tả khuyến mãi..." />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        initialValue="active"
                    >
                        <Select>
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Không hoạt động</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingPromotion ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionManagement; 