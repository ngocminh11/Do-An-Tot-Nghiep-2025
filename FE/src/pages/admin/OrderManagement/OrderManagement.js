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
    Tooltip,
    List,
    Avatar,
    Checkbox,
    Form
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
    const [isPinModalVisible, setIsPinModalVisible] = useState(false);
    const [isShippingModalVisible, setIsShippingModalVisible] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState(null);
    const [pinForm] = Form.useForm();
    const [shippingForm] = Form.useForm();
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
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');

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
                total: response.total || 0,
                current: response.currentPage || 1,
                pageSize: response.perPage || 10
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
            // Loại bỏ các filter không hợp lệ, chỉ truyền string/số
            const params = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (typeof value === 'string' && value.trim() !== '') params[key] = value;
                if (typeof value === 'number') params[key] = value;
            });
            const response = await orderService.getOrderStats(params);
            setStats(response);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    // Hàm xác định các trường hợp cần mã PIN khi đổi trạng thái
    function isPinRequired(currentStatus, nextStatus) {
        // Điều chỉnh logic này cho đúng nghiệp vụ thực tế của bạn
        if (currentStatus === 'Xác nhận' && nextStatus === 'Chờ xác nhận') return true;
        if (currentStatus === 'Xác nhận' && nextStatus === 'Đang giao hàng') return true;
        if (currentStatus === 'Đang giao hàng' && nextStatus === 'Đã hoàn thành') return true;
        if (nextStatus === 'Hủy') return true;
        return false;
    }

    const handleStatusChange = async (orderId, newStatus, order) => {
        console.log('handleStatusChange called:', { orderId, newStatus, currentStatus: order.status });
        setPendingStatusChange({ orderId, newStatus, order });

        // Luôn hiển thị modal nhập PIN vì backend yêu cầu PIN cho tất cả thao tác
        console.log('Backend requires PIN for all status changes, showing modal');
        setIsPinModalVisible(true);
    };

    const handlePinSubmit = async (values) => {
        try {
            const { orderId, newStatus } = pendingStatusChange;
            console.log('Submitting PIN for order:', orderId, 'new status:', newStatus);
            
            await orderService.updateOrderStatus(orderId, {
                status: newStatus,
                pin: values.pin
            });
            
            message.success('Cập nhật trạng thái thành công');
            setIsPinModalVisible(false);
            pinForm.resetFields();
            setPendingStatusChange(null);
            fetchOrders();
        } catch (error) {
            console.log('PIN submit error:', error?.response?.data);
            const msg = error?.response?.data?.message?.toLowerCase() || '';
            
            if (msg.includes('pin') || msg.includes('không chính xác') || msg.includes('thiếu mã pin')) {
                message.error('Mã PIN không đúng hoặc thiếu. Vui lòng nhập lại!');
                // Không đóng modal, để user nhập lại
            } else {
                setIsPinModalVisible(false);
                message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
            }
        }
    };

    const handleShippingSubmit = async (values) => {
        try {
            const { orderId, newStatus } = pendingStatusChange;
            await orderService.updateOrderStatus(orderId, {
                status: newStatus,
                shippingInfo: values
            });
            message.success('Cập nhật trạng thái thành công');
            setIsShippingModalVisible(false);
            shippingForm.resetFields();
            setPendingStatusChange(null);
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

    const handleBulkStatusChange = async (status) => {
        if (!selectedOrderIds.length) return;
        setLoading(true);
        try {
            await Promise.all(selectedOrderIds.map(orderId => orderService.updateOrderStatus(orderId, { status })));
            message.success('Cập nhật trạng thái hàng loạt thành công');
            setSelectedOrderIds([]);
            setBulkStatus('');
            fetchOrders();
        } catch (error) {
            message.error('Không thể cập nhật trạng thái hàng loạt');
        } finally {
            setLoading(false);
        }
    };

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

    // Hàm lấy màu theo trạng thái đơn hàng
    const getOrderCardStyle = (status) => {
        switch (status) {
            case 'Chờ xác nhận':
                return { border: '2px solid #faad14', background: '#fffbe6' };
            case 'Xác nhận':
                return { border: '2px solid #1890ff', background: '#e6f7ff' };
            case 'Đang giao hàng':
                return { border: '2px solid #52c41a', background: '#f6ffed' };
            case 'Đã hoàn thành':
                return { border: '2px solid #3f8600', background: '#f0fff0' };
            case 'Hủy':
                return { border: '2px solid #ff4d4f', background: '#fff1f0' };
            default:
                return { border: '2px solid #d9d9d9', background: '#fff' };
        }
    };

    console.log('Component rendering, isPinModalVisible:', isPinModalVisible);
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
                    <Button 
                        type="dashed" 
                        onClick={() => {
                            console.log('Test PIN modal button clicked');
                            setIsPinModalVisible(true);
                            setPendingStatusChange({ orderId: 'test', newStatus: 'test', order: { status: 'test' } });
                        }}
                    >
                        Test Modal PIN
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

            {/* Bulk action select - Tạm thời ẩn vì cần PIN */}
            {/* <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Checkbox
                    checked={selectedOrderIds.length === orders.length && orders.length > 0}
                    indeterminate={selectedOrderIds.length > 0 && selectedOrderIds.length < orders.length}
                    onChange={e => {
                        if (e.target.checked) {
                            setSelectedOrderIds(orders.map(o => o._id));
                        } else {
                            setSelectedOrderIds([]);
                        }
                    }}
                >
                    Chọn tất cả
                </Checkbox>
                <Select
                    placeholder="Chọn trạng thái hàng loạt"
                    value={bulkStatus || undefined}
                    style={{ width: 200 }}
                    onChange={value => {
                        setBulkStatus(value);
                        handleBulkStatusChange(value);
                    }}
                    disabled={selectedOrderIds.length === 0}
                >
                    <Option value="Chờ xác nhận">Chờ xác nhận</Option>
                    <Option value="Xác nhận">Xác nhận</Option>
                    <Option value="Đang giao hàng">Đang giao hàng</Option>
                    <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                    <Option value="Hủy">Hủy</Option>
                </Select>
                {selectedOrderIds.length > 0 && <span>({selectedOrderIds.length} đơn được chọn)</span>}
            </div> */}

            {/* Danh sách đơn hàng dạng card chuyên nghiệp */}
            {console.log('orders FE render:', orders)}
            <Row gutter={[24, 24]}>
                {orders.map(order => (
                    <Col xs={24} sm={12} md={8} lg={6} key={order._id || order.idOrder} style={{ display: 'flex' }}>
                        <Card
                            className="order-card"
                            style={{ marginBottom: 16, width: '100%', minHeight: 320, display: 'flex', flexDirection: 'column', ...getOrderCardStyle(order.status) }}
                            actions={[
                                <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewOrder(order)}>
                                    Xem chi tiết
                                </Button>,
                                <Select
                                    value={order.status}
                                    style={{ width: 140 }}
                                    onChange={(value) => handleStatusChange(order._id, value, order)}
                                    dropdownMatchSelectWidth={false}
                                >
                                    <Option value="Chờ xác nhận">Chờ xác nhận</Option>
                                    <Option value="Xác nhận">Xác nhận</Option>
                                    <Option value="Đang giao hàng">Đang giao hàng</Option>
                                    <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                                    <Option value="Hủy">Hủy</Option>
                                </Select>,
                                <Popconfirm
                                    title="Bạn có chắc muốn xóa đơn hàng này?"
                                    onConfirm={() => handleDeleteOrder(order._id)}
                                    okText="Có"
                                    cancelText="Không"
                                >
                                    <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
                                </Popconfirm>
                            ]}
                        >
                            <Checkbox
                                checked={selectedOrderIds.includes(order._id)}
                                onChange={e => {
                                    if (e.target.checked) {
                                        setSelectedOrderIds(ids => [...ids, order._id]);
                                    } else {
                                        setSelectedOrderIds(ids => ids.filter(id => id !== order._id));
                                    }
                                }}
                                style={{ marginBottom: 8 }}
                            >
                                Chọn đơn này
                            </Checkbox>
                            <Card.Meta
                                avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{order.user?.fullName?.charAt(0) || 'U'}</Avatar>}
                                title={<span>Mã đơn: <b>{order.idOrder || order._id?.slice(-6)?.toUpperCase()}</b> - {order.user?.fullName}</span>}
                                description={
                                    <div>
                                        <div><b>Ngày đặt:</b> {(order.createdAt || order.updatedAt) ? new Date(order.createdAt || order.updatedAt).toLocaleDateString('vi-VN') : 'Không rõ'}</div>
                                        <div><b>Số tiền:</b> {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 0} VNĐ</div>
                                        <div><b>Trạng thái thanh toán:</b> <Tag color={order.paymentStatus === 'Đã thanh toán' ? 'success' : 'warning'}>{order.paymentStatus}</Tag></div>
                                        <div><b>Trạng thái đơn hàng:</b> {order.status}</div>
                                        <div><b>Sản phẩm:</b> {order.items?.map((item, idx) => (
                                            <span key={idx}>{item.productName} x{item.quantity}{idx < order.items.length - 1 ? ', ' : ''}</span>
                                        ))}</div>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

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
                        {selectedOrder.shippingInfo && (
                            <>
                                <Descriptions.Item label="Hãng vận chuyển">
                                    {selectedOrder.shippingInfo.carrier || 'Chưa có'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mã vận đơn">
                                    {selectedOrder.shippingInfo.trackingNumber || 'Chưa có'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên shipper">
                                    {selectedOrder.shippingInfo.shipperName || 'Chưa có'}
                                </Descriptions.Item>
                                <Descriptions.Item label="SĐT shipper">
                                    {selectedOrder.shippingInfo.shipperPhone || 'Chưa có'}
                                </Descriptions.Item>
                            </>
                        )}
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

            {/* Modal nhập PIN */}
            {console.log('Rendering PIN modal, isPinModalVisible:', isPinModalVisible)}
            <Modal
                title="Nhập mã PIN"
                open={isPinModalVisible}
                onCancel={() => {
                    console.log('PIN modal cancelled');
                    setIsPinModalVisible(false);
                    setPendingStatusChange(null);
                    pinForm.resetFields();
                }}
                footer={null}
                destroyOnClose={true}
                maskClosable={false}
                style={{ zIndex: 1000 }}
                maskStyle={{ zIndex: 999 }}
                centered
            >
                <Form form={pinForm} onFinish={handlePinSubmit} layout="vertical">
                    <Form.Item
                        label="Mã PIN"
                        name="pin"
                        rules={[{ required: true, message: 'Vui lòng nhập mã PIN!' }]}
                    >
                        <Input.Password placeholder="Nhập mã PIN để xác nhận" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Xác nhận
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal nhập thông tin shipping */}
            <Modal
                title="Thông tin giao hàng"
                open={isShippingModalVisible}
                onCancel={() => {
                    setIsShippingModalVisible(false);
                    setPendingStatusChange(null);
                    shippingForm.resetFields();
                }}
                footer={null}
            >
                <Form form={shippingForm} onFinish={handleShippingSubmit} layout="vertical">
                    <Form.Item
                        label="Hãng vận chuyển"
                        name="carrier"
                        rules={[{ required: true, message: 'Vui lòng nhập hãng vận chuyển!' }]}
                    >
                        <Input placeholder="VD: GHN, Viettel Post, Giao hàng nhanh..." />
                    </Form.Item>
                    <Form.Item
                        label="Mã vận đơn"
                        name="trackingNumber"
                        rules={[{ required: true, message: 'Vui lòng nhập mã vận đơn!' }]}
                    >
                        <Input placeholder="Nhập mã vận đơn" />
                    </Form.Item>
                    <Form.Item
                        label="Tên người giao hàng"
                        name="shipperName"
                    >
                        <Input placeholder="Tên shipper (nếu có)" />
                    </Form.Item>
                    <Form.Item
                        label="Số điện thoại shipper"
                        name="shipperPhone"
                    >
                        <Input placeholder="SĐT shipper (nếu có)" />
                    </Form.Item>
                    <Form.Item
                        label="Thông tin bổ sung"
                        name="extra"
                    >
                        <Input.TextArea placeholder="Thông tin bổ sung (nếu cần)" rows={3} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Xác nhận
                            </Button>
                            <Button onClick={() => {
                                setIsShippingModalVisible(false);
                                setPendingStatusChange(null);
                                shippingForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OrderManagement; 