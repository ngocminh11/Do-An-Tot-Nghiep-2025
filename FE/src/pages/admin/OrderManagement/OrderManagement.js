import React, { useState } from 'react';
import { Table, Tag, Button, Space, Modal, Descriptions } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { mockOrders } from '../../../services/mockData';
import './OrderManagement.scss';

const OrderManagement = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: '_id',
        },
        {
            title: 'Khách hàng',
            dataIndex: ['shippingInformation', 'recipientName'],
            key: 'customer',
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalAmount',
            key: 'amount',
            render: (amount) => `${amount.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => {
                const statusColors = {
                    pending: 'warning',
                    paid: 'success',
                    failed: 'error',
                    refunded: 'default'
                };
                return <Tag color={statusColors[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
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
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewOrder(record)}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    return (
        <div className="order-management">
            <div className="header">
                <h1>Quản lý đơn hàng</h1>
            </div>

            <Table
                columns={columns}
                dataSource={mockOrders}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
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
                            {selectedOrder._id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">
                            {selectedOrder.shippingInformation.recipientName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {selectedOrder.shippingInformation.phoneNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={2}>
                            {selectedOrder.shippingInformation.address}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán">
                            {selectedOrder.paymentMethod}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái thanh toán">
                            <Tag color={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'}>
                                {selectedOrder.paymentStatus}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền">
                            {selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã giảm giá">
                            {selectedOrder.discountCodeUsed || 'Không có'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú" span={2}>
                            {selectedOrder.customerNote || 'Không có'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default OrderManagement; 