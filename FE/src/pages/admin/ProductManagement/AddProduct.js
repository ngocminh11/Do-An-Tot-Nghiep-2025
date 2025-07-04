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
import { PlusOutlined, PlusCircleOutlined } from '@ant-design/icons';
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
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [categoryForm] = Form.useForm();
  const [tagForm] = Form.useForm();
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingTag, setAddingTag] = useState(false);

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

  // Thêm các options cho các trường select (bổ sung nhiều lựa chọn tiếng Việt)
  const skinTypes = [
    'Da dầu',
    'Da khô',
    'Da hỗn hợp',
    'Da nhạy cảm',
    'Da thường',
    'Da lão hóa',
    'Da mụn',
    'Da nám',
    'Da mất nước',
    'Da dầu nhạy cảm',
    'Da khô nhạy cảm',
    'Da mụn nhạy cảm',
    'Da dễ kích ứng',
    'Da sạm màu',
    'Da có tàn nhang',
    'Da đỏ',
    'Da bị tổn thương',
    'Da hỗn hợp thiên dầu',
    'Da hỗn hợp thiên khô',
    'Da nhờn',
  ];

  const units = [
    'Chai',
    'Tuýp',
    'Lọ',
    'Hộp',
    'Bộ',
    'Miếng',
    'Gói',
    'ml',
    'g',
    'kg',
    'l',
    'Cặp',
    'Hũ',
    'Thỏi',
    'Túi',
    'Bịch',
    'Set',
    'Combo',
    'Thanh',
    'Ống',
  ];

  const certifications = [
    'Chứng nhận FDA',
    'Chứng nhận CE',
    'ISO 9001',
    'ISO 22716',
    'GMP',
    'Halal',
    'Không thử nghiệm trên động vật',
    'Vegan',
    'Hữu cơ',
    'Sản xuất tại Việt Nam',
    'Sản xuất tại Hàn Quốc',
    'Sản xuất tại Nhật Bản',
    'Chứng nhận ECOCERT',
    'Chứng nhận USDA',
    'Chứng nhận Cosmos',
    'Chứng nhận Organic',
    'Chứng nhận GMP-WHO',
    'Chứng nhận ISO 14001',
    'Chứng nhận ISO 22717',
    'Chứng nhận ISO 22718',
  ];

  const commonIngredients = [
    'Niacinamide',
    'Axit Hyaluronic',
    'Vitamin C',
    'Vitamin E',
    'Axit Salicylic',
    'Axit Glycolic',
    'Retinol',
    'Peptide',
    'Ceramide',
    'Chiết xuất rau má',
    'Dịch nhầy ốc sên',
    'Chiết xuất trà xanh',
    'Chiết xuất cam thảo',
    'Chiết xuất hoa cúc',
    'Chiết xuất lô hội',
    'Chiết xuất hoa hồng',
    'Chiết xuất nghệ',
    'Chiết xuất tràm trà',
    'Chiết xuất yến mạch',
    'Chiết xuất dưa leo',
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
    'Dùng sau bước toner',
    'Dùng trước khi đi ngủ',
    'Dùng cho cả mặt và cổ',
    'Không rửa lại với nước',
    'Lắc đều trước khi sử dụng',
    'Dùng cho da mặt đã làm sạch',
    'Dùng cho vùng da cần điều trị',
    'Dùng kết hợp với sản phẩm khác',
    'Dùng hàng ngày',
    'Dùng theo chỉ dẫn của bác sĩ',
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
    'Hạn sử dụng in trên bao bì',
    'Hạn sử dụng 2 năm',
    'Hạn sử dụng 3 năm',
    'Hạn sử dụng 6 tháng',
    'Hạn sử dụng 1 năm',
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
    '200g',
    '250ml',
    '500ml',
    '1L',
    '20g',
    '10ml',
    '5ml',
    '15g',
    '75ml',
    '300ml',
    '400ml',
  ];

  const commonKeywords = [
    'Chăm sóc da',
    'Dưỡng da',
    'Trị mụn',
    'Dưỡng ẩm',
    'Làm sáng da',
    'Chống lão hóa',
    'Se khít lỗ chân lông',
    'Làm mờ thâm',
    'Dưỡng trắng',
    'Cấp ẩm',
    'Chống nắng',
    'Tẩy tế bào chết',
    'Làm dịu da',
    'Phục hồi da',
    'Chống viêm',
    'Ngăn ngừa mụn',
    'Làm sạch sâu',
    'Kiểm soát dầu',
    'Bảo vệ da',
    'Tái tạo da',
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
    'Không áp dụng đổi trả với sản phẩm đã mở',
    'Đổi trả miễn phí',
    'Bảo hành 6 tháng',
    'Bảo hành 24 tháng',
    'Giao hàng nhanh',
    'Giao hàng tiết kiệm',
    'Hỗ trợ khách hàng 24/7',
    'Đổi trả miễn phí trong 15 ngày',
    'Đổi trả miễn phí trong 30 ngày',
    'Bảo hành trọn đời',
    'Đổi trả linh hoạt',
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
    'Tặng kèm phiếu bảo hành',
    'Tặng kèm túi giấy',
    'Tặng kèm túi vải',
    'Tặng kèm móc khóa',
    'Tặng kèm gương nhỏ',
    'Tặng kèm lược',
    'Tặng kèm băng đô',
    'Tặng kèm sticker',
    'Tặng kèm thiệp cảm ơn',
    'Tặng kèm túi zip',
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
        if (response && Array.isArray(response.data)) {
          setCategories(response.data);
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
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const { data: tagArr } = await tagService.getAllTags();
        setTags(tagArr);
        if (tagArr.length === 0) {
          message.info('Chưa có tag nào, hãy thêm tag mới!');
        }
      } catch (error) {
        setTags([]);
        message.error('Không thể tải danh sách tags');
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  const isObjectId = (id) => typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id);

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      // Đảm bảo các trường array luôn là mảng
      const ensureArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);
      let tagIds = values.basicInformation?.tagIds;
      let categoryIds = values.basicInformation?.categoryIds;
      tagIds = ensureArray(tagIds).filter(isObjectId);
      categoryIds = ensureArray(categoryIds).filter(isObjectId);
      if (!Array.isArray(tagIds) || tagIds.length === 0) {
        message.error('Vui lòng chọn ít nhất một tag từ danh sách có sẵn!');
        setLoading(false);
        return;
      }
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        message.error('Vui lòng chọn ít nhất một danh mục từ danh sách có sẵn!');
        setLoading(false);
        return;
      }
      // Đảm bảo các trường array khác là mảng
      const description = {
        shortDescription: values.description.shortDescription,
        detailedDescription: values.description.detailedDescription,
        features: ensureArray(values.description.features),
        ingredients: ensureArray(values.description.ingredients),
        usageInstructions: ensureArray(values.description.usageInstructions),
        expiration: values.description.expiration || ''
      };
      const technicalDetails = {
        sizeOrWeight: values.technicalDetails.sizeOrWeight || '',
        suitableSkinTypes: ensureArray(values.technicalDetails.suitableSkinTypes),
        origin: values.technicalDetails.origin || '',
        certifications: ensureArray(values.technicalDetails.certifications)
      };
      // Nếu trường nào là object thì chuyển thành chuỗi rỗng (theo backend)
      Object.keys(technicalDetails).forEach(key => {
        if (typeof technicalDetails[key] === 'object' && technicalDetails[key] !== null && !Array.isArray(technicalDetails[key])) technicalDetails[key] = '';
      });
      const seo = {
        metaTitle: values.seo.metaTitle || '',
        metaDescription: values.seo.metaDescription || '',
        keywords: ensureArray(values.seo.keywords),
        urlSlug: values.seo.urlSlug || ''
      };
      const policy = {
        additionalOptions: ensureArray(values.policy.additionalOptions),
        shippingReturnWarranty: ensureArray(values.policy.shippingReturnWarranty)
      };
      // Validate images
      if (!values.media?.mainImage?.[0]?.originFileObj) {
        throw new Error('Vui lòng tải lên ảnh chính cho sản phẩm');
      }
      const mainImage = values.media.mainImage[0];
      const galleryImages = values.media.galleryImages || [];
      if (galleryImages.length > 5) {
        throw new Error('Tối đa chỉ được tải lên 5 ảnh gallery');
      }
      const totalSize = [mainImage, ...galleryImages].reduce((sum, file) => sum + file.originFileObj.size, 0);
      if (totalSize > 30 * 1024 * 1024) {
        throw new Error('Tổng kích thước ảnh không được vượt quá 30MB');
      }
      // Format data
      const basicInformation = {
        productName: values.basicInformation.productName,
        sku: values.basicInformation.sku,
        status: 'Hiển Thị',
        brand: 'CoCo',
        categoryIds: categoryIds,
        tagIds: tagIds
      };
      const pricingAndInventory = {
        originalPrice: Number(values.pricingAndInventory.originalPrice),
        salePrice: Number(values.pricingAndInventory.salePrice),
        stockQuantity: Number(values.pricingAndInventory.stockQuantity),
        unit: values.pricingAndInventory.unit
      };
      // Tạo FormData
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
      console.log(formData);
      // Gửi dữ liệu lên backend, nhận về object đã merge
      const response = await productService.createProduct(formData);
      // Xử lý kết quả trả về (object đã merge Products + ProductDetail)
      message.success('Thêm sản phẩm thành công!');
      navigate('/admin/products');
    } catch (error) {
      // Xử lý lỗi trả về từ backend
      if (error?.message?.includes('PRODUCT_NAME_EXISTS') || (typeof error === 'string' && error.includes('PRODUCT_NAME_EXISTS'))) {
        message.error('Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác!');
      } else if (error?.message?.includes('SKU_EXISTS') || (typeof error === 'string' && error.includes('SKU_EXISTS'))) {
        message.error('SKU đã tồn tại. Vui lòng chọn SKU khác!');
      } else if (error?.message?.includes('URLSLUG_EXISTS') || (typeof error === 'string' && error.includes('URLSLUG_EXISTS'))) {
        message.error('Slug URL đã tồn tại. Vui lòng chọn slug khác!');
      } else if (error?.message?.includes('Vui lòng chọn ít nhất một tag')) {
        message.error('Vui lòng chọn ít nhất một tag từ danh sách có sẵn!');
      } else if (error?.message?.includes('Vui lòng chọn ít nhất một danh mục')) {
        message.error('Vui lòng chọn ít nhất một danh mục từ danh sách có sẵn!');
      } else if (error?.message?.includes('Vui lòng nhập đầy đủ thông tin giá và tồn kho')) {
        message.error('Vui lòng nhập đầy đủ thông tin giá và tồn kho!');
      } else if (error?.message?.includes('Vui lòng tải lên ít nhất một hình ảnh') || error?.message?.includes('Vui lòng tải lên ảnh chính cho sản phẩm')) {
        message.error('Vui lòng tải lên ít nhất một hình ảnh cho sản phẩm!');
      } else if (error?.message?.includes('Tên sản phẩm là bắt buộc')) {
        message.error('Tên sản phẩm và SKU là bắt buộc!');
      } else {
        message.error(error.message || 'Có lỗi xảy ra khi thêm sản phẩm');
      }
      console.error('Error creating product:', error);
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
      if (newTag && newTag._id) {
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
      } else {
        message.error('Không lấy được ID tag mới!');
      }
    } catch (error) {
      message.error(error.message || 'Thêm tag thất bại!');
    } finally {
      setAddingTag(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="page-header">
        <h1>Thêm sản phẩm mới</h1>
        <p>Tạo sản phẩm mới với thông tin chi tiết</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        scrollToFirstError
        className="product-form"
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
        <div className="form-section">
          <Divider orientation="left" className="section-divider">
            Thông tin cơ bản
          </Divider>
          <Row gutter={[32, 24]}>
            <Col xs={24} md={12}>
              <Form.Item
                name={['basicInformation', 'productName']}
                label="Tên sản phẩm"
                rules={productNameRules}
                tooltip="Tên sản phẩm phải là duy nhất trong hệ thống"
                className="form-item"
              >
                <Input
                  placeholder="Acne Clear Gel"
                  size="large"
                  className="form-input"
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
            <Col xs={24} md={12}>
              <Form.Item
                name={['basicInformation', 'sku']}
                label="SKU"
                rules={skuRules}
                tooltip="Mã SKU sẽ được tự động tạo từ tên sản phẩm, bạn có thể chỉnh sửa. SKU phải là duy nhất và chỉ chứa chữ cái thường, số và dấu gạch ngang"
                className="form-item"
              >
                <Input
                  placeholder="acne-clear-gel"
                  size="large"
                  className="form-input"
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
            <Col xs={24} md={12}>
              <Form.Item
                name={['basicInformation', 'brand']}
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
                label="Danh mục sản phẩm"
                rules={[{ required: true, type: 'array', min: 1, message: 'Vui lòng chọn ít nhất một danh mục!' }]}
                tooltip="Chọn ít nhất một danh mục cho sản phẩm"
                className="form-item"
              >
                <div className="select-with-icon">
                  <Select
                    mode="multiple"
                    allowClear
                    loading={loadingCategories}
                    placeholder="Chọn danh mục"
                    optionFilterProp="children"
                    showSearch
                    className="form-select"
                    size="large"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={val => {
                      form.setFieldsValue({
                        basicInformation: {
                          ...form.getFieldValue('basicInformation'),
                          categoryIds: Array.isArray(val) ? val : val ? [val] : []
                        }
                      });
                    }}
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
                tooltip="Chọn hoặc thêm tags cho sản phẩm"
                className="form-item"
                rules={[{ required: true, type: 'array', min: 1, message: 'Vui lòng chọn ít nhất một tag' }]}
              >
                <div className="select-with-icon">
                  <Select
                    mode="multiple"
                    allowClear
                    loading={loadingTags}
                    placeholder="Chọn tag (chỉ chọn từ danh sách)"
                    optionFilterProp="children"
                    showSearch
                    className="form-select"
                    size="large"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={val => {
                      form.setFieldsValue({
                        basicInformation: {
                          ...form.getFieldValue('basicInformation'),
                          tagIds: Array.isArray(val) ? val : val ? [val] : []
                        }
                      });
                    }}
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
            <Form.Item name={['basicInformation', 'status']} hidden>
              <Input />
            </Form.Item>
          </Row>
        </div>

        {/* Giá và Tồn kho */}
        <div className="form-section">
          <Divider orientation="left" className="section-divider">
            Giá sản phẩm và tồn kho
          </Divider>
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name={['pricingAndInventory', 'originalPrice']}
                label="Giá gốc"
                rules={priceRules}
                tooltip="Giá gốc của sản phẩm trước khi giảm giá"
                className="form-item"
              >
                <InputNumber
                  className="form-input-number"
                  min={0}
                  placeholder="500000"
                  size="large"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name={['pricingAndInventory', 'salePrice']}
                label="Giá bán/Ưu đãi"
                rules={priceRules}
                tooltip="Giá bán cuối cùng cho khách hàng, phải nhỏ hơn hoặc bằng giá gốc"
                className="form-item"
              >
                <InputNumber
                  className="form-input-number"
                  min={0}
                  placeholder="450000"
                  size="large"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name={['pricingAndInventory', 'stockQuantity']}
                label="Tồn kho"
                rules={stockRules}
                tooltip="Số lượng sản phẩm hiện có trong kho"
                className="form-item"
              >
                <InputNumber className="form-input-number" min={0} placeholder="150" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name={['pricingAndInventory', 'unit']}
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
                tooltip="Đơn vị tính của sản phẩm (ví dụ: chai, hộp, ml, g)"
                className="form-item"
              >
                <Select
                  showSearch
                  placeholder="Chọn hoặc nhập đơn vị"
                  optionFilterProp="children"
                  size="large"
                  className="form-select"
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
                  <Form.Item
                    name={['media', 'mainImage']}
                    rules={[{ required: true, message: 'Vui lòng tải hình ảnh chính' }]}
                    tooltip="Hình ảnh chính của sản phẩm, kích thước tối đa 5MB"
                    valuePropName="fileList"
                    className="form-item"
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
                      <div className="upload-button">
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered={false} className="media-card">
                <div className="media-section">
                  <h4>Thư viện ảnh</h4>
                  <Form.Item
                    name={['media', 'galleryImages']}
                    tooltip="Tối đa 5 ảnh phụ, mỗi ảnh không quá 5MB, tổng dung lượng không quá 30MB"
                    valuePropName="fileList"
                    className="form-item"
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
                      <div className="upload-button">
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Mô tả sản phẩm */}
        <div className="form-section">
          <Divider orientation="left" className="section-divider">
            Mô tả sản phẩm
          </Divider>
          <Row gutter={[32, 24]}>
            <Col xs={24} md={12}>
              <Form.Item
                name={['description', 'shortDescription']}
                label="Mô tả ngắn"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả ngắn' },
                  { max: 200, message: 'Mô tả ngắn không được vượt quá 200 ký tự' }
                ]}
                tooltip="Mô tả ngắn gọn về sản phẩm, tối đa 200 ký tự"
                className="form-item"
              >
                <TextArea
                  rows={4}
                  maxLength={200}
                  showCount
                  size="large"
                  className="form-textarea"
                  placeholder="Kem trị mụn & trị nám giúp làm sạch, ngăn ngừa mụn và giảm thâm nám, phù hợp với da mụn, da nhạy cảm."
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name={['description', 'detailedDescription']}
                label="Mô tả chi tiết"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả chi tiết' },
                  { max: 3000, message: 'Mô tả chi tiết không được vượt quá 3000 ký tự' }
                ]}
                tooltip="Mô tả chi tiết về công dụng và đặc điểm của sản phẩm, tối đa 3000 ký tự"
                className="form-item"
              >
                <TextArea
                  rows={4}
                  maxLength={3000}
                  showCount
                  size="large"
                  className="form-textarea"
                  placeholder="Sản phẩm được chiết xuất từ các thành phần tự nhiên, hỗ trợ điều trị mụn và làm mờ vết nám."
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name={['description', 'features']}
                label="Đặc điểm"
                rules={[
                  { required: true, message: 'Vui lòng nhập đặc điểm sản phẩm' },
                  { max: 1000, message: 'Danh sách đặc điểm không được vượt quá 1000 ký tự' }
                ]}
                tooltip="Liệt kê các đặc điểm chính của sản phẩm, phân cách bằng dấu phẩy"
                className="form-item"
              >
                <TextArea
                  rows={3}
                  maxLength={1000}
                  showCount
                  size="large"
                  className="form-textarea"
                  placeholder="Trà xanh, Cam thảo, Chiết xuất tràm trà, Vitamin E, và các thành phần tự nhiên khác"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name={['description', 'ingredients']}
                label="Thành phần"
                rules={[
                  { required: true, message: 'Vui lòng nhập thành phần sản phẩm' }
                ]}
                tooltip="Liệt kê các thành phần chính của sản phẩm"
                className="form-item"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập thành phần"
                  allowClear
                  tokenSeparators={[',']}
                  size="large"
                  className="form-select"
                  options={commonIngredients.map(ingredient => ({
                    label: ingredient,
                    value: ingredient
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name={['description', 'usageInstructions']}
                label="Hướng dẫn sử dụng"
                rules={[
                  { required: true, message: 'Vui lòng nhập hướng dẫn sử dụng' }
                ]}
                tooltip="Hướng dẫn chi tiết cách sử dụng sản phẩm"
                className="form-item"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập hướng dẫn sử dụng"
                  allowClear
                  tokenSeparators={[',']}
                  size="large"
                  className="form-select"
                  options={commonUsageInstructions.map(instruction => ({
                    label: instruction,
                    value: instruction
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name={['description', 'expiration']}
                label="Ngày hết hạn"
                rules={[
                  { required: true, message: 'Vui lòng nhập thời hạn sử dụng' }
                ]}
                tooltip="Thời hạn sử dụng của sản phẩm"
                className="form-item"
              >
                <Select
                  placeholder="Chọn thời hạn sử dụng"
                  allowClear
                  size="large"
                  className="form-select"
                  options={expirationOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Thông số kỹ thuật */}
        <div className="form-section">
          <Divider orientation="left" className="section-divider">
            Thông số kỹ thuật
          </Divider>
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name={['technicalDetails', 'sizeOrWeight']}
                label="Kích thước / Trọng lượng"
                rules={[
                  { required: true, message: 'Vui lòng nhập kích thước hoặc trọng lượng' }
                ]}
                tooltip="Ví dụ: 30ml, 50g, 100ml"
                className="form-item"
              >
                <Select
                  placeholder="Chọn kích thước/trọng lượng"
                  allowClear
                  size="large"
                  className="form-select"
                  options={sizeWeightOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name={['technicalDetails', 'suitableSkinTypes']}
                label="Loại da phù hợp"
                rules={[
                  { required: true, message: 'Vui lòng chọn loại da phù hợp' }
                ]}
                tooltip="Chọn các loại da phù hợp với sản phẩm"
                className="form-item"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn loại da"
                  allowClear
                  size="large"
                  className="form-select"
                  options={skinTypes.map(type => ({
                    label: type,
                    value: type
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name={['technicalDetails', 'origin']}
                label="Xuất xứ"
                rules={[
                  { required: true, message: 'Vui lòng nhập xuất xứ' },
                  { max: 100, message: 'Xuất xứ không được vượt quá 100 ký tự' }
                ]}
                tooltip="Nước sản xuất sản phẩm"
                className="form-item"
              >
                <Input placeholder="VietNam" size="large" className="form-input" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name={['technicalDetails', 'certifications']}
                label="Chứng nhận chất lượng"
                tooltip="Chọn các chứng nhận chất lượng của sản phẩm"
                className="form-item"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn chứng nhận"
                  allowClear
                  size="large"
                  className="form-select"
                  options={certifications.map(cert => ({
                    label: cert,
                    value: cert
                  }))}
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
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name={['seo', 'keywords']}
                label="Từ khóa/Tags"
                rules={[
                  { required: true, message: 'Vui lòng nhập từ khóa' }
                ]}
                tooltip="Nhập các từ khóa liên quan đến sản phẩm"
                className="form-item"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập từ khóa"
                  allowClear
                  tokenSeparators={[',']}
                  size="large"
                  className="form-select"
                  options={commonKeywords.map(keyword => ({
                    label: keyword,
                    value: keyword
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name={['seo', 'metaTitle']}
                label="Meta Title"
                rules={[{ max: 60, message: 'Meta title không được vượt quá 60 ký tự' }]}
                tooltip="Tiêu đề hiển thị trên kết quả tìm kiếm, tối đa 60 ký tự"
                className="form-item"
              >
                <Input placeholder="Nhập meta title" size="large" className="form-input" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name={['seo', 'metaDescription']}
                label="Meta Description"
                rules={[{ max: 160, message: 'Meta description không được vượt quá 160 ký tự' }]}
                tooltip="Mô tả ngắn hiển thị trên kết quả tìm kiếm, tối đa 160 ký tự"
                className="form-item"
              >
                <Input placeholder="Nhập meta description" size="large" className="form-input" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Chính sách & Tùy chọn */}
        <div className="form-section">
          <Divider orientation="left" className="section-divider">
            Chính sách & Tùy chọn
          </Divider>
          <Row gutter={[32, 24]}>
            <Col xs={24} md={12}>
              <Form.Item
                name={['policy', 'shippingReturnWarranty']}
                label="Chính sách vận chuyển & Đổi trả"
                rules={[
                  { required: true, message: 'Vui lòng nhập chính sách vận chuyển và đổi trả' }
                ]}
                tooltip="Mô tả chính sách vận chuyển và đổi trả sản phẩm"
                className="form-item"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập chính sách"
                  allowClear
                  tokenSeparators={[',']}
                  size="large"
                  className="form-select"
                  options={shippingReturnOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name={['policy', 'additionalOptions']}
                label="Tùy chọn bổ sung"
                rules={[
                  { required: true, message: 'Vui lòng nhập tùy chọn bổ sung' }
                ]}
                tooltip="Các tùy chọn hoặc dịch vụ bổ sung khi mua sản phẩm"
                className="form-item"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập tùy chọn bổ sung"
                  allowClear
                  tokenSeparators={[',']}
                  size="large"
                  className="form-select"
                  options={additionalOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="form-actions">
          <Button type="primary" htmlType="submit" loading={loading} size="large" className="submit-button">
            Thêm sản phẩm
          </Button>
          <Button onClick={() => navigate('/admin/products')} size="large" className="cancel-button">
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
              size="large"
              className="form-textarea"
            />
          </Form.Item>
          <Form.Item className="modal-actions">
            <Space>
              <Button type="primary" htmlType="submit" loading={addingCategory} size="large">
                Thêm danh mục
              </Button>
              <Button onClick={() => {
                setIsCategoryModalVisible(false);
                categoryForm.resetFields();
              }} size="large">
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
              size="large"
              className="form-textarea"
            />
          </Form.Item>
          <Form.Item className="modal-actions">
            <Space>
              <Button type="primary" htmlType="submit" loading={addingTag} size="large">
                Thêm tag
              </Button>
              <Button onClick={() => {
                setIsTagModalVisible(false);
                tagForm.resetFields();
              }} size="large">
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddProduct;



