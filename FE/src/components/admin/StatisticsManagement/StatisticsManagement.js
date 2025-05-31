import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, DatePicker } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { analyticsAPI } from '../../../services/api';

const { RangePicker } = DatePicker;

const StatisticsManagement = () => {
    const [loading, setLoading] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [productStats, setProductStats] = useState([]);
    const [userLogs, setUserLogs] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [revenue, products, logs] = await Promise.all([
                analyticsAPI.getRevenueReports(),
                analyticsAPI.getProductStats(),
                analyticsAPI.getUserLogs(),
            ]);
            setRevenueData(revenue);
            setProductStats(products);
            setUserLogs(logs);
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const revenueColumns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => `$${value.toFixed(2)}`,
        },
        {
            title: 'Orders',
            dataIndex: 'orders',
            key: 'orders',
        },
    ];

    const productColumns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Sales',
            dataIndex: 'sales',
            key: 'sales',
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => `$${value.toFixed(2)}`,
        },
    ];

    const calculateTotalRevenue = () => {
        return revenueData.reduce((sum, item) => sum + item.revenue, 0);
    };

    const calculateTotalOrders = () => {
        return revenueData.reduce((sum, item) => sum + item.orders, 0);
    };

    const calculateAverageOrderValue = () => {
        const totalRevenue = calculateTotalRevenue();
        const totalOrders = calculateTotalOrders();
        return totalOrders > 0 ? totalRevenue / totalOrders : 0;
    };

    return (
        <div className="statistics-management">
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={calculateTotalRevenue()}
                            precision={2}
                            prefix="$"
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={calculateTotalOrders()}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Average Order Value"
                            value={calculateAverageOrderValue()}
                            precision={2}
                            prefix="$"
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card title="Revenue Overview">
                        <RangePicker style={{ marginBottom: 16 }} />
                        <Table
                            columns={revenueColumns}
                            dataSource={revenueData}
                            loading={loading}
                            rowKey="date"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card title="Top Selling Products">
                        <Table
                            columns={productColumns}
                            dataSource={productStats}
                            loading={loading}
                            rowKey="name"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StatisticsManagement; 