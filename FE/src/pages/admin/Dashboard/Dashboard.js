import React from 'react';
import { Row, Col, Card, Statistic, Table } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import './Dashboard.scss';

const Dashboard = () => {
  // Expanded statistics
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
      value: 45678,
      prefix: '$',
      icon: <DollarOutlined />,
      color: '#f5222d',
    },
  ];

  // Mock monthly revenue data for a line chart
  const revenueData = [
    { month: 'Jan', revenue: 3000 },
    { month: 'Feb', revenue: 4500 },
    { month: 'Mar', revenue: 3200 },
    { month: 'Apr', revenue: 5000 },
    { month: 'May', revenue: 7000 },
    { month: 'Jun', revenue: 6000 },
    { month: 'Jul', revenue: 7500 },
    { month: 'Aug', revenue: 8000 },
    { month: 'Sep', revenue: 6500 },
    { month: 'Oct', revenue: 7000 },
    { month: 'Nov', revenue: 7200 },
    { month: 'Dec', revenue: 9000 },
  ];

  const lineConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'revenue',
    smooth: true,
    xAxis: { title: { text: 'Month' } },
    yAxis: { title: { text: 'Revenue (USD)' } },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
  };

  // Updated mock recent orders specifically for cosmetics
  const recentOrders = [
    {
      key: '1',
      orderId: 'ORD001',
      customer: 'John Doe',
      product: 'Lipstick Matte',
      amount: '$120',
      status: 'Completed',
      date: '2025-05-25',
    },
    {
      key: '2',
      orderId: 'ORD002',
      customer: 'Jane Smith',
      product: 'Fluid Foundation',
      amount: '$85',
      status: 'Processing',
      date: '2025-05-26',
    },
    {
      key: '3',
      orderId: 'ORD003',
      customer: 'Mike Johnson',
      product: 'Vitamin C Serum',
      amount: '$200',
      status: 'Pending',
      date: '2025-05-27',
    },
  ];

  const orderColumns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Product', dataIndex: 'product', key: 'product' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status-${status.toLowerCase()}`}>{status}</span>
      ),
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
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
                prefix={stat.prefix || stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="Monthly Revenue">
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
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