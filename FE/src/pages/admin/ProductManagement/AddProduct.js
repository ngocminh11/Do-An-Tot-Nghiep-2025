import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Row,
  Col,
  Card,
  Divider,
  message,
  Modal,
  Space
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import tagService from '../../../services/tagService';
import { useNavigate } from 'react-router-dom';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

const STORAGE_KEY = 'product_form_draft';

const AddProduct = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);

  // Thêm hàm tạo SKU từ tên sản phẩm
  const generateSKU = (productName) => {
    if (!productName) return '';
    // Chuyển đổi tên sản phẩm thành SKU
    const sku = productName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
      .replace(/[^a-z0-9]/g, '-') // Thay thế ký tự đặc biệt bằng dấu gạch ngang
      .replace(/-+/g, '-') // Loại bỏ dấu gạch ngang liên tiếp
      .replace(/^-|-$/g, ''); // Loại bỏ dấu gạch ngang ở đầu và cuối
    return sku;
  };

  // Thêm các validation rules
  const productNameRules = [
    { required: true, message: 'Vui lòng nhập tên sản phẩm' },
    { min: 2, message: 'Tên sản phẩm phải có ít nhất 2 ký tự' },
    { max: 200, message: 'Tên sản phẩm không được vượt quá 200 ký tự' }
  ];

  const skuRules = [
    { required: false, message: 'Vui lòng nhập mã SKU' },
    { pattern: /^[a-z0-9-]+$/, message: 'SKU chỉ được chứa chữ cái thường, số và dấu gạch ngang' },
    { min: 3, message: 'SKU phải có ít nhất 3 ký tự' },
    { max: 50, message: 'SKU không được vượt quá 50 ký tự' }
  ];

  const priceRules = [
    { required: true, message: 'Vui lòng nhập giá' },
    { type: 'number', min: 0, message: 'Giá không được âm' }
  ];

  const stockRules = [
    { required: true, message: 'Vui lòng nhập số lượng tồn kho' },
    { type: 'number', min: 0, message: 'Số lượng không được âm' }
  ];

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
    'Da mụn nhạy cảm'
  ];

  const units = [
    'bottle',
    'tube',
    'jar',
    'box',
    'set',
    'piece',
    'pack',
    'ml',
    'g',
    'kg',
    'l',
    'pair'
  ];

  const certifications = [
    'FDA',
    'CE',
    'ISO 9001',
    'ISO 22716',
    'GMP',
    'Halal',
    'Cruelty Free',
    'Vegan',
    'Organic',
    'Made in Vietnam',
    'Made in Korea',
    'Made in Japan'
  ];

  const commonIngredients = [
    'Niacinamide',
    'Hyaluronic Acid',
    'Vitamin C',
    'Vitamin E',
    'Salicylic Acid',
    'Glycolic Acid',
    'Retinol',
    'Peptide',
    'Ceramide',
    'Centella Asiatica',
    'Snail Mucin',
    'Green Tea Extract'
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
    'Tránh ánh nắng trực tiếp'
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
    'Xem ngày trên bao bì'
  ];

  const sizeWeightOptions = [
    '30ml',
    '50ml',
    '100ml',
    '150ml',
    '200ml',
    '30g',
    '50g',
    '100g',
    '150g',
    '200g'
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
    'cấp ẩm'
  ];

  const shippingReturnOptions = [
    'Miễn phí vận chuyển toàn quốc',
    'Miễn phí vận chuyển cho đơn từ 500k',
    'Đổi trả trong 7 ngày',
    'Đổi trả trong 14 ngày',
    'Đổi trả trong 30 ngày',
    'Hoàn tiền 100% nếu không hài lòng',
    'Bảo hành chính hãng 12 tháng',
    'Hỗ trợ đổi size',
    'Hỗ trợ đổi màu',
    'Không áp dụng đổi trả với sản phẩm đã mở'
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
    'Tặng kèm sổ tay'
  ];

  // Hàm lưu form data vào localStorage
  const saveFormDraft = (values) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      setHasDraft(true);
    } catch (error) {
      console.error('Error saving form draft:', error);
    }
  };

  // Hàm xóa form draft
  const clearFormDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
  };

  // Hàm load form draft
  const loadFormDraft = () => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        form.setFieldsValue(parsedDraft);
        setHasDraft(true);
      }
    } catch (error) {
      console.error('Error loading form draft:', error);
    }
  };

  // Kiểm tra và load draft khi component mount
  useEffect(() => {
    loadFormDraft();
  }, []);

  // Lưu form data khi có thay đổi
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const formValues = form.getFieldsValue();
      if (Object.keys(formValues).length > 0) {
        saveFormDraft(formValues);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await categoryService.getAllCategories();
        if (response && response.data && response.data.data) {
          setCategories(response.data.data);
        } else {
          setCategories([]);
          message.error('Không thể tải danh mục sản phẩm');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Không thể tải danh mục sản phẩm');
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await productService.getAllBrands();
        setBrands(response.data || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
        message.error('Không thể tải danh sách thương hiệu');
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const response = await tagService.getAllTags();
        if (response && response.data && response.data.data) {
          setTags(response.data.data);
        } else {
          setTags([]);
          message.error('Không thể tải danh sách tags');
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        message.error('Không thể tải danh sách tags');
        setTags([]);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      console.log('Form values:', values);

      // Validate images
      if (!values.media?.mainImage?.[0]?.originFileObj) {
        throw new Error('Vui lòng tải lên ảnh chính cho sản phẩm');
      }

      const mainImage = values.media.mainImage[0];
      const galleryImages = values.media.galleryImages || [];

      // Validate total images
      if (galleryImages.length > 5) {
        throw new Error('Tối đa chỉ được tải lên 5 ảnh gallery');
      }

      // Validate total size
      const totalSize = [mainImage, ...galleryImages].reduce((sum, file) => sum + file.originFileObj.size, 0);
      if (totalSize > 30 * 1024 * 1024) {
        throw new Error('Tổng kích thước ảnh không được vượt quá 30MB');
      }

      // Format data
      const basicInformation = {
        productName: values.basicInformation.productName,
        sku: values.basicInformation.sku,
        status: 'active',
        brand: values.basicInformation.brand,
        categoryIds: values.basicInformation.categoryIds || [],
        tagIds: values.basicInformation.tagIds || []
      };

      const pricingAndInventory = {
        originalPrice: Number(values.pricingAndInventory.originalPrice),
        salePrice: Number(values.pricingAndInventory.salePrice),
        currency: 'VND',
        stockQuantity: Number(values.pricingAndInventory.stockQuantity),
        unit: values.pricingAndInventory.unit
      };

      const description = {
        shortDescription: values.description.shortDescription,
        detailedDescription: values.description.detailedDescription,
        features: values.description.features || [],
        ingredients: values.description.ingredients || [],
        usageInstructions: values.description.usageInstructions || '',
        expiration: values.description.expiration || ''
      };

      const technicalDetails = {
        specifications: values.technicalDetails.specifications || [],
        dimensions: values.technicalDetails.dimensions || {},
        weight: values.technicalDetails.weight || {},
        sizeOrWeight: values.technicalDetails.sizeOrWeight || '',
        suitableSkinTypes: values.technicalDetails.suitableSkinTypes || [],
        origin: values.technicalDetails.origin || '',
        certifications: values.technicalDetails.certifications || []
      };

      const seo = {
        metaTitle: values.seo.metaTitle || '',
        metaDescription: values.seo.metaDescription || '',
        keywords: values.seo.keywords || [],
        urlSlug: values.seo.urlSlug || ''
      };

      const policy = {
        warranty: values.policy.warranty || '',
        returnPolicy: values.policy.returnPolicy || '',
        shippingPolicy: values.policy.shippingPolicy || '',
        additionalOptions: values.policy.additionalOptions || '',
        shippingReturnWarranty: values.policy.shippingReturnWarranty || ''
      };

      // Create FormData
      const formData = new FormData();

      // Add all images to a single field
      formData.append('images', mainImage.originFileObj);
      galleryImages.forEach(image => {
        formData.append('images', image.originFileObj);
      });

      // Add other data as JSON strings
      formData.append('basicInformation', JSON.stringify(basicInformation));
      formData.append('pricingAndInventory', JSON.stringify(pricingAndInventory));
      formData.append('description', JSON.stringify(description));
      formData.append('technicalDetails', JSON.stringify(technicalDetails));
      formData.append('seo', JSON.stringify(seo));
      formData.append('policy', JSON.stringify(policy));

      // Debug FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await productService.createProduct(formData);
      console.log('Product created successfully:', response);
      message.success('Thêm sản phẩm thành công!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      message.error(error.message || 'Có lỗi xảy ra khi thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng muốn xóa draft
  const handleClearDraft = () => {
    Modal.confirm({
      title: 'Xóa bản nháp',
      content: 'Bạn có chắc chắn muốn xóa bản nháp này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        clearFormDraft();
        form.resetFields();
        message.success('Đã xóa bản nháp');
      }
    });
  };

  return (
    <div className="add-product-container">
      <Card title="Thêm sản phẩm mới" className="add-product-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          scrollToFirstError
          initialValues={{
            description: {
              ingredients: [],
              usageInstructions: '',
              expiration: ''
            },
            technicalDetails: {
              sizeOrWeight: '',
              suitableSkinTypes: [],
              origin: '',
              certifications: []
            },
            seo: {
              keywords: [],
              metaTitle: '',
              metaDescription: '',
              urlSlug: ''
            },
            policy: {
              additionalOptions: '',
              shippingReturnWarranty: ''
            }
          }}
        >
          {/* Thông tin cơ bản */}
          <Divider orientation="left">Thông tin cơ bản</Divider>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name={['basicInformation', 'productName']}
                label="Tên sản phẩm"
                rules={productNameRules}
                tooltip="Tên sản phẩm phải là duy nhất trong hệ thống"
              >
                <Input
                  placeholder="Acne Clear Gel"
                  onChange={(e) => {
                    const sku = generateSKU(e.target.value);
                    form.setFieldsValue({
                      basicInformation: {
                        ...form.getFieldValue('basicInformation'),
                        sku: sku
                      }
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['basicInformation', 'sku']}
                label="SKU"
                rules={skuRules}
                tooltip="Mã SKU sẽ được tự động tạo từ tên sản phẩm, bạn có thể chỉnh sửa. SKU phải là duy nhất và chỉ chứa chữ cái thường, số và dấu gạch ngang"
              >
                <Input
                  placeholder="acne-clear-gel"
                  onChange={(e) => {
                    // Chuyển đổi input thành chữ thường và chỉ cho phép các ký tự hợp lệ
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    form.setFieldsValue({
                      basicInformation: {
                        ...form.getFieldValue('basicInformation'),
                        sku: value
                      }
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['basicInformation', 'brand']}
                label="Thương hiệu"
                rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}
                tooltip="Chọn hoặc nhập tên thương hiệu sản phẩm"
              >
                <Select
                  showSearch
                  placeholder="Chọn hoặc nhập thương hiệu"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {brands.map(brand => (
                    <Option key={brand} value={brand}>{brand}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['basicInformation', 'categoryIds']}
                label="Danh mục sản phẩm"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                tooltip="Chọn ít nhất một danh mục cho sản phẩm"
              >
                <Select
                  mode="multiple"
                  allowClear
                  loading={loadingCategories}
                  placeholder="Chọn danh mục"
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
                tooltip="Chọn hoặc thêm tags cho sản phẩm"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn hoặc nhập tags"
                  allowClear
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
            <Form.Item name={['basicInformation', 'status']} hidden>
              <Input />
            </Form.Item>
          </Row>

          {/* Giá và Tồn kho */}
          <Divider orientation="left">Giá sản phẩm và tồn kho</Divider>
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                name={['pricingAndInventory', 'originalPrice']}
                label="Giá gốc"
                rules={priceRules}
                tooltip="Giá gốc của sản phẩm trước khi giảm giá"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="500000"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['pricingAndInventory', 'salePrice']}
                label="Giá bán/Ưu đãi"
                rules={priceRules}
                tooltip="Giá bán cuối cùng cho khách hàng, phải nhỏ hơn hoặc bằng giá gốc"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="450000"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['pricingAndInventory', 'stockQuantity']}
                label="Tồn kho"
                rules={stockRules}
                tooltip="Số lượng sản phẩm hiện có trong kho"
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="150" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['pricingAndInventory', 'unit']}
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
                tooltip="Đơn vị tính của sản phẩm (ví dụ: chai, hộp, ml, g)"
              >
                <Select
                  showSearch
                  placeholder="Chọn hoặc nhập đơn vị"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {units.map(unit => (
                    <Option key={unit} value={unit}>{unit}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Form.Item name={['pricingAndInventory', 'currency']} hidden>
              <Input />
            </Form.Item>
          </Row>

          {/* Media */}
          <Divider orientation="left">Hình ảnh</Divider>
          <Row gutter={24}>
            <Col span={12}>
              <Card bordered={false} bodyStyle={{ padding: 0 }}>
                <Form.Item
                  label="Hình ảnh chính"
                  name={['media', 'mainImage']}
                  rules={[{ required: true, message: 'Vui lòng tải hình ảnh chính' }]}
                  tooltip="Hình ảnh chính của sản phẩm, kích thước tối đa 5MB"
                  valuePropName="fileList"
                  getValueFromEvent={e => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                >
                  <Upload
                    listType="picture-card"
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
                      return false;
                    }}
                    maxCount={1}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} bodyStyle={{ padding: 0 }}>
                <Form.Item
                  label="Thư viện ảnh"
                  name={['media', 'galleryImages']}
                  tooltip="Tối đa 5 ảnh phụ, mỗi ảnh không quá 5MB, tổng dung lượng không quá 30MB"
                  valuePropName="fileList"
                  getValueFromEvent={e => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                >
                  <Upload
                    listType="picture-card"
                    multiple
                    maxCount={5}
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
                      return false;
                    }}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Mô tả sản phẩm */}
          <Divider orientation="left">Mô tả sản phẩm</Divider>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name={['description', 'shortDescription']}
                label="Mô tả ngắn"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả ngắn' },
                  { max: 200, message: 'Mô tả ngắn không được vượt quá 200 ký tự' }
                ]}
                tooltip="Mô tả ngắn gọn về sản phẩm, tối đa 200 ký tự"
              >
                <TextArea
                  rows={3}
                  maxLength={200}
                  showCount
                  placeholder="Kem trị mụn & trị nám giúp làm sạch, ngăn ngừa mụn và giảm thâm nám, phù hợp với da mụn, da nhạy cảm."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['description', 'detailedDescription']}
                label="Mô tả chi tiết"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả chi tiết' },
                  { max: 3000, message: 'Mô tả chi tiết không được vượt quá 3000 ký tự' }
                ]}
                tooltip="Mô tả chi tiết về công dụng và đặc điểm của sản phẩm, tối đa 3000 ký tự"
              >
                <TextArea
                  rows={3}
                  maxLength={3000}
                  showCount
                  placeholder="Sản phẩm được chiết xuất từ các thành phần tự nhiên, hỗ trợ điều trị mụn và làm mờ vết nám."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['description', 'features']}
                label="Đặc điểm"
                rules={[
                  { required: true, message: 'Vui lòng nhập đặc điểm sản phẩm' },
                  { max: 1000, message: 'Danh sách đặc điểm không được vượt quá 1000 ký tự' }
                ]}
                tooltip="Liệt kê các đặc điểm chính của sản phẩm, phân cách bằng dấu phẩy"
              >
                <TextArea
                  rows={2}
                  maxLength={1000}
                  showCount
                  placeholder="Trà xanh, Cam thảo, Chiết xuất tràm trà, Vitamin E, và các thành phần tự nhiên khác"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['description', 'ingredients']}
                label="Thành phần"
                rules={[
                  { required: true, message: 'Vui lòng nhập thành phần sản phẩm' }
                ]}
                tooltip="Liệt kê các thành phần chính của sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập thành phần"
                  allowClear
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
                rules={[
                  { required: true, message: 'Vui lòng nhập hướng dẫn sử dụng' }
                ]}
                tooltip="Hướng dẫn chi tiết cách sử dụng sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập hướng dẫn sử dụng"
                  allowClear
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
                label="Ngày hết hạn"
                rules={[
                  { required: true, message: 'Vui lòng nhập thời hạn sử dụng' }
                ]}
                tooltip="Thời hạn sử dụng của sản phẩm"
              >
                <Select
                  placeholder="Chọn thời hạn sử dụng"
                  allowClear
                  options={expirationOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông số kỹ thuật */}
          <Divider orientation="left">Thông số kỹ thuật</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name={['technicalDetails', 'sizeOrWeight']}
                label="Kích thước / Trọng lượng"
                rules={[
                  { required: true, message: 'Vui lòng nhập kích thước hoặc trọng lượng' }
                ]}
                tooltip="Ví dụ: 30ml, 50g, 100ml"
              >
                <Select
                  placeholder="Chọn kích thước/trọng lượng"
                  allowClear
                  options={sizeWeightOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['technicalDetails', 'suitableSkinTypes']}
                label="Loại da phù hợp"
                rules={[
                  { required: true, message: 'Vui lòng chọn loại da phù hợp' }
                ]}
                tooltip="Chọn các loại da phù hợp với sản phẩm"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn loại da"
                  allowClear
                  options={skinTypes.map(type => ({
                    label: type,
                    value: type
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['technicalDetails', 'origin']}
                label="Xuất xứ"
                rules={[
                  { required: true, message: 'Vui lòng nhập xuất xứ' },
                  { max: 100, message: 'Xuất xứ không được vượt quá 100 ký tự' }
                ]}
                tooltip="Nước sản xuất sản phẩm"
              >
                <Input placeholder="VietNam" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['technicalDetails', 'certifications']}
                label="Chứng nhận chất lượng"
                tooltip="Chọn các chứng nhận chất lượng của sản phẩm"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn chứng nhận"
                  allowClear
                  options={certifications.map(cert => ({
                    label: cert,
                    value: cert
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* SEO */}
          <Divider orientation="left">SEO</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name={['seo', 'keywords']}
                label="Từ khóa/Tags"
                rules={[
                  { required: true, message: 'Vui lòng nhập từ khóa' }
                ]}
                tooltip="Nhập các từ khóa liên quan đến sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập từ khóa"
                  allowClear
                  tokenSeparators={[',']}
                  options={commonKeywords.map(keyword => ({
                    label: keyword,
                    value: keyword
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['seo', 'metaTitle']}
                label="Meta Title"
                rules={[{ max: 60, message: 'Meta title không được vượt quá 60 ký tự' }]}
                tooltip="Tiêu đề hiển thị trên kết quả tìm kiếm, tối đa 60 ký tự"
              >
                <Input placeholder="Nhập meta title" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['seo', 'metaDescription']}
                label="Meta Description"
                rules={[{ max: 160, message: 'Meta description không được vượt quá 160 ký tự' }]}
                tooltip="Mô tả ngắn hiển thị trên kết quả tìm kiếm, tối đa 160 ký tự"
              >
                <Input placeholder="Nhập meta description" />
              </Form.Item>
            </Col>
          </Row>

          {/* Chính sách & Tùy chọn */}
          <Divider orientation="left">Chính sách & Tùy chọn</Divider>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name={['policy', 'shippingReturnWarranty']}
                label="Chính sách vận chuyển & Đổi trả"
                rules={[
                  { required: true, message: 'Vui lòng nhập chính sách vận chuyển và đổi trả' }
                ]}
                tooltip="Mô tả chính sách vận chuyển và đổi trả sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập chính sách"
                  allowClear
                  tokenSeparators={[',']}
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
                rules={[
                  { required: true, message: 'Vui lòng nhập tùy chọn bổ sung' }
                ]}
                tooltip="Các tùy chọn hoặc dịch vụ bổ sung khi mua sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập tùy chọn bổ sung"
                  allowClear
                  tokenSeparators={[',']}
                  options={additionalOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Thêm sản phẩm
              </Button>
              <Button onClick={() => navigate('/admin/products')}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddProduct;



