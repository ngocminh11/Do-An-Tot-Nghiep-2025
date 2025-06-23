import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Space, Modal, Form, Input, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import promotionService from '../../../services/PromotionService';

const PromotionManagement = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [form] = Form.useForm();

    const fetchPromotions = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await promotionService.getAllPromotions({ page, limit: pageSize });
            setPromotions(response.data);
            setPagination({
                current: response.currentPage,
                pageSize: response.perPage,
                total: response.totalItems
            });
        } catch (error) {
            setPromotions([]);
            setPagination({ current: 1, pageSize: 10, total: 0 });
            message.error('Không thể tải danh sách khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions(pagination.current, pagination.pageSize);
        // eslint-disable-next-line
    }, []);

    const handleTableChange = (pag) => {
        fetchPromotions(pag.current, pag.pageSize);
    };

    const openModal = (promotion = null) => {
        setEditingPromotion(promotion);
        setModalVisible(true);
        if (promotion) {
            form.setFieldsValue({ ...promotion });
        } else {
            form.resetFields();
        }
    };

    const handleDelete = async (id) => {
        try {
            await promotionService.deletePromotion(id);
            message.success('Xóa khuyến mãi thành công!');
            fetchPromotions(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Không thể xóa khuyến mãi!');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingPromotion) {
                await promotionService.updatePromotion(editingPromotion._id, values);
                message.success('Cập nhật khuyến mãi thành công!');
            } else {
                await promotionService.createPromotion(values);
                message.success('Thêm khuyến mãi thành công!');
            }
            setModalVisible(false);
            fetchPromotions(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Lưu khuyến mãi thất bại!');
        }
    };

    const columns = [
        {
            title: 'Tên khuyến mãi',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Mã code',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Giá trị (%)',
            dataIndex: 'discountPercent',
            key: 'discountPercent',
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
                    <Popconfirm
                        title="Bạn có chắc muốn xoá khuyến mãi này?"
                        onConfirm={() => handleDelete(record._id)}
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
        <div className="promotion-management">
            <h1>Quản lý khuyến mãi</h1>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} style={{ marginBottom: 16 }}>
                Thêm khuyến mãi
            </Button>
            <Table
                columns={columns}
                dataSource={promotions}
                rowKey="_id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} khuyến mãi`
                }}
                onChange={handleTableChange}
            />
            <Modal
                title={editingPromotion ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                okText={editingPromotion ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên khuyến mãi" rules={[{ required: true, message: 'Nhập tên khuyến mãi' }]}> <Input /> </Form.Item>
                    <Form.Item name="description" label="Mô tả"> <Input.TextArea rows={2} /> </Form.Item>
                    <Form.Item name="code" label="Mã code" rules={[{ required: true, message: 'Nhập mã code' }]}> <Input /> </Form.Item>
                    <Form.Item name="discountPercent" label="Giá trị (%)" rules={[{ required: true, message: 'Nhập giá trị khuyến mãi' }]}> <Input type="number" min={1} max={100} /> </Form.Item>
                    <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
                    <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionManagement; 