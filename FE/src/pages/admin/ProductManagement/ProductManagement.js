import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    message,
    Popconfirm,
    Tag,
    Image
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import productService from '../../../services/productService';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

const ProductManagement = () => {
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Fetch products
    const fetchProducts = async (params = {}) => {
        try {
            setLoading(true);
            const response = await productService.getAllProducts({
                page: params.current || 1,
                limit: params.pageSize || 10,
                ...params,
            });
            setProducts(response.data);
            setPagination({
                ...pagination,
                total: response.total,
            });
        } catch (error) {
            message.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories and brands
    const fetchCategoriesAndBrands = async () => {
        try {
            const [categoriesData, brandsData] = await Promise.all([
                productService.getCategories(),
                productService.getBrands(),
            ]);
            setCategories(categoriesData);
            setBrands(brandsData);
        } catch (error) {
            message.error('Failed to fetch categories and brands');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategoriesAndBrands();
    }, []);

    const handleTableChange = (pagination, filters, sorter) => {
        fetchProducts({
            current: pagination.current,
            pageSize: pagination.pageSize,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
        });
    };

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingProduct(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await productService.deleteProduct(id);
            message.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, values);
                message.success('Product updated successfully');
            } else {
                await productService.createProduct(values);
                message.success('Product created successfully');
            }
            setModalVisible(false);
            fetchProducts();
        } catch (error) {
            message.error('Failed to save product');
        }
    };

    const handleImageUpload = async (file) => {
        try {
            const response = await productService.uploadProductImage(file);
            return response.imageUrl;
        } catch (error) {
            message.error('Failed to upload image');
            return '';
        }
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (imageUrl) => (
                <Image
                    src={imageUrl}
                    alt="Product"
                    width={50}
                    height={50}
                    style={{ objectFit: 'cover' }}
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        },
        {
            title: 'Category',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (categoryId) => {
                const category = categories.find(c => c.id === categoryId);
                return category ? category.name : '-';
            },
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `$${price.toFixed(2)}`,
            sorter: true,
        },
        {
            title: 'Stock',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            sorter: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`status-${status.toLowerCase()}`}>
                    {status}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this product?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="product-management">
            <div className="header">
                <h1>Product Management</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Product
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={products}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />

            <Modal
                title={editingProduct ? 'Edit Product' : 'Add Product'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Product Name"
                        rules={[{ required: true, message: 'Please enter product name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter product description' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category' }]}
                    >
                        <Select>
                            {categories.map(category => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="brand"
                        label="Brand"
                        rules={[{ required: true, message: 'Please enter brand' }]}
                    >
                        <Select>
                            {brands.map(brand => (
                                <Option key={brand} value={brand}>
                                    {brand}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <InputNumber
                            min={0}
                            step={0.01}
                            style={{ width: '100%' }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="stockQuantity"
                        label="Stock Quantity"
                        rules={[{ required: true, message: 'Please enter stock quantity' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="imageUrl"
                        label="Product Image"
                        rules={[{ required: true, message: 'Please upload a product image' }]}
                    >
                        <Upload
                            listType="picture"
                            maxCount={1}
                            beforeUpload={handleImageUpload}
                        >
                            <Button icon={<UploadOutlined />}>Upload Image</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select>
                            <Option value="ACTIVE">Active</Option>
                            <Option value="INACTIVE">Inactive</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingProduct ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement;