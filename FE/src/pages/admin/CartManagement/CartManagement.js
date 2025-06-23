import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Space, Modal, List } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import cartService from '../../../services/cartService';

const CartManagement = () => {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCart, setSelectedCart] = useState(null);

    const fetchCarts = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await cartService.getAllCarts({ page, limit: pageSize });
            setCarts(response.data);
            setPagination({
                current: response.currentPage,
                pageSize: response.perPage,
                total: response.totalItems
            });
        } catch (error) {
            setCarts([]);
            setPagination({ current: 1, pageSize: 10, total: 0 });
            message.error('Không thể tải danh sách giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarts(pagination.current, pagination.pageSize);
        // eslint-disable-next-line
    }, []);

    const handleTableChange = (pag) => {
        fetchCarts(pag.current, pag.pageSize);
    };

    const handleDelete = async (userId) => {
        try {
            await cartService.clearCartByUserId(userId);
            message.success('Xóa giỏ hàng thành công!');
            fetchCarts(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Không thể xóa giỏ hàng!');
        }
    };

    const handleView = async (userId) => {
        try {
            const cart = await cartService.getCartByUserId(userId);
            setSelectedCart(cart);
            setModalVisible(true);
        } catch (error) {
            message.error('Không thể xem chi tiết giỏ hàng!');
        }
    };

    const columns = [
        {
            title: 'User ID',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'Số lượng sản phẩm',
            dataIndex: 'items',
            key: 'items',
            render: (items) => Array.isArray(items) ? items.length : 0
        },
        {
            title: 'Tổng giá trị',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (totalPrice) => totalPrice ? `${totalPrice.toLocaleString('vi-VN')} VND` : '0 VND'
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleView(record.userId)}>
                        Xem
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xoá giỏ hàng này?"
                        onConfirm={() => handleDelete(record.userId)}
                        okText="Xoá"
                        cancelText="Huỷ"
                    >
                        <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="cart-management">
            <h1>Quản lý giỏ hàng</h1>
            <Table
                columns={columns}
                dataSource={carts}
                rowKey="userId"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} giỏ hàng`
                }}
                onChange={handleTableChange}
            />
            <Modal
                title="Chi tiết giỏ hàng"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedCart && Array.isArray(selectedCart.items) ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={selectedCart.items}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    title={item.productName || item.product?.name || 'Sản phẩm'}
                                    description={`Số lượng: ${item.quantity} | Giá: ${item.price ? item.price.toLocaleString('vi-VN') : 0} VND`}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <p>Không có sản phẩm trong giỏ hàng.</p>
                )}
            </Modal>
        </div>
    );
};

export default CartManagement; 