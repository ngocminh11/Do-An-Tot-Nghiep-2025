import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Spin, Upload, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
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
    const [brands, setBrands] = useState([]);
    const [imageList, setImageList] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategoriesAndBrands();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await productService.getAllProducts();
            setProducts(data);
        } catch (error) {
            message.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoriesAndBrands = async () => {
        try {
            const [categoriesData, brandsData] = await Promise.all([
                productService.getCategories(),
                productService.getBrands()
            ]);
            setCategories(categoriesData);
            setBrands(brandsData);
        } catch (error) {
            message.error('Không thể tải danh mục và thương hiệu');
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setImageList([]);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setImageList(product.imageUrls?.map(url => ({ url })) || []);
        form.setFieldsValue({
            ...product,
            category: product.categoryId,
            brand: product.brandId
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
                    await productService.deleteProduct(product._id);
                    message.success('Xóa sản phẩm thành công');
                    fetchProducts();
                } catch (error) {
                    message.error('Không thể xóa sản phẩm');
                }
            }
        });
    };

    const handleImageUpload = async (file) => {
        try {
            const response = await productService.uploadProductImage(file);
            return response.imageUrl;
        } catch (error) {
            message.error('Không thể tải lên hình ảnh');
            return '';
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const productData = {
                ...values,
                imageUrls: imageList.map(img => img.url),
                categoryId: values.category,
                brandId: values.brand
            };
            delete productData.category;
            delete productData.brand;

            if (editingProduct) {
                await productService.updateProduct(editingProduct._id, productData);
                message.success('Cập nhật sản phẩm thành công');
            } else {
                await productService.createProduct(productData);
                message.success('Thêm sản phẩm thành công');
            }
            setIsModalVisible(false);
            fetchProducts();
        } catch (error) {
            message.error('Có lỗi xảy ra khi lưu sản phẩm');
        }
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrls',
            key: 'imageUrls',
            render: (imageUrls) => (
                <Image
                    width={50}
                    height={50}
                    src={imageUrls?.[0] || 'placeholder.jpg'}
                    preview={false}
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
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`status-tag ${status}`}>
                    {status === 'published' ? 'Đã xuất bản' :
                        status === 'draft' ? 'Nháp' : 'Đã lưu trữ'}
                </span>
            ),
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

    return (
        <div className="product-management">
            <div className="header">
                <h1>Quản lý sản phẩm</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
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
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText={editingProduct ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                width={800}
            >
                <Form form={form} layout="vertical">
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
                        name="category"
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
                        name="brand"
                        label="Thương hiệu"
                        rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                    >
                        <Select>
                            {brands.map(brand => (
                                <Option key={brand._id} value={brand._id}>
                                    {brand.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Giá"
                        rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
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
                    <Form.Item
                        label="Hình ảnh sản phẩm"
                        name="imageUrls"
                    >
                        <Upload
                            listType="picture-card"
                            fileList={imageList}
                            onChange={({ fileList }) => setImageList(fileList)}
                            customRequest={async ({ file, onSuccess }) => {
                                const url = await handleImageUpload(file);
                                onSuccess(url);
                            }}
                            multiple
                        >
                            {imageList.length >= 5 ? null : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement;