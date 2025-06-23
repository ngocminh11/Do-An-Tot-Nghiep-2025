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
    Tag
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
    const [fileList, setFileList] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);

    // Thêm các options cho các trường select
    const skinTypes = [
        'Da mụn',
        'Da nhạy cảm',
        'Da khô',
        'Da dầu',
        'Da hỗn hợp',
        'Da thường',
        'Da lão hóa',
        'Da nám',
        'Da mất nước',
        'Da dầu nhạy cảm',
        'Da khô nhạy cảm',
        'Da mụn nhạy cảm',
        'Da dầu mụn',
        'Da khô mụn',
        'Da hỗn hợp thiên dầu',
        'Da hỗn hợp thiên khô',
        'Da nhạy cảm dễ kích ứng',
        'Da bị tổn thương',
        'Da sau điều trị',
        'Da sau phẫu thuật'
    ];

    const units = [
        'Chai',
        'Tuýp',
        'Hộp',
        'Lọ',
        'Bộ',
        'Cái',
        'Gói',
        'ml',
        'g',
        'kg',
        'l',
        'Cặp',
        'Hũ',
        'Túi',
        'Viên',
        'Miếng',
        'Ống',
        'Bình xịt',
        'Bình xịt phun sương',
        'Bình xịt định liều'
    ];

    const certifications = [
        'FDA (Cục Quản lý Thực phẩm và Dược phẩm Hoa Kỳ)',
        'CE (Chứng nhận Châu Âu)',
        'ISO 9001 (Quản lý chất lượng)',
        'ISO 22716 (Sản xuất mỹ phẩm)',
        'GMP (Thực hành sản xuất tốt)',
        'Halal (Chứng nhận Hồi giáo)',
        'Cruelty Free (Không thử nghiệm trên động vật)',
        'Vegan (Thuần chay)',
        'Organic (Hữu cơ)',
        'Made in Vietnam (Sản xuất tại Việt Nam)',
        'Made in Korea (Sản xuất tại Hàn Quốc)',
        'Made in Japan (Sản xuất tại Nhật Bản)',
        'Made in France (Sản xuất tại Pháp)',
        'Made in USA (Sản xuất tại Mỹ)',
        'Made in Germany (Sản xuất tại Đức)',
        'Made in Italy (Sản xuất tại Ý)',
        'Made in Switzerland (Sản xuất tại Thụy Sĩ)',
        'Made in Australia (Sản xuất tại Úc)',
        'Made in UK (Sản xuất tại Anh)',
        'Made in Canada (Sản xuất tại Canada)'
    ];

    const commonIngredients = [
        'Niacinamide (Vitamin B3)',
        'Hyaluronic Acid (Axit Hyaluronic)',
        'Vitamin C (Axit Ascorbic)',
        'Vitamin E (Tocopherol)',
        'Salicylic Acid (Axit Salicylic)',
        'Glycolic Acid (Axit Glycolic)',
        'Retinol (Vitamin A)',
        'Peptide (Peptit)',
        'Ceramide (Xeramit)',
        'Centella Asiatica (Rau má)',
        'Snail Mucin (Dịch ốc sên)',
        'Green Tea Extract (Chiết xuất trà xanh)',
        'Aloe Vera (Nha đam)',
        'Tea Tree Oil (Tinh dầu tràm trà)',
        'Witch Hazel (Cây phỉ)',
        'Chamomile (Hoa cúc)',
        'Calendula (Hoa cúc vạn thọ)',
        'Rose Water (Nước hoa hồng)',
        'Jojoba Oil (Dầu jojoba)',
        'Argan Oil (Dầu argan)',
        'Shea Butter (Bơ hạt mỡ)',
        'Coconut Oil (Dầu dừa)',
        'Olive Oil (Dầu ô liu)',
        'Grape Seed Oil (Dầu hạt nho)',
        'Rosehip Oil (Dầu tầm xuân)',
        'Squalane (Squalan)',
        'BHA (Beta Hydroxy Acid)',
        'AHA (Alpha Hydroxy Acid)',
        'PHA (Poly Hydroxy Acid)',
        'Lactic Acid (Axit Lactic)',
        'Mandelic Acid (Axit Mandelic)',
        'Azelaic Acid (Axit Azelaic)',
        'Kojic Acid (Axit Kojic)',
        'Tranexamic Acid (Axit Tranexamic)',
        'Niacinamide (Vitamin B3)',
        'Panthenol (Vitamin B5)',
        'Niacin (Vitamin B3)',
        'Biotin (Vitamin B7)',
        'Folic Acid (Axit Folic)',
        'Zinc (Kẽm)',
        'Copper (Đồng)',
        'Selenium (Selen)',
        'Magnesium (Magie)',
        'Calcium (Canxi)',
        'Iron (Sắt)',
        'Manganese (Mangan)',
        'Chromium (Crom)',
        'Molybdenum (Molypden)',
        'Iodine (Iốt)',
        'Boron (Bo)'
    ];

    const commonUsageInstructions = [
        'Rửa mặt sạch với sữa rửa mặt',
        'Thoa một lượng vừa đủ lên da',
        'Massage nhẹ nhàng theo chiều kim đồng hồ',
        'Sử dụng 2 lần/ngày (sáng và tối)',
        'Tránh vùng mắt và vùng môi',
        'Thoa kem chống nắng sau khi sử dụng',
        'Không sử dụng khi da đang bị tổn thương',
        'Thử nghiệm trên vùng da nhỏ trước khi sử dụng',
        'Bảo quản nơi khô ráo, thoáng mát',
        'Tránh ánh nắng trực tiếp',
        'Sử dụng sau bước toner',
        'Sử dụng trước bước dưỡng ẩm',
        'Sử dụng sau bước serum',
        'Sử dụng trước bước kem dưỡng',
        'Sử dụng sau bước tẩy tế bào chết',
        'Sử dụng sau bước làm sạch',
        'Sử dụng sau bước cân bằng da',
        'Sử dụng sau bước làm dịu da',
        'Sử dụng sau bước làm sáng da',
        'Sử dụng sau bước làm se khít lỗ chân lông'
    ];

    const expirationOptions = [
        '12 tháng kể từ ngày sản xuất',
        '18 tháng kể từ ngày sản xuất',
        '24 tháng kể từ ngày sản xuất',
        '36 tháng kể từ ngày sản xuất',
        '6 tháng sau khi mở nắp',
        '12 tháng sau khi mở nắp',
        '18 tháng sau khi mở nắp',
        '24 tháng sau khi mở nắp',
        'Không có hạn sử dụng',
        'Xem ngày trên bao bì',
        '3 tháng sau khi mở nắp',
        '9 tháng sau khi mở nắp',
        '15 tháng sau khi mở nắp',
        '21 tháng sau khi mở nắp',
        '30 tháng sau khi mở nắp',
        '48 tháng sau khi mở nắp',
        '60 tháng sau khi mở nắp',
        '72 tháng sau khi mở nắp',
        '84 tháng sau khi mở nắp',
        '96 tháng sau khi mở nắp'
    ];

    const sizeWeightOptions = [
        '30ml',
        '50ml',
        '100ml',
        '150ml',
        '200ml',
        '250ml',
        '300ml',
        '400ml',
        '500ml',
        '30g',
        '50g',
        '100g',
        '150g',
        '200g',
        '250g',
        '300g',
        '400g',
        '500g',
        '1kg',
        '2kg'
    ];

    const commonKeywords = [
        'skincare',
        'dưỡng da',
        'trị mụn',
        'dưỡng ẩm',
        'làm sáng da',
        'chống lão hóa',
        'se khít lỗ chân lông',
        'làm mờ thâm',
        'dưỡng trắng',
        'cấp ẩm',
        'làm dịu da',
        'làm sạch da',
        'tẩy tế bào chết',
        'trị nám',
        'trị thâm',
        'trị sẹo',
        'trị mụn đầu đen',
        'trị mụn đầu trắng',
        'trị mụn viêm',
        'trị mụn bọc',
        'trị mụn ẩn',
        'trị mụn cám',
        'trị mụn trứng cá',
        'trị mụn bọc mủ',
        'trị mụn bọc viêm',
        'trị mụn bọc sưng',
        'trị mụn bọc đỏ',
        'trị mụn bọc đau',
        'trị mụn bọc ngứa',
        'trị mụn bọc rát'
    ];

    const shippingReturnOptions = [
        'Miễn phí vận chuyển toàn quốc',
        'Miễn phí vận chuyển cho đơn từ 500k',
        'Miễn phí vận chuyển cho đơn từ 1 triệu',
        'Miễn phí vận chuyển cho đơn từ 2 triệu',
        'Miễn phí vận chuyển cho đơn từ 3 triệu',
        'Miễn phí vận chuyển cho đơn từ 5 triệu',
        'Đổi trả trong 7 ngày',
        'Đổi trả trong 14 ngày',
        'Đổi trả trong 30 ngày',
        'Hoàn tiền 100% nếu không hài lòng',
        'Bảo hành chính hãng 12 tháng',
        'Bảo hành chính hãng 24 tháng',
        'Bảo hành chính hãng 36 tháng',
        'Hỗ trợ đổi size',
        'Hỗ trợ đổi màu',
        'Không áp dụng đổi trả với sản phẩm đã mở',
        'Không áp dụng đổi trả với sản phẩm đã sử dụng',
        'Không áp dụng đổi trả với sản phẩm đã hết hạn',
        'Không áp dụng đổi trả với sản phẩm đã hỏng',
        'Không áp dụng đổi trả với sản phẩm đã mất tem'
    ];

    const additionalOptions = [
        'Tặng kèm sản phẩm dùng thử',
        'Tặng kèm quà tặng sinh nhật',
        'Tặng kèm voucher giảm giá',
        'Tặng kèm hộp đựng sản phẩm',
        'Tặng kèm hướng dẫn sử dụng',
        'Tặng kèm bông tẩy trang',
        'Tặng kèm khăn mặt',
        'Tặng kèm bàn chải',
        'Tặng kèm túi đựng',
        'Tặng kèm sổ tay',
        'Tặng kèm bút',
        'Tặng kèm móc khóa',
        'Tặng kèm thẻ thành viên',
        'Tặng kèm thẻ tích điểm',
        'Tặng kèm thẻ giảm giá',
        'Tặng kèm thẻ quà tặng',
        'Tặng kèm thẻ khách hàng thân thiết',
        'Tặng kèm thẻ VIP',
        'Tặng kèm thẻ hội viên',
        'Tặng kèm thẻ thành viên vàng'
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await productService.getProductById(id);

                if (!response || !response.data) {
                    throw new Error('Không thể lấy thông tin sản phẩm');
                }

                const product = response.data;

                // Xử lý media files
                if (product.mediaFiles && product.mediaFiles.images) {
                    const mediaFiles = product.mediaFiles.images.map((file, index) => ({
                        uid: `-${index}`,
                        name: file.filename || `image-${index}`,
                        status: 'done',
                        url: file.path,
                        type: file.mimetype
                    }));
                    setFileList(mediaFiles);
                }

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
                        brand: product.basicInformation?.brand || '',
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
            try {
                setLoadingCategories(true);
                const response = await categoryService.getAllCategories();
                if (response && response.data && response.data.data) {
                    const categoriesData = response.data.data.map(cat => ({
                        ...cat,
                        _id: String(cat._id),
                        name: cat.name || 'Unnamed Category'
                    }));
                    setCategories(categoriesData);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                message.error('Không thể tải danh mục sản phẩm');
            } finally {
                setLoadingCategories(false);
            }
        };

        const fetchTags = async () => {
            try {
                setLoadingTags(true);
                const response = await tagService.getAllTags();
                if (response && response.data && response.data.data) {
                    const tagsData = response.data.data.map(tag => ({
                        ...tag,
                        _id: String(tag._id),
                        name: tag.name || 'Unnamed Tag'
                    }));
                    setTags(tagsData);
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
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
                    brand: values.basicInformation.brand,
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
        <div className="edit-product" style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
            <Card style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(25,118,210,0.07)', border: '1.5px solid #e3f2fd', marginBottom: 32 }}>
                <h1 style={{ color: '#1976d2', fontWeight: 700 }}>Cập nhật sản phẩm</h1>
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Thông tin cơ bản</Divider>
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

                    <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Giá và tồn kho</Divider>
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

                    <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Hình ảnh</Divider>
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

                    <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Mô tả sản phẩm</Divider>
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
                                    options={commonIngredients.map(ingredient => ({
                                        label: ingredient,
                                        value: ingredient
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name={['description', 'usageInstructions']}
                                label="Hướng dẫn sử dụng"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    mode="tags"
                                    style={{ width: '100%' }}
                                    placeholder="Nhập hướng dẫn sử dụng"
                                    tokenSeparators={[',']}
                                    options={commonUsageInstructions.map(instruction => ({
                                        label: instruction,
                                        value: instruction
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name={['description', 'expiration']}
                                label="Hạn sử dụng"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    placeholder="Chọn hạn sử dụng"
                                    options={expirationOptions.map(option => ({
                                        label: option,
                                        value: option
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Thông số kỹ thuật</Divider>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name={['technicalDetails', 'sizeOrWeight']}
                                label="Kích thước/Trọng lượng"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    placeholder="Chọn kích thước/trọng lượng"
                                    options={sizeWeightOptions.map(option => ({
                                        label: option,
                                        value: option
                                    }))}
                                />
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
                                    options={skinTypes.map(type => ({
                                        label: type,
                                        value: type
                                    }))}
                                />
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
                                    mode="multiple"
                                    style={{ width: '100%' }}
                                    placeholder="Chọn chứng nhận"
                                    options={certifications.map(cert => ({
                                        label: cert,
                                        value: cert
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>SEO</Divider>
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
                                    options={commonKeywords.map(keyword => ({
                                        label: keyword,
                                        value: keyword
                                    }))}
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

                    <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Chính sách</Divider>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name={['policy', 'shippingReturnWarranty']}
                                label="Chính sách vận chuyển và bảo hành"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    mode="multiple"
                                    style={{ width: '100%' }}
                                    placeholder="Chọn chính sách"
                                    options={shippingReturnOptions.map(option => ({
                                        label: option,
                                        value: option
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name={['policy', 'additionalOptions']}
                                label="Tùy chọn bổ sung"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    mode="multiple"
                                    style={{ width: '100%' }}
                                    placeholder="Chọn tùy chọn bổ sung"
                                    options={additionalOptions.map(option => ({
                                        label: option,
                                        value: option
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ borderRadius: 24, background: '#1976d2', borderColor: '#1976d2', fontWeight: 600, minWidth: 140 }}>Cập nhật sản phẩm</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditProduct;