import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Button } from 'antd';
import {
    UserOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    ShoppingOutlined,
    GiftOutlined,
    CommentOutlined,
    AppstoreOutlined,
    TagsOutlined
} from '@ant-design/icons';
import { mockOrders, mockProducts, mockUsers, mockRevenueReports } from '../../../services/mockData';
import { useNavigate } from 'react-router-dom';
import './Dashboard.scss';

const Dashboard = () => {
    const navigate = useNavigate();

    // Shortcut cards config
    const adminShortcuts = [
        {
            key: 'orders',
            title: 'Quản lý đơn hàng',
            icon: <ShoppingCartOutlined style={{ fontSize: 28, color: '#faad14' }} />, 
            path: '/admin/orders',
        },
        {
            key: 'promotion',
            title: 'Quản lý khuyến mãi',
            icon: <GiftOutlined style={{ fontSize: 28, color: '#722ed1' }} />, 
            path: '/admin/promotion',
        },
        {
            key: 'comments',
            title: 'Quản lý bình luận',
            icon: <CommentOutlined style={{ fontSize: 28, color: '#13c2c2' }} />, 
            path: '/admin/comments',
        },
        {
            key: 'products',
            title: 'Quản lý sản phẩm',
            icon: <ShoppingOutlined style={{ fontSize: 28, color: '#52c41a' }} />, 
            path: '/admin/products',
        },
        {
            key: 'categories',
            title: 'Quản lý danh mục',
            icon: <AppstoreOutlined style={{ fontSize: 28, color: '#1890ff' }} />, 
            path: '/admin/categories',
        },
        {
            key: 'tags',
            title: 'Quản lý tag',
            icon: <TagsOutlined style={{ fontSize: 28, color: '#eb2f96' }} />, 
            path: '/admin/tags',
        },
        {
            key: 'users',
            title: 'Quản lý người dùng',
            icon: <UserOutlined style={{ fontSize: 28, color: '#f5222d' }} />, 
            path: '/admin/users',
        },
    ];

    // Calculate statistics
    const totalUsers = mockUsers.length;
    const totalProducts = mockProducts.length;
    const totalOrders = mockOrders.length;
    const totalRevenue = mockRevenueReports.reduce((sum, report) => sum + report.dailyRevenue, 0);

    // Prepare recent orders data
    const recentOrders = mockOrders.slice(0, 5).map(order => ({
        key: order._id,
        orderId: order._id,
        customer: order.shippingInformation.recipientName,
        amount: order.totalAmount,
        status: order.orderStatus,
        date: new Date(order.createdAt).toLocaleDateString()
    }));

    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderId',
            key: 'orderId'
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer'
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${amount.toLocaleString('vi-VN')} VNĐ`
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusColors = {
                    pending_confirmation: 'warning',
                    confirmed: 'processing',
                    preparing_shipment: 'processing',
                    shipped: 'info',
                    delivered: 'success',
                    cancelled: 'error',
                    returned: 'error'
                };
                return <Tag color={statusColors[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date'
        }
    ];

    return (
        <div className="admin-dashboard">
            <h1>Dashboard</h1>

            {/* Shortcut cards */}
            <Row gutter={[16, 16]} className="admin-shortcuts-row" style={{ marginBottom: 24 }}>
                {adminShortcuts.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
                        <Card
                            hoverable
                            className="admin-shortcut-card"
                            onClick={() => navigate(item.path)}
                            style={{ cursor: 'pointer', textAlign: 'center' }}
                        >
                            <div style={{ marginBottom: 8 }}>{item.icon}</div>
                            <div style={{ fontWeight: 600 }}>{item.title}</div>
                            <Button type="link" style={{ marginTop: 8 }} onClick={e => { e.stopPropagation(); navigate(item.path); }}>
                                Truy cập
                            </Button>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} className="statistics-row">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số người dùng"
                            value={totalUsers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số sản phẩm"
                            value={totalProducts}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số đơn hàng"
                            value={totalOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={totalRevenue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="recent-orders-row">
                <Col span={24}>
                    <Card title="Đơn hàng gần đây">
                        <Table
                            columns={orderColumns}
                            dataSource={recentOrders}
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard; 