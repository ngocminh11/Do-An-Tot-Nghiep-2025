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
    Image,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
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
    const [imageList, setImageList] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Fetch products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getAllProducts();
            setProducts(response);
            setPagination((prev) => ({
                ...prev,
                total: response.length,
            }));
        } catch (error) {
            message.error(error.message || 'Failed to fetch products');
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
            message.error(error.message || 'Failed to fetch categories and brands');
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
        setImageList([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingProduct(record);
        setImageList(record.imageUrls?.map(url => ({ url })) || []);
        form.setFieldsValue({
            ...record,
            price: parseFloat(record.price.$numberDecimal),
            stockQuantity: record.stockQuantity,
            category: record.categoryId,
            brand: record.brandId,
            volume: record.attributes.volume,
            skinType: record.attributes.skinType || [],
            status: record.status,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await productService.deleteProduct(id);
            message.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            message.error(error.message || 'Failed to delete product');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const productData = {
                ...values,
                imageUrls: imageList.map(img => img.url),
                categoryId: values.category,
                brandId: values.brand,
                attributes: {
                    volume: values.volume,
                    skinType: values.skinType,
                },
            };

            if (editingProduct) {
                await productService.updateProduct(editingProduct._id, productData);
                message.success('Product updated successfully');
            } else {
                await productService.createProduct(productData);
                message.success('Product created successfully');
            }
            setModalVisible(false);
            fetchProducts();
        } catch (error) {
            message.error(error.message || 'Failed to save product');
        }
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'imageUrls',
            key: 'imageUrls',
            render: (imageUrls) => (
                <Image
                    src={imageUrls?.[0] || ''}
                    alt="Product"
                    width={50}
                    height={50}
                    style={{ objectFit: 'cover' }}
                    preview={false}
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
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${parseFloat(price.$numberDecimal).toLocaleString('vi-VN')} VNĐ`,
            sorter: true,
        },
        {
            title: 'Stock',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            sorter: true,
        },
        {
            title: 'Average Rating',
            dataIndex: 'averageRating',
            key: 'averageRating',
            render: (rating) => rating ? rating.$numberDecimal : 'N/A',
            sorter: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'published' ? 'blue' :
                    status === 'draft' ? 'orange' : 'default'
                }>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Tag>
            ),
            filters: [
                { text: 'Published', value: 'published' },
                { text: 'Draft', value: 'draft' },
            ],
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Edit">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure you want to delete this product?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
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
                rowKey="_id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />

            <Modal
                title={editingProduct ? 'Edit Product' : 'Add Product'}
                open={modalVisible}
                onOk={form.submit}
                onCancel={() => setModalVisible(false)}
                width={800}
                okText={editingProduct ? 'Update' : 'Create'}
                cancelText="Cancel"
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
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category' }]}
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
                        label="Brand"
                        rules={[{ required: true, message: 'Please select a brand' }]}
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
                        label="Price"
                        rules={[{ required: true, message: 'Please enter product price' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="stockQuantity"
                        label="Stock Quantity"
                        rules={[{ required: true, message: 'Please enter stock quantity' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item
                        name="volume"
                        label="Volume"
                        rules={[{ required: true, message: 'Please enter product volume' }]}
                    >
                        <Input placeholder="e.g., 50ml" />
                    </Form.Item>

                    <Form.Item
                        name="skinType"
                        label="Skin Type"
                        rules={[{ required: true, message: 'Please select skin types' }]}
                    >
                        <Select mode="multiple" placeholder="Select skin types">
                            <Option value="normal">Normal</Option>
                            <Option value="dry">Dry</Option>
                            <Option value="oily">Oily</Option>
                            <Option value="combination">Combination</Option>
                            <Option value="sensitive">Sensitive</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select product status' }]}
                    >
                        <Select>
                            <Option value="published">Published</Option>
                            <Option value="draft">Draft</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Product Images"
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
                                    <div style={{ marginTop: 8 }}>Upload</div>
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