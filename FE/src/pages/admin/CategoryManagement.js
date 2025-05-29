import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Upload, message } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { mockCategories } from '../../services/mockData';
import './CategoryManagement.scss';

const CategoryManagement = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (imageUrl) => (
                <img
                    src={imageUrl}
                    alt="Category"
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                />
            ),
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Danh mục cha',
            dataIndex: 'parentId',
            key: 'parentId',
            render: (parentId) => {
                if (!parentId) return 'Không có';
                const parent = mockCategories.find(c => c._id === parentId);
                return parent ? parent.name : 'Unknown';
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        form.setFieldsValue(category);
        setIsModalVisible(true);
    };

    const handleDelete = (category) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa danh mục ${category.name}?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                // In a real app, you would make an API call here
                message.success('Xóa danh mục thành công');
            },
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // In a real app, you would make an API call here
            message.success(editingCategory ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công');
            setIsModalVisible(false);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <div className="category-management">
            <div className="header">
                <h1>Quản lý danh mục</h1>
                <Button type="primary" onClick={handleAdd}>
                    Thêm danh mục
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={mockCategories}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => setIsModalVisible(false)}
                okText={editingCategory ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="parentId"
                        label="Danh mục cha"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="imageUrl"
                        label="Hình ảnh"
                        rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh' }]}
                    >
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Tải lên</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManagement; 