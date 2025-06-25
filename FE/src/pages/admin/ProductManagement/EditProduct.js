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
    Divider,
    Tag,
    Modal
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import tagService from '../../../services/tagService';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [mainImageList, setMainImageList] = useState([]);
    const [galleryList, setGalleryList] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await productService.getProductById(id);

                if (!response || !response.data) {
                    throw new Error('Không thể lấy thông tin sản phẩm');
                }

                const product = response.data;

                // Phân biệt mainImage và gallery
                let mainPath = '';
                let galleryPaths = [];
                if (product.mediaFiles && Array.isArray(product.mediaFiles.images) && product.mediaFiles.images.length > 0) {
                    mainPath = product.mediaFiles.images[0].path;
                    galleryPaths = product.mediaFiles.images.slice(1).map(img => img.path);
                } else {
                    if (product.media && product.media.mainImage) {
                        mainPath = product.media.mainImage;
                    }
                    if (product.media && Array.isArray(product.media.imageGallery)) {
                        galleryPaths = product.media.imageGallery;
                    }
                }
                // Main image
                let mainImageArr = [];
                if (mainPath) {
                    try {
                        const blob = await productService.getImageById(mainPath.replace('/media/', ''));
                        const objectUrl = URL.createObjectURL(blob);
                        mainImageArr = [{
                            uid: '-main',
                            name: 'main-image',
                            status: 'done',
                            url: objectUrl,
                            type: blob.type,
                            originFileObj: blob
                        }];
                    } catch {
                        mainImageArr = [];
                    }
                }
                setMainImageList(mainImageArr);
                // Gallery images
                const galleryArr = await Promise.all(galleryPaths.map(async (path, index) => {
                    try {
                        const blob = await productService.getImageById(path.replace('/media/', ''));
                        const objectUrl = URL.createObjectURL(blob);
                        return {
                            uid: `-gallery-${index}`,
                            name: `gallery-image-${index}`,
                            status: 'done',
                            url: objectUrl,
                            type: blob.type,
                            originFileObj: blob
                        };
                    } catch {
                        return null;
                    }
                }));
                setGalleryList(galleryArr.filter(Boolean));

                // Xử lý categoryIds và tagIds
                const categoryIds = product.basicInformation?.categoryIds?.map(cat =>
                    typeof cat === 'object' ? cat._id : cat
                ) || [];

                const tagIds = product.basicInformation?.tagIds?.map(tag =>
                    typeof tag === 'object' ? tag._id : tag
                ) || [];

                // Set giá trị vào form
                form.setFieldsValue({
                    idProduct: product._id,
                    basicInformation: {
                        productName: product.basicInformation?.productName || '',
                        sku: product.basicInformation?.sku || '',
                        brand: 'CoCo',
                        categoryIds: categoryIds,
                        tagIds: tagIds
                    },
                    pricingAndInventory: {
                        originalPrice: product.pricingAndInventory?.originalPrice || 0,
                        salePrice: product.pricingAndInventory?.salePrice || 0,
                        stockQuantity: product.pricingAndInventory?.stockQuantity || 0,
                        unit: product.pricingAndInventory?.unit || '',
                        currency: product.pricingAndInventory?.currency || 'VND'
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
                        suitableSkinTypes: product.technicalDetails?.suitableSkinTypes || '',
                        origin: product.technicalDetails?.origin || '',
                        certifications: product.technicalDetails?.certifications || ''
                    },
                    seo: {
                        keywords: product.seo?.keywords || '',
                        metaTitle: product.seo?.metaTitle || '',
                        metaDescription: product.seo?.metaDescription || '',
                        urlSlug: product.seo?.urlSlug || ''
                    },
                    policy: {
                        shippingReturnWarranty: product.policy?.shippingReturnWarranty || '',
                        additionalOptions: product.policy?.additionalOptions || ''
                    }
                });
            } catch (error) {
                console.error('Error fetching product:', error);
                message.error(error.message || 'Không thể lấy thông tin sản phẩm');
                navigate('/admin/products');
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await categoryService.getAllCategories();
                if (response && Array.isArray(response.data)) {
                    setCategories(response.data.map(cat => ({
                        ...cat,
                        _id: String(cat._id),
                        name: cat.name || 'Unnamed Category'
                    })));
                } else {
                    setCategories([]);
                    message.error('Không thể tải danh mục sản phẩm');
                }
            } catch (error) {
                setCategories([]);
                message.error('Không thể tải danh mục sản phẩm');
            } finally {
                setLoadingCategories(false);
            }
        };

        const fetchTags = async () => {
            setLoadingTags(true);
            try {
                const response = await tagService.getAllTags();
                if (response && Array.isArray(response.data)) {
                    setTags(response.data.map(tag => ({
                        ...tag,
                        _id: String(tag._id),
                        name: tag.name || 'Unnamed Tag'
                    })));
                } else {
                    setTags([]);
                    message.error('Không thể tải tags');
                }
            } catch (error) {
                setTags([]);
                message.error('Không thể tải tags');
            } finally {
                setLoadingTags(false);
            }
        };

        fetchProduct();
        fetchCategories();
        fetchTags();
    }, [id, form, navigate]);

    const handleFinish = async (values) => {
        try {
            const formData = new FormData();

            // Append basic information
            if (values.basicInformation) {
                formData.append('basicInformation', JSON.stringify({
                    productName: values.basicInformation.productName,
                    sku: values.basicInformation.sku,
                    brand: 'CoCo',
                    categoryIds: values.basicInformation.categoryIds,
                    tagIds: values.basicInformation.tagIds,
                    status: 'active'
                }));
            }

            // Append pricing and inventory
            if (values.pricingAndInventory) {
                formData.append('pricingAndInventory', JSON.stringify({
                    originalPrice: values.pricingAndInventory.originalPrice,
                    salePrice: values.pricingAndInventory.salePrice,
                    stockQuantity: values.pricingAndInventory.stockQuantity,
                    unit: values.pricingAndInventory.unit,
                    currency: values.pricingAndInventory.currency || 'VND'
                }));
            }

            // Append description
            if (values.description) {
                formData.append('description', JSON.stringify({
                    shortDescription: values.description.shortDescription,
                    detailedDescription: values.description.detailedDescription,
                    ingredients: values.description.ingredients,
                    usageInstructions: values.description.usageInstructions,
                    expiration: values.description.expiration
                }));
            }

            // Append technical details
            if (values.technicalDetails) {
                formData.append('technicalDetails', JSON.stringify({
                    sizeOrWeight: values.technicalDetails.sizeOrWeight,
                    suitableSkinTypes: values.technicalDetails.suitableSkinTypes,
                    origin: values.technicalDetails.origin,
                    certifications: values.technicalDetails.certifications
                }));
            }

            // Append SEO
            if (values.seo) {
                formData.append('seo', JSON.stringify({
                    keywords: values.seo.keywords,
                    metaTitle: values.seo.metaTitle,
                    metaDescription: values.seo.metaDescription
                }));
            }

            // Append policy
            if (values.policy) {
                formData.append('policy', JSON.stringify({
                    shippingReturnWarranty: values.policy.shippingReturnWarranty || '',
                    additionalOptions: values.policy.additionalOptions || ''
                }));
            }

            // Append images: mainImage trước, sau đó gallery
            if (mainImageList && mainImageList.length > 0) {
                const mainImageFile = mainImageList[0].originFileObj;
                if (mainImageFile) {
                    formData.append('images', mainImageFile);
                }
            }
            if (galleryList && galleryList.length > 0) {
                galleryList.forEach(fileItem => {
                    const imageFile = fileItem.originFileObj;
                    if (imageFile) {
                        formData.append('images', imageFile);
                    }
                });
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

    // Hàm xóa ảnh khỏi mainImageList
    const handleRemoveMainImage = (file) => {
        setMainImageList([]);
    };
    // Hàm xóa ảnh khỏi galleryList
    const handleRemoveGalleryImage = (file) => {
        setGalleryList((prev) => prev.filter((f) => f.uid !== file.uid));
    };
    // Hàm preview ảnh
    const handlePreview = async (file) => {
        setPreviewImage(file.url || file.thumbUrl);
        setPreviewVisible(true);
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
                            name={["basicInformation", "brand"]}
                            label="Thương hiệu (Mặc định: CoCo)"
                            tooltip="Thương hiệu này không thể thay đổi, mặc định là CoCo"
                        >
                            <Input value="CoCo" disabled placeholder="CoCo" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['basicInformation', 'categoryIds']}
                            label="Danh mục"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một danh mục' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn danh mục"
                                loading={loadingCategories}
                                optionFilterProp="children"
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {categories.map((category) => (
                                    <Option key={category._id} value={category._id}>
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['basicInformation', 'tagIds']}
                            label="Tags"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một tag' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn tags"
                                loading={loadingTags}
                                optionFilterProp="children"
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {tags.map((tag) => (
                                    <Option key={tag._id} value={tag._id}>
                                        {tag.name}
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
                    <Col span={8}>
                        <Form.Item
                            name={['pricingAndInventory', 'unit']}
                            label="Đơn vị"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name={['pricingAndInventory', 'currency']}
                            label="Đơn vị tiền tệ"
                            rules={[{ required: true }]}
                        >
                            <Select defaultValue="VND">
                                <Option value="VND">VND</Option>
                                <Option value="USD">USD</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Media */}
                <Divider orientation="left">Hình ảnh</Divider>
                <Row gutter={24}>
                    <Col span={12}>
                        <Card bordered={false} bodyStyle={{ padding: 0 }}>
                            <div style={{ marginBottom: 16 }}>
                                <b>Hình ảnh chính</b>
                                <Upload
                                    listType="picture-card"
                                    fileList={mainImageList}
                                    onPreview={handlePreview}
                                    onRemove={handleRemoveMainImage}
                                    beforeUpload={(file) => {
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            message.error('Chỉ chấp nhận file hình ảnh!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        const isLt5M = file.size / 1024 / 1024 < 5;
                                        if (!isLt5M) {
                                            message.error('Hình ảnh không được vượt quá 5MB!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        setMainImageList([{
                                            uid: file.uid,
                                            name: file.name,
                                            status: 'done',
                                            url: URL.createObjectURL(file),
                                            originFileObj: file,
                                            type: file.type
                                        }]);
                                        return false;
                                    }}
                                    maxCount={1}
                                >
                                    {mainImageList.length >= 1 ? null : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </div>
                            <div>
                                <b>Hình ảnh phụ</b>
                                <Upload
                                    listType="picture-card"
                                    fileList={galleryList}
                                    onPreview={handlePreview}
                                    onRemove={handleRemoveGalleryImage}
                                    beforeUpload={(file) => {
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            message.error('Chỉ chấp nhận file hình ảnh!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        const isLt5M = file.size / 1024 / 1024 < 5;
                                        if (!isLt5M) {
                                            message.error('Hình ảnh không được vượt quá 5MB!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        if (galleryList.length >= 4) {
                                            message.error('Chỉ được tải lên tối đa 4 ảnh phụ!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        setGalleryList((prev) => ([...prev, {
                                            uid: file.uid,
                                            name: file.name,
                                            status: 'done',
                                            url: URL.createObjectURL(file),
                                            originFileObj: file,
                                            type: file.type
                                        }]));
                                        return false;
                                    }}
                                    maxCount={4}
                                >
                                    {galleryList.length >= 4 ? null : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </div>
                            <Modal
                                open={previewVisible}
                                footer={null}
                                onCancel={() => setPreviewVisible(false)}
                            >
                                <img src={previewImage} alt="Preview" style={{ width: '100%' }} />
                            </Modal>
                        </Card>
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
                    <Col span={12}>
                        <Form.Item
                            name={['description', 'ingredients']}
                            label="Thành phần"
                            rules={[{ required: true }]}
                        >
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder="Nhập thành phần"
                                tokenSeparators={[',']}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['description', 'usageInstructions']}
                            label="Hướng dẫn sử dụng"
                            rules={[{ required: true }]}
                        >
                            <TextArea rows={3} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['description', 'expiration']}
                            label="Hạn sử dụng"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Technical Details */}
                <Divider orientation="left">Thông số kỹ thuật</Divider>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name={['technicalDetails', 'sizeOrWeight']}
                            label="Kích thước/Trọng lượng"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['technicalDetails', 'suitableSkinTypes']}
                            label="Loại da phù hợp"
                            rules={[{ required: true }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn loại da phù hợp"
                            >
                                <Option value="normal">Da thường</Option>
                                <Option value="dry">Da khô</Option>
                                <Option value="oily">Da dầu</Option>
                                <Option value="combination">Da hỗn hợp</Option>
                                <Option value="sensitive">Da nhạy cảm</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['technicalDetails', 'origin']}
                            label="Xuất xứ"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['technicalDetails', 'certifications']}
                            label="Chứng nhận"
                            rules={[{ required: true }]}
                        >
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder="Nhập chứng nhận"
                                tokenSeparators={[',']}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* SEO */}
                <Divider orientation="left">SEO</Divider>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name={['seo', 'keywords']}
                            label="Từ khóa"
                            rules={[{ required: true }]}
                        >
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder="Nhập từ khóa"
                                tokenSeparators={[',']}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['seo', 'metaTitle']}
                            label="Meta Title"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name={['seo', 'metaDescription']}
                            label="Meta Description"
                            rules={[{ required: true }]}
                        >
                            <TextArea rows={3} />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Policy */}
                <Divider orientation="left">Chính sách</Divider>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name={['policy', 'shippingReturnWarranty']}
                            label="Chính sách vận chuyển và bảo hành"
                            rules={[{ required: true }]}
                        >
                            <TextArea rows={3} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={['policy', 'additionalOptions']}
                            label="Tùy chọn bổ sung"
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