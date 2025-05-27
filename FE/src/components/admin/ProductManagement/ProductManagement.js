import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Upload, message, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { productAPI } from '../../../services/api';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

const ProductManagement = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getProducts();
            setProducts(data);
        } catch (error) {
            message.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await productAPI.getCategories();
            setCategories(data);
        } catch (error) {
            message.error('Không thể tải danh mục sản phẩm');
        }
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrls',
            key: 'imageUrls',
            render: (imageUrls) => (
                <img
                    src={imageUrls?.[0] || 'https://via.placeholder.com/50'}
                    alt="Product"
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                />
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Số lượng',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (categoryId) => {
                const category = categories.find(c => c._id === categoryId);
                return category ? category.name : 'Unknown';
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusColors = {
                    published: 'success',
                    draft: 'warning',
                    archived: 'error'
                };
                return <span className={`status-tag ${status}`}>{status}</span>;
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
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        form.setFieldsValue({
            name: product.name,
            description: product.description,
            brand: product.brand,
            categoryId: product.categoryId,
            price: product.price,
            stockQuantity: product.stockQuantity,
            status: product.status
        });
        setIsModalVisible(true);
    };

    const handleDelete = (product) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await productAPI.deleteProduct(product._id);
                    message.success('Xóa sản phẩm thành công');
                    fetchProducts();
                } catch (error) {
                    message.error('Không thể xóa sản phẩm');
                }
            }
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingProduct) {
                await productAPI.updateProduct(editingProduct._id, values);
                message.success('Cập nhật sản phẩm thành công');
            } else {
                await productAPI.createProduct(values);
                message.success('Thêm sản phẩm thành công');
            }
            setIsModalVisible(false);
            fetchProducts();
        } catch (error) {
            message.error('Có lỗi xảy ra khi lưu sản phẩm');
        }
    };

    return (
        <div className="product-management">
            <div className="header">
                <h1>Quản lý sản phẩm</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Thêm sản phẩm
                </Button>
            </div>

            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Spin>

            <Modal
                title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText={editingProduct ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Tên sản phẩm"
                        rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="brand"
                        label="Thương hiệu"
                        rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                    >
                        <Select>
                            {categories.map(category => (
                                <Option key={category._id} value={category._id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Giá"
                        rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="stockQuantity"
                        label="Số lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select>
                            <Option value="published">Đã xuất bản</Option>
                            <Option value="draft">Nháp</Option>
                            <Option value="archived">Đã lưu trữ</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement; 