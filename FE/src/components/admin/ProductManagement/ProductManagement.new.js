import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Spin, Upload, Image, Tabs, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Predefined options for skin types and issues
const SKIN_TYPES = [
    'Normal',
    'Dry',
    'Oily',
    'Combination',
    'Sensitive',
    'Mature',
    'Da thường',
    'Da khô',
    'Da hỗn hợp',
    'Da mụn',
    'Da nhạy cảm',
    'Mọi loại da'
];

const SKIN_ISSUES = [
    'Acne',
    'Wrinkles',
    'Dark Spots',
    'Redness',
    'Dullness',
    'Uneven Skin Tone',
    'Dehydration',
    'Sensitivity',
    'Hyperpigmentation',
    'Fine Lines'
];

const ProductManagement = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [imageList, setImageList] = useState([]);
    const [mainImage, setMainImage] = useState(null);

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
            setCategories(categoriesData || []);
            setBrands(brandsData || []);
        } catch (error) {
            message.error('Không thể tải danh mục và thương hiệu');
            setCategories([]);
            setBrands([]);
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setImageList([]);
        setMainImage(null);
        form.resetFields();
        form.setFieldsValue({
            basicInformation: {
                categoryIds: [],
                brand: ''
            },
            pricingAndInventory: {
                currency: 'VND',
                unit: 'cái'
            },
            technicalDetails: {
                suitableSkinTypes: []
            },
            seo: {
                keywords: []
            }
        });
        setIsModalVisible(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setImageList(product.media?.imageGallery?.map(url => ({ url })) || []);
        setMainImage(product.media?.mainImage ? [{ url: product.media.mainImage }] : null);

        form.setFieldsValue({
            basicInformation: {
                productName: product.basicInformation?.productName || '',
                sku: product.basicInformation?.sku || '',
                categoryIds: product.basicInformation?.categoryIds || [],
                brand: product.basicInformation?.brand || ''
            },
            pricingAndInventory: {
                originalPrice: product.pricingAndInventory?.originalPrice || 0,
                salePrice: product.pricingAndInventory?.salePrice || 0,
                currency: product.pricingAndInventory?.currency || 'VND',
                stockQuantity: product.pricingAndInventory?.stockQuantity || 0,
                unit: product.pricingAndInventory?.unit || 'cái'
            },
            description: {
                shortDescription: product.description?.shortDescription || '',
                detailedDescription: product.description?.detailedDescription || '',
                ingredients: product.description?.ingredients || '',
                usageInstructions: product.description?.usageInstructions || '',
                expiration: product.description?.expiration || ''
            },
            technicalDetails: {
                sizeOrWeight: product.technicalDetails?.sizeOrWeight || '',
                suitableSkinTypes: product.technicalDetails?.suitableSkinTypes || [],
                origin: product.technicalDetails?.origin || '',
                certifications: product.technicalDetails?.certifications || ''
            },
            seo: {
                keywords: product.seo?.keywords || [],
                metaTitle: product.seo?.metaTitle || '',
                metaDescription: product.seo?.metaDescription || '',
                urlSlug: product.seo?.urlSlug || ''
            },
            policy: {
                shippingReturnWarranty: product.policy?.shippingReturnWarranty || '',
                additionalOptions: product.policy?.additionalOptions || ''
            }
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
                basicInformation: {
                    productName: values.basicInformation.productName,
                    sku: values.basicInformation.sku,
                    categoryIds: values.basicInformation.categoryIds,
                    brand: values.basicInformation.brand
                },
                pricingAndInventory: {
                    originalPrice: values.pricingAndInventory.originalPrice,
                    salePrice: values.pricingAndInventory.salePrice,
                    currency: values.pricingAndInventory.currency,
                    stockQuantity: values.pricingAndInventory.stockQuantity,
                    unit: values.pricingAndInventory.unit
                },
                media: {
                    mainImage: mainImage?.[0]?.url || '',
                    imageGallery: imageList.map(img => img.url),
                    videoUrl: values.media?.videoUrl || null
                },
                description: {
                    shortDescription: values.description.shortDescription,
                    detailedDescription: values.description.detailedDescription,
                    ingredients: values.description.ingredients,
                    usageInstructions: values.description.usageInstructions,
                    expiration: values.description.expiration
                },
                technicalDetails: {
                    sizeOrWeight: values.technicalDetails.sizeOrWeight,
                    suitableSkinTypes: values.technicalDetails.suitableSkinTypes,
                    origin: values.technicalDetails.origin,
                    certifications: values.technicalDetails.certifications
                },
                seo: {
                    keywords: values.seo.keywords,
                    metaTitle: values.seo.metaTitle,
                    metaDescription: values.seo.metaDescription,
                    urlSlug: values.seo.urlSlug
                },
                policy: {
                    shippingReturnWarranty: values.policy.shippingReturnWarranty,
                    additionalOptions: values.policy.additionalOptions
                }
            };

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

    // Helper functions for data display
    const getCategoryNames = (ids) => {
        if (!ids || !ids.length) return 'N/A';
        return ids.map(id => categories.find(c => c._id === id)?.name).filter(Boolean).join(', ');
    };

    const getBrandName = (id) => {
        if (!id) return 'N/A';
        return brands.find(b => b._id === id)?.name || id;
    };

    const formatPrice = (price) => {
        if (!price) return 'N/A';
        return `${price.toLocaleString('vi-VN')} VNĐ`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: ['media', 'mainImage'],
            key: 'mainImage',
            render: (image) => (
                <Image
                    src={image}
                    alt="Product"
                    width={50}
                    height={50}
                    style={{ objectFit: 'cover' }}
                />
            )
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: ['basicInformation', 'productName'],
            key: 'productName',
            render: (name, record) => (
                <Tooltip title={record.description?.shortDescription || ''}>
                    {name}
                </Tooltip>
            )
        },
        {
            title: 'SKU',
            dataIndex: ['basicInformation', 'sku'],
            key: 'sku',
        },
        {
            title: 'Danh mục',
            dataIndex: ['basicInformation', 'categoryIds'],
            key: 'categories',
            render: (ids) => getCategoryNames(ids)
        },
        {
            title: 'Thương hiệu',
            dataIndex: ['basicInformation', 'brand'],
            key: 'brand',
            render: (id) => getBrandName(id)
        },
        {
            title: 'Giá gốc',
            dataIndex: ['pricingAndInventory', 'originalPrice'],
            key: 'originalPrice',
            render: (price) => formatPrice(price)
        },
        {
            title: 'Giá bán',
            dataIndex: ['pricingAndInventory', 'salePrice'],
            key: 'salePrice',
            render: (price) => formatPrice(price)
        },
        {
            title: 'Tồn kho',
            dataIndex: ['pricingAndInventory', 'stockQuantity'],
            key: 'stockQuantity',
        },
        {
            title: 'Loại da phù hợp',
            dataIndex: ['technicalDetails', 'suitableSkinTypes'],
            key: 'suitableSkinTypes',
            render: (types) => types && types.length ? types.map(type => <Tag key={type}>{type}</Tag>) : 'N/A'
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
            )
        }
    ];

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
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng số ${total} sản phẩm`
                    }}
                />
            </Spin>

            <Modal
                title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                width={800}
                footer={[
                    <Button key="back" onClick={() => setIsModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleModalOk}>
                        {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        basicInformation: {
                            currency: 'VND',
                            unit: 'cái'
                        }
                    }}
                >
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Thông tin cơ bản" key="1">
                            <Form.Item
                                name={['basicInformation', 'productName']}
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name={['basicInformation', 'sku']}
                                label="Mã SKU"
                                rules={[{ required: true, message: 'Vui lòng nhập mã SKU' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name={['basicInformation', 'categoryIds']}
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                                initialValue={[]}
                            >
                                <Select mode="multiple" placeholder="Chọn danh mục">
                                    {categories && categories.length > 0 ? categories.map(category => (
                                        <Option key={category._id} value={category._id || ''}>
                                            {category.name || ''}
                                        </Option>
                                    )) : <Option value="" disabled>Không có danh mục</Option>}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name={['basicInformation', 'brand']}
                                label="Thương hiệu"
                                rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                                initialValue=""
                            >
                                <Select placeholder="Chọn thương hiệu">
                                    {brands && brands.length > 0 ? brands.map(brand => (
                                        <Option key={brand._id} value={brand._id || ''}>
                                            {brand.name || ''}
                                        </Option>
                                    )) : <Option value="" disabled>Không có thương hiệu</Option>}
                                </Select>
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Giá và tồn kho" key="2">
                            <Form.Item
                                name={['pricingAndInventory', 'originalPrice']}
                                label="Giá gốc"
                                rules={[{ required: true, message: 'Vui lòng nhập giá gốc' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item
                                name={['pricingAndInventory', 'salePrice']}
                                label="Giá bán"
                                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item
                                name={['pricingAndInventory', 'stockQuantity']}
                                label="Số lượng tồn kho"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>

                            <Form.Item
                                name={['pricingAndInventory', 'unit']}
                                label="Đơn vị"
                                rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
                            >
                                <Input />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Mô tả" key="3">
                            <Form.Item
                                name={['description', 'shortDescription']}
                                label="Mô tả ngắn"
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
                            >
                                <TextArea rows={4} />
                            </Form.Item>

                            <Form.Item
                                name={['description', 'detailedDescription']}
                                label="Mô tả chi tiết"
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
                            >
                                <TextArea rows={6} />
                            </Form.Item>

                            <Form.Item
                                name={['description', 'ingredients']}
                                label="Thành phần"
                            >
                                <TextArea rows={4} />
                            </Form.Item>

                            <Form.Item
                                name={['description', 'usageInstructions']}
                                label="Hướng dẫn sử dụng"
                            >
                                <TextArea rows={4} />
                            </Form.Item>

                            <Form.Item
                                name={['description', 'expiration']}
                                label="Hạn sử dụng"
                            >
                                <Input />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Chi tiết kỹ thuật" key="4">
                            <Form.Item
                                name={['technicalDetails', 'sizeOrWeight']}
                                label="Kích thước/Khối lượng"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name={['technicalDetails', 'suitableSkinTypes']}
                                label="Loại da phù hợp"
                                initialValue={[]}
                            >
                                <Select mode="multiple" placeholder="Chọn loại da phù hợp">
                                    {SKIN_TYPES.map(type => (
                                        <Option key={type} value={type || ''}>
                                            {type || ''}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name={['technicalDetails', 'origin']}
                                label="Xuất xứ"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name={['technicalDetails', 'certifications']}
                                label="Chứng nhận"
                            >
                                <Input />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="SEO" key="5">
                            <Form.Item
                                name={['seo', 'keywords']}
                                label="Từ khóa"
                                initialValue={[]}
                            >
                                <Select mode="tags" placeholder="Nhập từ khóa">
                                    {SKIN_ISSUES.map(issue => (
                                        <Option key={issue} value={issue || ''}>
                                            {issue || ''}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name={['seo', 'metaTitle']}
                                label="Meta Title"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name={['seo', 'metaDescription']}
                                label="Meta Description"
                            >
                                <TextArea rows={4} />
                            </Form.Item>

                            <Form.Item
                                name={['seo', 'urlSlug']}
                                label="URL Slug"
                            >
                                <Input />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Chính sách" key="6">
                            <Form.Item
                                name={['policy', 'shippingReturnWarranty']}
                                label="Chính sách vận chuyển và bảo hành"
                            >
                                <TextArea rows={4} />
                            </Form.Item>

                            <Form.Item
                                name={['policy', 'additionalOptions']}
                                label="Tùy chọn bổ sung"
                            >
                                <TextArea rows={4} />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Hình ảnh" key="7">
                            <Form.Item
                                label="Hình ảnh chính"
                                required
                            >
                                <Upload
                                    listType="picture-card"
                                    maxCount={1}
                                    fileList={mainImage}
                                    onChange={({ fileList }) => setMainImage(fileList)}
                                    beforeUpload={handleImageUpload}
                                >
                                    {mainImage?.length >= 1 ? null : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>

                            <Form.Item
                                label="Thư viện ảnh"
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={imageList}
                                    onChange={({ fileList }) => setImageList(fileList)}
                                    beforeUpload={handleImageUpload}
                                >
                                    {imageList?.length >= 8 ? null : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </TabPane>
                    </Tabs>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement; 