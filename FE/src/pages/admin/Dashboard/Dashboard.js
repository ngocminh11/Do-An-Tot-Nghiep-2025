import React from 'react';
import { Row, Col, Card, Statistic, Table } from 'antd';
import {
    UserOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import './Dashboard.scss';

const Dashboard = () => {
    // Mock data for statistics
    const statistics = [
        {
            title: 'Total Users',
            value: 1234,
            icon: <UserOutlined />,
            color: '#1890ff',
        },
        {
            title: 'Total Products',
            value: 567,
            icon: <ShoppingOutlined />,
            color: '#52c41a',
        },
        {
            title: 'Total Orders',
            value: 890,
            icon: <ShoppingCartOutlined />,
            color: '#faad14',
        },
        {
            title: 'Total Revenue',
            value: '$45,678',
            icon: <DollarOutlined />,
            color: '#f5222d',
        },
    ];

    // Mock data for recent orders
    const recentOrders = [
        {
            key: '1',
            orderId: 'ORD001',
            customer: 'John Doe',
            product: 'Product A',
            amount: '$120',
            status: 'Completed',
        },
        {
            key: '2',
            orderId: 'ORD002',
            customer: 'Jane Smith',
            product: 'Product B',
            amount: '$85',
            status: 'Processing',
        },
        {
            key: '3',
            orderId: 'ORD003',
            customer: 'Mike Johnson',
            product: 'Product C',
            amount: '$200',
            status: 'Pending',
        },
    ];

    const orderColumns = [
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`status-${status.toLowerCase()}`}>{status}</span>
            ),
        },
    ];

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <Row gutter={[16, 16]}>
                {statistics.map((stat, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.icon}
                                valueStyle={{ color: stat.color }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24}>
                    <Card title="Recent Orders">
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