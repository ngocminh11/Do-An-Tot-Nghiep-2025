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
  message
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

const AddProduct = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await categoryService.getAllCategories();
        setCategories(Array.isArray(response) ? response : []);
      } catch (error) {
        message.error('Không thể tải danh mục sản phẩm');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFinish = async (values) => {
    try {
      const formData = new FormData();

      // Append product ID
      const idProduct = values.idProduct ? String(values.idProduct) : 'P' + Math.floor(Math.random() * 1000000);
      formData.append('idProduct', idProduct);

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

      await productService.createProduct(formData);
      message.success('Thêm sản phẩm thành công!');
      form.resetFields();
      setTimeout(() => {
        window.location.href = '/admin/products';
      }, 800);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response?.data?.message) {
        message.error('Lỗi: ' + error.response.data.message);
      } else {
        message.error('Thêm sản phẩm thất bại!');
      }
    }
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
              >
                {categories.map((category) => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
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
        <Divider orientation="left">Hình ảnh</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <Card bordered={false} bodyStyle={{ padding: 0 }}>
              <Form.Item
                label="Hình ảnh chính"
                name={['media', 'mainImage']}
                rules={[{ required: true, message: 'Vui lòng tải hình ảnh chính' }]}
                valuePropName="fileList"
                getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
              >
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
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
                name={['media', 'imageGallery']}
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
                <Option value="Da khô">Da khô</Option>
                <Option value="Da dầu">Da dầu</Option>
                <Option value="Da hỗn hợp">Da hỗn hợp</Option>
                <Option value="Da thường">Da thường</Option>
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
              name={['technicalDetails', 'certifications']}
              label="Chứng nhận chất lượng"
            >
              <Select mode="tags" placeholder="Nhập chứng nhận chất lượng" allowClear />
            </Form.Item>
          </Col>
        </Row>

        {/* SEO */}
        <Divider orientation="left">SEO</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name={['seo', 'keywords']} label="Từ khóa/Tags">
              <Select mode="tags" placeholder="Nhập từ khóa" allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={['seo', 'metaTitle']} label="Meta Title">
              <Input placeholder="Nhập meta title" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={['seo', 'metaDescription']} label="Meta Description">
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



