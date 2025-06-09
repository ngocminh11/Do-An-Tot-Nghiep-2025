import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    message,
    Spin,
    Upload,
    Row,
    Col,
    Card,
    Divider
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const product = await productService.getProductById(id);

                // Xử lý media files
                if (product.mediaFiles) {
                    const mediaFiles = product.mediaFiles.images.map((file, index) => ({
                        uid: `-${index}`,
                        name: file.filename,
                        status: 'done',
                        url: file.path,
                        type: file.mimetype
                    }));
                    setFileList(mediaFiles);
                }

                // Set giá trị vào form
                form.setFieldsValue({
                    idProduct: product.idProduct,
                    basicInformation: {
                        productName: product.basicInformation.productName,
                        sku: product.basicInformation.sku,
                        brand: product.basicInformation.brand,
                        categoryIds: product.basicInformation.categoryIds
                    },
                    pricingAndInventory: {
                        originalPrice: product.pricingAndInventory.originalPrice,
                        salePrice: product.pricingAndInventory.salePrice,
                        stockQuantity: product.pricingAndInventory.stockQuantity,
                        unit: product.pricingAndInventory.unit,
                        currency: product.pricingAndInventory.currency
                    },
                    description: {
                        shortDescription: product.description.shortDescription,
                        detailedDescription: product.description.detailedDescription,
                        ingredients: product.description.ingredients,
                        usageInstructions: product.description.usageInstructions,
                        expiration: product.description.expiration
                    },
                    technicalDetails: {
                        sizeOrWeight: product.technicalDetails.sizeOrWeight,
                        suitableSkinTypes: product.technicalDetails.suitableSkinTypes,
                        origin: product.technicalDetails.origin,
                        certifications: product.technicalDetails.certifications
                    },
                    seo: {
                        keywords: product.seo.keywords,
                        metaTitle: product.seo.metaTitle,
                        metaDescription: product.seo.metaDescription,
                        urlSlug: product.seo.urlSlug
                    },
                    policy: {
                        shippingReturnWarranty: product.policy.shippingReturnWarranty,
                        additionalOptions: product.policy.additionalOptions
                    }
                });
            } catch (error) {
                message.error('Failed to fetch product for edit');
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAllCategories();
                setCategories(Array.isArray(response) ? response : []);
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

            // Append product ID
            formData.append('idProduct', values.idProduct);

            // Append basic information
            if (values.basicInformation) {
                formData.append('basicInformation[productName]', values.basicInformation.productName);
                formData.append('basicInformation[sku]', values.basicInformation.sku);
                formData.append('basicInformation[brand]', values.basicInformation.brand);
                if (Array.isArray(values.basicInformation.categoryIds)) {
                    values.basicInformation.categoryIds.forEach(id =>
                        formData.append('basicInformation[categoryIds][]', id)
                    );
                }
            }

            // Append pricing and inventory
            if (values.pricingAndInventory) {
                formData.append('pricingAndInventory[originalPrice]', values.pricingAndInventory.originalPrice);
                formData.append('pricingAndInventory[salePrice]', values.pricingAndInventory.salePrice);
                formData.append('pricingAndInventory[stockQuantity]', values.pricingAndInventory.stockQuantity);
                formData.append('pricingAndInventory[unit]', values.pricingAndInventory.unit);
                formData.append('pricingAndInventory[currency]', values.pricingAndInventory.currency || 'VND');
            }

            // Append description
            if (values.description) {
                formData.append('description[shortDescription]', values.description.shortDescription);
                formData.append('description[detailedDescription]', values.description.detailedDescription);
                formData.append('description[ingredients]', values.description.ingredients);
                formData.append('description[usageInstructions]', values.description.usageInstructions);
                formData.append('description[expiration]', values.description.expiration);
            }

            // Append technical details
            if (values.technicalDetails) {
                formData.append('technicalDetails[sizeOrWeight]', values.technicalDetails.sizeOrWeight);
                if (Array.isArray(values.technicalDetails.suitableSkinTypes)) {
                    values.technicalDetails.suitableSkinTypes.forEach(type =>
                        formData.append('technicalDetails[suitableSkinTypes][]', type)
                    );
                }
                if (Array.isArray(values.technicalDetails.certifications)) {
                    values.technicalDetails.certifications.forEach(cert =>
                        formData.append('technicalDetails[certifications][]', cert)
                    );
                }
                formData.append('technicalDetails[origin]', values.technicalDetails.origin);
            }

            // Append SEO
            if (values.seo) {
                if (Array.isArray(values.seo.keywords)) {
                    values.seo.keywords.forEach(keyword =>
                        formData.append('seo[keywords][]', keyword)
                    );
                }
                formData.append('seo[metaTitle]', values.seo.metaTitle);
                formData.append('seo[metaDescription]', values.seo.metaDescription);
            }

            // Append policy
            if (values.policy) {
                formData.append('policy[shippingReturnWarranty]', values.policy.shippingReturnWarranty || '');
                formData.append('policy[additionalOptions]', values.policy.additionalOptions || '');
            }

            // Append media files
            if (values.media) {
                if (values.media.mainImage && values.media.mainImage.length > 0) {
                    const mainImageFile = values.media.mainImage[0].originFileObj;
                    if (mainImageFile) {
                        formData.append('images', mainImageFile);
                    }
                }
                if (values.media.imageGallery && values.media.imageGallery.length > 0) {
                    values.media.imageGallery.forEach(fileItem => {
                        const imageFile = fileItem.originFileObj;
                        if (imageFile) {
                            formData.append('images', imageFile);
                        }
                    });
                }
            }

            await productService.updateProduct(id, formData);
            message.success('Cập nhật sản phẩm thành công');
            navigate('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            if (error.response?.data?.message) {
                message.error('Lỗi: ' + error.response.data.message);
            } else {
                message.error('Cập nhật sản phẩm thất bại');
            }
        }
    };

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div className="edit-product">
            <h1>Cập nhật sản phẩm</h1>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                {/* Basic Information */}
                <Divider orientation="left">Thông tin cơ bản</Divider>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name="idProduct"
                            label="Mã sản phẩm"
                            rules={[{ required: true }]}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['basicInformation', 'productName']}
                            label="Tên sản phẩm"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['basicInformation', 'sku']}
                            label="SKU"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['basicInformation', 'brand']}
                            label="Thương hiệu"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['basicInformation', 'categoryIds']}
                            label="Danh mục"
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
                    </Col>
                </Row>

                {/* Pricing and Inventory */}
                <Divider orientation="left">Giá và tồn kho</Divider>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item
                            name={['pricingAndInventory', 'originalPrice']}
                            label="Giá gốc"
                            rules={[{ required: true }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name={['pricingAndInventory', 'salePrice']}
                            label="Giá bán"
                            rules={[{ required: true }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name={['pricingAndInventory', 'stockQuantity']}
                            label="Số lượng tồn kho"
                            rules={[{ required: true }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Media */}
                <Divider orientation="left">Hình ảnh</Divider>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name={['media', 'mainImage']}
                            label="Hình ảnh chính"
                            valuePropName="fileList"
                            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
                        >
                            <Upload
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={() => false}
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['media', 'imageGallery']}
                            label="Thư viện ảnh"
                            valuePropName="fileList"
                            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
                        >
                            <Upload
                                listType="picture-card"
                                multiple
                                beforeUpload={() => false}
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Description */}
                <Divider orientation="left">Mô tả sản phẩm</Divider>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name={['description', 'shortDescription']}
                            label="Mô tả ngắn"
                            rules={[{ required: true }]}
                        >
                            <TextArea rows={3} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['description', 'detailedDescription']}
                            label="Mô tả chi tiết"
                            rules={[{ required: true }]}
                        >
                            <TextArea rows={3} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Cập nhật sản phẩm
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditProduct;