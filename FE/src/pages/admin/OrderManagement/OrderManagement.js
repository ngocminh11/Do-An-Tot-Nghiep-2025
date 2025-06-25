import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Button,
    Space,
    Modal,
    Descriptions,
    Select,
    Input,
    DatePicker,
    Card,
    Row,
    Col,
    Statistic,
    message,
    Spin,
    Popconfirm,
    Tooltip
} from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ReloadOutlined,
    SearchOutlined
} from '@ant-design/icons';
import orderService from '../../../services/orderService';
import './OrderManagement.scss';

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        search: '',
        dateRange: null
    });
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters
            };
            const response = await orderService.getAllOrders(params);
            setOrders(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0
            }));
        } catch (error) {
            message.error('Không thể tải danh sách đơn hàng');
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await orderService.getOrderStats();
            setStats(response);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            message.success('Cập nhật trạng thái thành công');
            fetchOrders();
        } catch (error) {
            message.error('Không thể cập nhật trạng thái');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            await orderService.deleteOrder(orderId);
            message.success('Xóa đơn hàng thành công');
            fetchOrders();
        } catch (error) {
            message.error('Không thể xóa đơn hàng');
        }
    };

    const handleExportOrders = async () => {
        try {
            const blob = await orderService.exportOrders(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            message.success('Xuất file thành công');
        } catch (error) {
            message.error('Không thể xuất file');
        }
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'idOrder',
            key: 'idOrder',
            width: 120,
        },
        {
            title: 'Khách hàng',
            dataIndex: ['user', 'fullName'],
            key: 'customer',
            width: 150,
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalAmount',
            key: 'amount',
            width: 120,
            render: (amount) => `${amount?.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            width: 140,
            render: (status) => {
                const statusColors = {
                    'Chưa thanh toán': 'warning',
                    'Đã thanh toán': 'success',
                    'Đã hoàn tiền': 'default'
                };
                return <Tag color={statusColors[status] || 'default'}>{status}</Tag>;
            }
        },
        {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 120 }}
                    onChange={(value) => handleStatusChange(record._id, value)}
                >
                    <Option value="Chờ xác nhận">Chờ xác nhận</Option>
                    <Option value="Xác nhận">Xác nhận</Option>
                    <Option value="Đang giao hàng">Đang giao hàng</Option>
                    <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                    <Option value="Hủy">Hủy</Option>
                </Select>
            )
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewOrder(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa đơn hàng">
                        <Popconfirm
                            title="Bạn có chắc muốn xóa đơn hàng này?"
                            onConfirm={() => handleDeleteOrder(record._id)}
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
        <div className="order-management">
            <div className="header">
                <h1>Quản lý đơn hàng</h1>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchOrders}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExportOrders}
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
                            title="Tổng đơn hàng"
                            value={stats.totalOrders || 0}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đơn hàng mới"
                            value={stats.pendingOrders || 0}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã hoàn thành"
                            value={stats.completedOrders || 0}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu"
                            value={stats.totalRevenue || 0}
                            suffix="VNĐ"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Input
                            placeholder="Tìm kiếm theo mã đơn hàng..."
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái đơn hàng"
                            allowClear
                            value={filters.status}
                            onChange={(value) => handleFilterChange('status', value)}
                            style={{ width: '100%' }}
                        >
                            <Option value="Chờ xác nhận">Chờ xác nhận</Option>
                            <Option value="Xác nhận">Xác nhận</Option>
                            <Option value="Đang giao hàng">Đang giao hàng</Option>
                            <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                            <Option value="Hủy">Hủy</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái thanh toán"
                            allowClear
                            value={filters.paymentStatus}
                            onChange={(value) => handleFilterChange('paymentStatus', value)}
                            style={{ width: '100%' }}
                        >
                            <Option value="Chưa thanh toán">Chưa thanh toán</Option>
                            <Option value="Đã thanh toán">Đã thanh toán</Option>
                            <Option value="Đã hoàn tiền">Đã hoàn tiền</Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <RangePicker
                            placeholder={['Từ ngày', 'Đến ngày']}
                            value={filters.dateRange}
                            onChange={(dates) => handleFilterChange('dateRange', dates)}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} đơn hàng`
                }}
                onChange={handleTableChange}
                loading={loading}
                scroll={{ x: 1200 }}
            />

            <Modal
                title="Chi tiết đơn hàng"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Mã đơn hàng" span={2}>
                            {selectedOrder.idOrder}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">
                            {selectedOrder.user?.fullName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {selectedOrder.user?.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán">
                            {selectedOrder.paymentMethod}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái thanh toán">
                            <Tag color={selectedOrder.paymentStatus === 'Đã thanh toán' ? 'success' : 'warning'}>
                                {selectedOrder.paymentStatus}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền">
                            {selectedOrder.totalAmount?.toLocaleString('vi-VN')} VNĐ
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã giảm giá">
                            {selectedOrder.promotionCode || 'Không có'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú" span={2}>
                            {selectedOrder.notes || 'Không có'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sản phẩm" span={2}>
                            {selectedOrder.items?.map((item, index) => (
                                <div key={index} style={{ marginBottom: 8 }}>
                                    <strong>{item.productName}</strong> - Số lượng: {item.quantity} -
                                    Giá: {item.price?.toLocaleString('vi-VN')} VNĐ
                                </div>
                            ))}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default OrderManagement; 