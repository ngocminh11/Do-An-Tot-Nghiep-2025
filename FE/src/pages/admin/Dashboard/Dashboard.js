import React from 'react';
import { Row, Col, Card, Statistic, Table, Progress } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import './Dashboard.scss';

const Dashboard = () => {
  // Enhanced statistics with growth rates
  const statistics = [
    {
      title: 'Total Users',
      value: 1234,
      growth: 12.5,
      icon: <UserOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Total Products',
      value: 567,
      growth: 8.3,
      icon: <ShoppingOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Total Orders',
      value: 890,
      growth: -2.1,
      icon: <ShoppingCartOutlined />,
      color: '#faad14',
    },
    {
      title: 'Total Revenue',
      value: 45678,
      prefix: '$',
      growth: 15.7,
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

  // Category distribution data
  const categoryData = [
    { type: 'Skincare', value: 35 },
    { type: 'Makeup', value: 25 },
    { type: 'Fragrance', value: 20 },
    { type: 'Haircare', value: 15 },
    { type: 'Others', value: 5 },
  ];

  // Order status distribution
  const orderStatusData = [
    { status: 'Completed', count: 450 },
    { status: 'Processing', count: 200 },
    { status: 'Pending', count: 150 },
    { status: 'Cancelled', count: 50 },
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
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
      },
    },
  };

  const pieConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    legend: {
      position: 'bottom',
    },
    interactions: [{ type: 'element-active' }],
  };

  // Updated mock recent orders
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
            <Card hoverable className="stat-card">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix || stat.icon}
                valueStyle={{ color: stat.color }}
              />
              <div className="growth-rate">
                {stat.growth > 0 ? (
                  <RiseOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <FallOutlined style={{ color: '#f5222d' }} />
                )}
                <span style={{ color: stat.growth > 0 ? '#52c41a' : '#f5222d' }}>
                  {Math.abs(stat.growth)}%
                </span>
                <span className="growth-label">vs last month</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="Monthly Revenue" className="chart-card">
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Category Distribution" className="chart-card">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="Order Status Distribution" className="chart-card">
            {orderStatusData.map((item) => (
              <div key={item.status} className="status-progress">
                <div className="status-header">
                  <span>{item.status}</span>
                  <span>{item.count} orders</span>
                </div>
                <Progress
                  percent={Math.round((item.count / 850) * 100)}
                  showInfo={false}
                  strokeColor={
                    item.status === 'Completed'
                      ? '#52c41a'
                      : item.status === 'Processing'
                        ? '#1890ff'
                        : item.status === 'Pending'
                          ? '#faad14'
                          : '#f5222d'
                  }
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Recent Orders" className="table-card">
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