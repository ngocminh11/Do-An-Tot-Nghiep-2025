import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { productAPI } from '../../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
        fetchCategories();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const product = await productAPI.getProduct(id);
            form.setFieldsValue(product);
        } catch (error) {
            message.error('Failed to fetch product details');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await productAPI.getCategories();
            setCategories(data);
        } catch (error) {
            message.error('Failed to fetch categories');
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            if (id) {
                await productAPI.updateProduct(id, values);
                message.success('Product updated successfully');
            } else {
                await productAPI.createProduct(values);
                message.success('Product created successfully');
            }
            navigate('/admin/products');
        } catch (error) {
            message.error('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-detail">
            <h2>{id ? 'Edit Product' : 'Add New Product'}</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    stock: 0,
                    price: 0,
                }}
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
                        {categories.map((category) => (
                            <Option key={category._id} value={category._id}>
                                {category.name}
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
                        min={0}
                        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                </Form.Item>

                <Form.Item
                    name="stock"
                    label="Stock"
                    rules={[{ required: true, message: 'Please enter stock quantity' }]}
                >
                    <InputNumber min={0} />
                </Form.Item>

                <Form.Item
                    name="image"
                    label="Product Image"
                    rules={[{ required: true, message: 'Please upload a product image' }]}
                >
                    <Upload
                        listType="picture"
                        maxCount={1}
                        beforeUpload={() => false}
                    >
                        <Button icon={<UploadOutlined />}>Upload Image</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {id ? 'Update Product' : 'Create Product'}
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate('/admin/products')}
                    >
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ProductDetail; 