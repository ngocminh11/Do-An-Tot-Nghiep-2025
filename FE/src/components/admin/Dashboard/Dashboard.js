import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import {
    UserOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import { mockOrders, mockProducts, mockUsers, mockRevenueReports } from '../../../services/mockData';
import './Dashboard.scss';

const Dashboard = () => {
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