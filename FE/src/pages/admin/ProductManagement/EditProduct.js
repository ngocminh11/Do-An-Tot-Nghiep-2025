import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    message,
    Spin,
    Upload
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import './ProductManagement.scss';

const { Option } = Select;

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // Hàm chuyển đổi giá trị lấy từ event của Upload thành mảng fileList
    const normFile = (e) => {
        // Nếu e là mảng thì trả về nó
        if (Array.isArray(e)) {
            return e;
        }
        // Nếu e tồn tại và có thuộc tính fileList, trả về nó; nếu không trả về mảng rỗng
        return e && e.fileList ? e.fileList : [];
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const product = await productService.getProductById(id);
                // Nếu có media.mainImage, đảm bảo rằng field "media" được set là mảng chứa đối tượng file
                if (product.media && product.media.mainImage) {
                    product.media = [
                        {
                            uid: '-1',
                            name: 'mainImage',
                            status: 'done',
                            url: product.media.mainImage
                        }
                    ];
                } else {
                    product.media = [];
                }
                // Set giá trị vào form (nếu product có cấu trúc phức tạp, bạn cần chuyển đổi thêm)
                form.setFieldsValue(product);
            } catch (error) {
                message.error('Failed to fetch product for edit');
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAllCategories();
                setCategories(data);
            } catch (error) {
                message.error('Failed to fetch categories');
            }
        };

        fetchProduct();
        fetchCategories();
    }, [id, form]);

    const handleFinish = async (values) => {
        try {
            const formData = new FormData();

            // Nếu có trường media, lấy file đã được Upload (ở mảng fileList) và gắn với key mainImage
            if (
                values.media &&
                values.media.length > 0 &&
                values.media[0].originFileObj
            ) {
                formData.append('mainImage', values.media[0].originFileObj);
            }

            // Append các field còn lại dưới dạng JSON string (backend sẽ parse lại)
            formData.append('data', JSON.stringify(values));

            await productService.updateProduct(id, formData);
            message.success('Product updated successfully');
            navigate('/admin/products');
        } catch (error) {
            message.error('Failed to update product');
        }
    };

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div className="edit-product">
            <h1>Edit Product</h1>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name={['basicInformation', 'productName']}
                    label="Product Name"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name={['basicInformation', 'sku']}
                    label="SKU"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name={['basicInformation', 'brand']}
                    label="Brand"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name={['basicInformation', 'categoryIds']}
                    label="Categories"
                    rules={[{ required: true }]}
                >
                    <Select mode="multiple">
                        {categories.map((category) => (
                            <Option key={category._id} value={category._id}>
                                {category.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name={['pricingAndInventory', 'salePrice']}
                    label="Sale Price"
                    rules={[{ required: true }]}
                >
                    <InputNumber min={0} />
                </Form.Item>

                <Form.Item
                    name={['pricingAndInventory', 'stockQuantity']}
                    label="Stock Quantity"
                    rules={[{ required: true }]}
                >
                    <InputNumber min={0} />
                </Form.Item>

                <Form.Item
                    name={['pricingAndInventory', 'unit']}
                    label="Unit"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name={['description', 'shortDescription']}
                    label="Short Description"
                    rules={[{ required: true }]}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    name={['description', 'detailedDescription']}
                    label="Detailed Description"
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    name={['description', 'ingredients']}
                    label="Ingredients"
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    name={['description', 'usageInstructions']}
                    label="Usage Instructions"
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    name={['description', 'expiration']}
                    label="Expiration"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="media"
                    label="Main Image"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                >
                    <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>Upload Image</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Update Product
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditProduct;