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
    Modal,
    Space
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadOutlined, PlusOutlined, PlusCircleOutlined } from '@ant-design/icons';
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
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [isTagModalVisible, setIsTagModalVisible] = useState(false);
    const [categoryForm] = Form.useForm();
    const [tagForm] = Form.useForm();
    const [addingCategory, setAddingCategory] = useState(false);
    const [addingTag, setAddingTag] = useState(false);

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

    // Hàm thêm danh mục mới
    const handleAddCategory = async (values) => {
        try {
            setAddingCategory(true);
            const newCategory = await categoryService.createCategory({
                name: values.name,
                description: values.description,
                status: 'active'
            });

            if (newCategory) {
                setCategories(prev => [...prev, newCategory]);
                message.success('Thêm danh mục thành công!');
                setIsCategoryModalVisible(false);
                categoryForm.resetFields();

                // Tự động chọn danh mục mới vừa tạo
                const currentCategoryIds = form.getFieldValue(['basicInformation', 'categoryIds']) || [];
                form.setFieldsValue({
                    basicInformation: {
                        ...form.getFieldValue('basicInformation'),
                        categoryIds: [...currentCategoryIds, newCategory._id]
                    }
                });
            }
        } catch (error) {
            message.error(error.message || 'Thêm danh mục thất bại!');
        } finally {
            setAddingCategory(false);
        }
    };

    // Hàm thêm tag mới
    const handleAddTag = async (values) => {
        try {
            setAddingTag(true);
            const newTag = await tagService.createTag({
                name: values.name,
                description: values.description,
                status: 'active'
            });

            if (newTag) {
                setTags(prev => [...prev, newTag]);
                message.success('Thêm tag thành công!');
                setIsTagModalVisible(false);
                tagForm.resetFields();

                // Tự động chọn tag mới vừa tạo
                const currentTagIds = form.getFieldValue(['basicInformation', 'tagIds']) || [];
                form.setFieldsValue({
                    basicInformation: {
                        ...form.getFieldValue('basicInformation'),
                        tagIds: [...currentTagIds, newTag._id]
                    }
                });
            }
        } catch (error) {
            message.error(error.message || 'Thêm tag thất bại!');
        } finally {
            setAddingTag(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
                <p>Đang tải thông tin sản phẩm...</p>
            </div>
        );
    }

    return (
        <div className="edit-product-container">
            <div className="page-header">
                <h1>Chỉnh sửa sản phẩm</h1>
                <p>Cập nhật thông tin chi tiết của sản phẩm</p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleFinish} className="product-form">
                {/* Basic Information */}
                <div className="form-section">
                    <Divider orientation="left" className="section-divider">
                        Thông tin cơ bản
                    </Divider>
                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="idProduct"
                                label="Mã sản phẩm"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Input disabled size="large" className="form-input" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['basicInformation', 'productName']}
                                label="Tên sản phẩm"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Input size="large" className="form-input" placeholder="Nhập tên sản phẩm" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['basicInformation', 'sku']}
                                label="SKU"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Input size="large" className="form-input" placeholder="Nhập mã SKU" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={["basicInformation", "brand"]}
                                label="Thương hiệu (Mặc định: CoCo)"
                                tooltip="Thương hiệu này không thể thay đổi, mặc định là CoCo"
                                className="form-item"
                            >
                                <Input value="CoCo" disabled placeholder="CoCo" size="large" className="form-input" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['basicInformation', 'categoryIds']}
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất một danh mục' }]}
                                className="form-item"
                            >
                                <div className="select-with-icon">
                                    <Select
                                        mode="multiple"
                                        placeholder="Chọn danh mục"
                                        loading={loadingCategories}
                                        optionFilterProp="children"
                                        showSearch
                                        className="form-select"
                                        size="large"
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
                                    <Button
                                        type="dashed"
                                        icon={<PlusCircleOutlined />}
                                        onClick={() => setIsCategoryModalVisible(true)}
                                        title="Thêm danh mục mới"
                                        size="large"
                                        className="add-button"
                                    />
                                </div>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['basicInformation', 'tagIds']}
                                label="Tags"
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất một tag' }]}
                                className="form-item"
                            >
                                <div className="select-with-icon">
                                    <Select
                                        mode="multiple"
                                        placeholder="Chọn tags"
                                        loading={loadingTags}
                                        optionFilterProp="children"
                                        showSearch
                                        className="form-select"
                                        size="large"
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
                                    <Button
                                        type="dashed"
                                        icon={<PlusCircleOutlined />}
                                        onClick={() => setIsTagModalVisible(true)}
                                        title="Thêm tag mới"
                                        size="large"
                                        className="add-button"
                                    />
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* Pricing and Inventory */}
                <div className="form-section">
                    <Divider orientation="left" className="section-divider">
                        Giá và tồn kho
                    </Divider>
                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name={['pricingAndInventory', 'originalPrice']}
                                label="Giá gốc"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <InputNumber
                                    min={0}
                                    className="form-input-number"
                                    placeholder="Nhập giá gốc"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name={['pricingAndInventory', 'salePrice']}
                                label="Giá bán"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <InputNumber
                                    min={0}
                                    className="form-input-number"
                                    placeholder="Nhập giá bán"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name={['pricingAndInventory', 'stockQuantity']}
                                label="Số lượng tồn kho"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <InputNumber min={0} className="form-input-number" placeholder="Nhập số lượng" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name={['pricingAndInventory', 'unit']}
                                label="Đơn vị"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Input size="large" className="form-input" placeholder="Ví dụ: cái, hộp, chai" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name={['pricingAndInventory', 'currency']}
                                label="Đơn vị tiền tệ"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Select defaultValue="VND" className="form-select" size="large">
                                    <Option value="VND">VND</Option>
                                    <Option value="USD">USD</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* Media */}
                <div className="form-section">
                    <Divider orientation="left" className="section-divider">
                        Hình ảnh
                    </Divider>
                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={12}>
                            <Card bordered={false} className="media-card">
                                <div className="media-section">
                                    <h4>Hình ảnh chính</h4>
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
                                            }]);
                                            return false;
                                        }}
                                        maxCount={1}
                                    >
                                        {mainImageList.length < 1 && (
                                            <div className="upload-button">
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>Tải lên</div>
                                            </div>
                                        )}
                                    </Upload>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card bordered={false} className="media-card">
                                <div className="media-section">
                                    <h4>Thư viện ảnh</h4>
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
                                            const newFile = {
                                                uid: file.uid,
                                                name: file.name,
                                                status: 'done',
                                                url: URL.createObjectURL(file),
                                                originFileObj: file,
                                            };
                                            setGalleryList(prev => [...prev, newFile]);
                                            return false;
                                        }}
                                        maxCount={10}
                                    >
                                        {galleryList.length < 10 && (
                                            <div className="upload-button">
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>Tải lên</div>
                                            </div>
                                        )}
                                    </Upload>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Description */}
                <div className="form-section">
                    <Divider orientation="left" className="section-divider">
                        Mô tả sản phẩm
                    </Divider>
                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['description', 'shortDescription']}
                                label="Mô tả ngắn"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <TextArea
                                    rows={4}
                                    className="form-textarea"
                                    placeholder="Mô tả ngắn gọn về sản phẩm"
                                    maxLength={200}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['description', 'ingredients']}
                                label="Thành phần"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <TextArea
                                    rows={4}
                                    className="form-textarea"
                                    placeholder="Liệt kê các thành phần chính"
                                    maxLength={300}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name={['description', 'detailedDescription']}
                                label="Mô tả chi tiết"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <TextArea
                                    rows={6}
                                    className="form-textarea"
                                    placeholder="Mô tả chi tiết về sản phẩm, tính năng, lợi ích..."
                                    maxLength={1000}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['description', 'usageInstructions']}
                                label="Hướng dẫn sử dụng"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <TextArea
                                    rows={4}
                                    className="form-textarea"
                                    placeholder="Hướng dẫn cách sử dụng sản phẩm"
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['description', 'expiration']}
                                label="Hạn sử dụng"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Input size="large" className="form-input" placeholder="Ví dụ: 24 tháng kể từ ngày sản xuất" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* Technical Details */}
                <div className="form-section">
                    <Divider orientation="left" className="section-divider">
                        Thông tin kỹ thuật
                    </Divider>
                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['technicalDetails', 'sizeOrWeight']}
                                label="Kích thước/Trọng lượng"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Input size="large" className="form-input" placeholder="Ví dụ: 100ml, 50g" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['technicalDetails', 'suitableSkinTypes']}
                                label="Loại da phù hợp"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Select
                                    mode="tags"
                                    className="form-select"
                                    size="large"
                                    placeholder="Chọn loại da phù hợp"
                                    tokenSeparators={[',']}
                                >
                                    <Option value="da khô">Da khô</Option>
                                    <Option value="da dầu">Da dầu</Option>
                                    <Option value="da hỗn hợp">Da hỗn hợp</Option>
                                    <Option value="da nhạy cảm">Da nhạy cảm</Option>
                                    <Option value="mọi loại da">Mọi loại da</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['technicalDetails', 'origin']}
                                label="Xuất xứ"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Input size="large" className="form-input" placeholder="Ví dụ: Việt Nam, Hàn Quốc" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['technicalDetails', 'certifications']}
                                label="Chứng nhận"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Select
                                    mode="tags"
                                    className="form-select"
                                    size="large"
                                    placeholder="Nhập chứng nhận"
                                    tokenSeparators={[',']}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* SEO */}
                <div className="form-section">
                    <Divider orientation="left" className="section-divider">
                        SEO
                    </Divider>
                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['seo', 'keywords']}
                                label="Từ khóa"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Select
                                    mode="tags"
                                    className="form-select"
                                    size="large"
                                    placeholder="Nhập từ khóa"
                                    tokenSeparators={[',']}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['seo', 'metaTitle']}
                                label="Meta Title"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <Input size="large" className="form-input" placeholder="Tiêu đề SEO" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name={['seo', 'metaDescription']}
                                label="Meta Description"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <TextArea
                                    rows={3}
                                    className="form-textarea"
                                    placeholder="Mô tả SEO cho công cụ tìm kiếm"
                                    maxLength={160}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* Policy */}
                <div className="form-section">
                    <Divider orientation="left" className="section-divider">
                        Chính sách
                    </Divider>
                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['policy', 'shippingReturnWarranty']}
                                label="Chính sách vận chuyển và bảo hành"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <TextArea
                                    rows={4}
                                    className="form-textarea"
                                    placeholder="Mô tả chính sách vận chuyển và bảo hành"
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['policy', 'additionalOptions']}
                                label="Tùy chọn bổ sung"
                                rules={[{ required: true }]}
                                className="form-item"
                            >
                                <TextArea
                                    rows={4}
                                    className="form-textarea"
                                    placeholder="Các tùy chọn bổ sung khác"
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <div className="form-actions">
                    <Button type="primary" htmlType="submit" size="large" className="submit-button">
                        Cập nhật sản phẩm
                    </Button>
                    <Button
                        onClick={() => navigate('/admin/products')}
                        size="large"
                        className="cancel-button"
                    >
                        Hủy
                    </Button>
                </div>
            </Form>

            {/* Modal thêm danh mục mới */}
            <Modal
                title="Thêm danh mục mới"
                open={isCategoryModalVisible}
                onCancel={() => {
                    setIsCategoryModalVisible(false);
                    categoryForm.resetFields();
                }}
                footer={null}
                className="custom-modal"
            >
                <Form
                    form={categoryForm}
                    layout="vertical"
                    onFinish={handleAddCategory}
                    className="modal-form"
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên danh mục!' },
                            { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' },
                            { max: 100, message: 'Tên danh mục không được vượt quá 100 ký tự!' }
                        ]}
                        className="form-item"
                    >
                        <Input placeholder="Nhập tên danh mục" size="large" className="form-input" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            { max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' }
                        ]}
                        className="form-item"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập mô tả danh mục (không bắt buộc)"
                            maxLength={500}
                            showCount
                            className="form-textarea"
                        />
                    </Form.Item>
                    <Form.Item className="modal-actions">
                        <Space>
                            <Button type="primary" htmlType="submit" loading={addingCategory} size="large">
                                Thêm danh mục
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsCategoryModalVisible(false);
                                    categoryForm.resetFields();
                                }}
                                size="large"
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal thêm tag mới */}
            <Modal
                title="Thêm tag mới"
                open={isTagModalVisible}
                onCancel={() => {
                    setIsTagModalVisible(false);
                    tagForm.resetFields();
                }}
                footer={null}
                className="custom-modal"
            >
                <Form
                    form={tagForm}
                    layout="vertical"
                    onFinish={handleAddTag}
                    className="modal-form"
                >
                    <Form.Item
                        name="name"
                        label="Tên tag"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên tag!' },
                            { min: 2, message: 'Tên tag phải có ít nhất 2 ký tự!' },
                            { max: 50, message: 'Tên tag không được vượt quá 50 ký tự!' }
                        ]}
                        className="form-item"
                    >
                        <Input placeholder="Nhập tên tag" size="large" className="form-input" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            { max: 200, message: 'Mô tả không được vượt quá 200 ký tự!' }
                        ]}
                        className="form-item"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập mô tả tag (không bắt buộc)"
                            maxLength={200}
                            showCount
                            className="form-textarea"
                        />
                    </Form.Item>
                    <Form.Item className="modal-actions">
                        <Space>
                            <Button type="primary" htmlType="submit" loading={addingTag} size="large">
                                Thêm tag
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsTagModalVisible(false);
                                    tagForm.resetFields();
                                }}
                                size="large"
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EditProduct;