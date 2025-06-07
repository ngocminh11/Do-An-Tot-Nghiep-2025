import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Upload,
  Button,
  Row,
  Col,
  Card,
  Divider,
  message
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import productService from '../../../services/productService';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

// Hàm chuyển file thành Base64 (trả về một Promise với chuỗi Base64)
const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Custom Upload request để chuyển đổi file sang Base64
const customUpload = async ({ file, onSuccess, onError }) => {
  try {
    const base64 = await getBase64(file);
    // Gán vào originFileObj để hàm extractUrl có thể lấy được
    file.originFileObj = { ...file.originFileObj, base64 };
    // Giả lập thành công upload (response chứa Base64)
    onSuccess({ url: base64 }, file);
  } catch (error) {
    onError(error);
  }
};

const AddProduct = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Lấy danh mục sản phẩm (chỉ lấy các danh mục có trạng thái active)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await productService.getCategories();
        const categoriesArray = Array.isArray(response)
          ? response
          : response.data || [];
        setCategories(categoriesArray.filter((cat) => cat.status === 'active'));
      } catch (error) {
        setCategories([]);
        message.error('Không thể tải danh mục sản phẩm');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Hàm trợ giúp chuyển đổi dữ liệu file từ Upload
  const extractUrl = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (item.url) return item.url;
    if (item.thumbUrl) return item.thumbUrl;
    if (item.response && item.response.url) return item.response.url;
    // Nếu đã được chuyển đổi sang base64, nó sẽ nằm trong item.originFileObj.base64
    if (item.originFileObj && item.originFileObj.base64) return item.originFileObj.base64;
    return '';
  };

  const isValidHttpUrl = (url) => {
    if (typeof url !== 'string') return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handleFinish = async (values) => {
    // Create FormData to handle files and other data
    const formData = new FormData();

    // Append product ID
    const idProduct = values.idProduct ? String(values.idProduct) : 'P' + Math.floor(Math.random() * 1000000);
    formData.append('idProduct', idProduct);

    // Append basic information, converting categoryIds to a format backend expects (e.g., array of strings)
    if (values.basicInformation) {
      formData.append('basicInformation[productName]', values.basicInformation.productName);
      formData.append('basicInformation[sku]', values.basicInformation.sku);
      formData.append('basicInformation[brand]', values.basicInformation.brand);
      // Append categoryIds as an array
      if (Array.isArray(values.basicInformation.categoryIds)) {
        values.basicInformation.categoryIds.forEach(id => formData.append('basicInformation[categoryIds][]', String(id)));
      } else if (values.basicInformation.categoryIds) {
        formData.append('basicInformation[categoryIds][]', String(values.basicInformation.categoryIds));
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

    // Append description fields
    if (values.description) {
      formData.append('description[shortDescription]', values.description.shortDescription);
      formData.append('description[detailedDescription]', values.description.detailedDescription);
      formData.append('description[ingredients]', values.description.ingredients);
      formData.append('description[usageInstructions]', values.description.usageInstructions);
      formData.append('description[expiration]', values.description.expiration);
    }

    // Append technical details, converting arrays to comma-separated strings
    if (values.technicalDetails) {
      formData.append('technicalDetails[sizeOrWeight]', values.technicalDetails.sizeOrWeight);
      formData.append('technicalDetails[colorOrVariant]', values.technicalDetails.colorOrVariant || '');
      formData.append('technicalDetails[suitableSkinTypes]', Array.isArray(values.technicalDetails.suitableSkinTypes) ? values.technicalDetails.suitableSkinTypes.join(', ') : values.technicalDetails.suitableSkinTypes || '');
      formData.append('technicalDetails[certifications]', Array.isArray(values.technicalDetails.certifications) ? values.technicalDetails.certifications.join(', ') : values.technicalDetails.certifications || '');
      formData.append('technicalDetails[origin]', values.technicalDetails.origin);
    }

    // Append SEO fields, converting keywords array to comma-separated string
    if (values.seo) {
      formData.append('seo[keywords]', Array.isArray(values.seo.keywords) ? values.seo.keywords.join(', ') : values.seo.keywords || '');
      formData.append('seo[metaTitle]', values.seo.metaTitle);
      formData.append('seo[metaDescription]', values.seo.metaDescription);
      formData.append('seo[urlSlug]', values.seo.urlSlug);
    }

    // Append policy fields
    if (values.policy) {
      formData.append('policy[shippingReturnWarranty]', values.policy.shippingReturnWarranty || '');
      formData.append('policy[additionalOptions]', values.policy.additionalOptions || '');
    }

    // Append files (images and videos)
    if (values.media) {
      // Main Image
      if (values.media.mainImage && values.media.mainImage.length > 0) {
        // Assuming mainImage is a fileList from Ant Design Upload
        const mainImageFile = values.media.mainImage[0].originFileObj;
        if (mainImageFile) {
          formData.append('images', mainImageFile);
        }
      }
      // Image Gallery
      if (values.media.imageGallery && values.media.imageGallery.length > 0) {
        // Assuming imageGallery is a fileList
        values.media.imageGallery.forEach(fileItem => {
          const imageFile = fileItem.originFileObj;
          if (imageFile) {
            formData.append('images', imageFile);
          }
        });
      }
      // Video
      if (values.media.videoUrl && values.media.videoUrl.length > 0) {
        // Assuming videoUrl is a fileList
        const videoFile = values.media.videoUrl[0].originFileObj;
        if (videoFile) {
          formData.append('videos', videoFile);
        }
      }
    }

    console.log('FormData to be sent:', formData); // Log FormData contents for debugging

    try {
      // Send FormData instead of JSON
      await productService.createProduct(formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Thêm sản phẩm thành công!');
      form.resetFields();
      setTimeout(() => {
        window.location.href = '/admin/products';
      }, 800);
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error('Lỗi: ' + error.response.data.message);
      } else {
        message.error('Thêm sản phẩm thất bại!');
      }
    }
  };

  const handlePreview = async (file) => {
    // Nếu file chưa có URL, chuyển đổi sang base64
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    alert('Preview: ' + (file.url || file.preview));
  };

  return (
    <div className="add-product-page">
      <h2>Thêm sản phẩm</h2>
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ maxWidth: 1200 }}>
        {/* Trường mã sản phẩm */}
        <Form.Item name="idProduct" label="Mã sản phẩm (ID)">
          <Input placeholder="P002" />
        </Form.Item>
        {/* Thông tin cơ bản */}
        <Divider orientation="left">Thông tin cơ bản</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name={['basicInformation', 'productName']}
              label="Tên sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input placeholder="Acne Clear Gel" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['basicInformation', 'sku']}
              label="SKU"
              rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
            >
              <Input placeholder="Serum-tri-mun-2" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['basicInformation', 'brand']}
              label="Thương hiệu"
              rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}
            >
              <Input placeholder="CoCoo" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['basicInformation', 'categoryIds']}
              label="Danh mục sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select
                mode="multiple"
                allowClear
                loading={loadingCategories}
                placeholder="Chọn danh mục"
                disabled={categories.length === 0}
              >
                {categories.length === 0 ? (
                  <Option disabled>Không có danh mục</Option>
                ) : (
                  categories.map((category) => (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  ))
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {/* Giá và Tồn kho */}
        <Divider orientation="left">Giá sản phẩm và tồn kho</Divider>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              name={['pricingAndInventory', 'originalPrice']}
              label="Giá gốc"
              rules={[{ required: true, message: 'Vui lòng nhập giá gốc' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="500000" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name={['pricingAndInventory', 'salePrice']}
              label="Giá bán/Ưu đãi"
              rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="450000" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name={['pricingAndInventory', 'stockQuantity']}
              label="Tồn kho"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="150" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name={['pricingAndInventory', 'unit']}
              label="Đơn vị"
              rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
            >
              <Input placeholder="bottle" />
            </Form.Item>
          </Col>
          <Form.Item name={['pricingAndInventory', 'currency']} initialValue="VND" hidden>
            <Input />
          </Form.Item>
        </Row>
        {/* Media */}
        <Divider orientation="left">Hình ảnh & Video</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <Card bordered={false} bodyStyle={{ padding: 0 }}>
              <Form.Item
                label="Hình ảnh chính"
                name={['media', 'mainImage']}
                rules={[{ required: true, message: 'Vui lòng tải hình ảnh chính' }]}
                valuePropName="fileList"
                getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
              >
                <Upload
                  listType="picture-card"
                  customRequest={customUpload}
                  onPreview={handlePreview}
                >
                  <div style={{ width: '100%', height: 120, background: '#ccc' }}>
                    <PlusOutlined />
                  </div>
                </Upload>
              </Form.Item>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} bodyStyle={{ padding: 0 }}>
              <Form.Item label="Bộ sưu tập hình ảnh" name={['media', 'imageGallery']}>
                <Upload
                  listType="picture-card"
                  multiple
                  customRequest={customUpload}
                >
                  <div>
                    <PlusOutlined />
                  </div>
                </Upload>
              </Form.Item>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} bodyStyle={{ padding: 0 }}>
              <Form.Item label="Video (tuỳ chọn)" name={['media', 'videoUrl']}>
                <Upload
                  listType="picture-card"
                  customRequest={customUpload}
                >
                  <div>
                    <PlusOutlined />
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
              rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
            >
              <TextArea
                rows={3}
                placeholder="Kem trị mụn & trị nám giúp làm sạch, ngăn ngừa mụn và giảm thâm nám, phù hợp với da mụn, da nhạy cảm."
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['description', 'detailedDescription']}
              label="Mô tả chi tiết"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
            >
              <TextArea
                rows={3}
                placeholder="Sản phẩm được chiết xuất từ các thành phần tự nhiên, hỗ trợ điều trị mụn và làm mờ vết nám."
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['description', 'ingredients']}
              label="Thành phần"
              rules={[{ required: true, message: 'Vui lòng nhập thành phần sản phẩm' }]}
            >
              <TextArea rows={2} placeholder="Trà xanh, Cam thảo, Chiết xuất tràm trà, Vitamin E, và các thành phần tự nhiên khác" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['description', 'usageInstructions']}
              label="Hướng dẫn sử dụng"
              rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn sử dụng' }]}
            >
              <TextArea rows={2} placeholder="Rửa mặt sạch, sau đó thoa một lượng kem vừa đủ lên vùng da cần điều trị vào buổi sáng và tối. Tránh vùng mắt và vùng môi." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['description', 'expiration']}
              label="Ngày hết hạn"
              rules={[{ required: true, message: 'Vui lòng nhập thời hạn sử dụng' }]}
            >
              <Input placeholder="18 tháng kể từ ngày sản xuất" />
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
              rules={[{ required: true, message: 'Vui lòng nhập kích thước hoặc trọng lượng' }]}
            >
              <Input placeholder="30ml" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['technicalDetails', 'suitableSkinTypes']}
              label="Loại da phù hợp"
              rules={[{ required: true, message: 'Vui lòng chọn loại da phù hợp' }]}
            >
              <Select mode="multiple" placeholder="Chọn loại da" allowClear>
                <Option value="Da mụn">Da mụn</Option>
                <Option value="Da nhạy cảm">Da nhạy cảm</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['technicalDetails', 'origin']}
              label="Xuất xứ"
              rules={[{ required: true, message: 'Vui lòng nhập xuất xứ' }]}
            >
              <Input placeholder="VietNam" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['technicalDetails', 'colorOrVariant']}
              label="Màu sắc / Phiên bản"
            >
              <Input placeholder="null nếu không có" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['technicalDetails', 'certifications']}
              label="Chứng nhận chất lượng"
            >
              <Select mode="tags" placeholder="Đạt tiêu chuẩn an toàn mỹ phẩm của Cocoo, không chứa paraben và đã được kiểm nghiệm da liễu" allowClear />
            </Form.Item>
          </Col>
        </Row>
        {/* SEO */}
        <Divider orientation="left">SEO</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name={['seo', 'keywords']} label="Từ khóa/Tags">
              <Select mode="tags" placeholder="kem trị mụn, kem trị nám, Cocoo, chăm sóc da, da mụn, da nhạy cảm" allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={['seo', 'metaTitle']} label="Meta Title">
              <Input placeholder="Kem trị mụn & trị nám Cocoo - Giải pháp cho làn da sáng mịn" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={['seo', 'metaDescription']} label="Meta Description">
              <Input placeholder="Khám phá Kem trị mụn & trị nám Cocoo, với thành phần tự nhiên an toàn cho làn da mụn và da nhạy cảm, giúp cải thiện làn da hiệu quả." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={['seo', 'urlSlug']} label="Slug">
              <Input placeholder="kem-tri-mun-cocoo-clear-skian" />
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
            >
              <TextArea
                rows={2}
                placeholder="Miễn phí vận chuyển toàn quốc; Đổi trả trong 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={['policy', 'additionalOptions']} label="Tùy chọn bổ sung">
              <TextArea
                rows={2}
                placeholder="Hỗ trợ tư vấn sử dụng và chăm sóc da; Các chương trình khuyến mãi, bundle sản phẩm kèm theo khi mua số lượng lớn"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ float: 'right' }}>
            Thêm sản phẩm
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddProduct;


