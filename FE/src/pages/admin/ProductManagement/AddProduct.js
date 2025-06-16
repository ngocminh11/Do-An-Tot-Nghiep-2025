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
  Spin
} from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

const AddProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (error) {
      message.error('Không thể tải danh mục sản phẩm');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Basic Information
      formData.append('basicInformation[productName]', values.basicInformation.productName);
      formData.append('basicInformation[sku]', values.basicInformation.sku);
      formData.append('basicInformation[brand]', values.basicInformation.brand);
      formData.append('basicInformation[status]', values.basicInformation.status || 'active');
      if (values.basicInformation.categoryIds) {
        values.basicInformation.categoryIds.forEach(id => {
          formData.append('basicInformation[categoryIds][]', id);
        });
      }

      // Pricing and Inventory
      formData.append('pricingAndInventory[originalPrice]', values.pricingAndInventory.originalPrice);
      formData.append('pricingAndInventory[salePrice]', values.pricingAndInventory.salePrice);
      formData.append('pricingAndInventory[stockQuantity]', values.pricingAndInventory.stockQuantity);
      formData.append('pricingAndInventory[unit]', values.pricingAndInventory.unit);
      formData.append('pricingAndInventory[currency]', values.pricingAndInventory.currency || 'VND');

      // Description
      formData.append('description[shortDescription]', values.description.shortDescription);
      formData.append('description[detailedDescription]', values.description.detailedDescription);
      formData.append('description[ingredients]', values.description.ingredients);
      formData.append('description[usageInstructions]', values.description.usageInstructions);
      formData.append('description[expiration]', values.description.expiration);

      // Technical Details
      formData.append('technicalDetails[sizeOrWeight]', values.technicalDetails.sizeOrWeight);
      if (values.technicalDetails.suitableSkinTypes) {
        values.technicalDetails.suitableSkinTypes.forEach(type => {
          formData.append('technicalDetails[suitableSkinTypes][]', type);
        });
      }
      formData.append('technicalDetails[origin]', values.technicalDetails.origin);
      if (values.technicalDetails.certifications) {
        values.technicalDetails.certifications.forEach(cert => {
          formData.append('technicalDetails[certifications][]', cert);
        });
      }

      // SEO
      formData.append('seo[metaTitle]', values.seo.metaTitle);
      formData.append('seo[metaDescription]', values.seo.metaDescription);
      if (values.seo.keywords) {
        values.seo.keywords.forEach(keyword => {
          formData.append('seo[keywords][]', keyword);
        });
      }

      // Media Files
      if (fileList.length > 0) {
        fileList.forEach(file => {
          formData.append('files', file.originFileObj);
        });
      }

      await productService.createProduct(formData);
      message.success('Thêm sản phẩm thành công');
      navigate('/admin/products');
    } catch (error) {
      message.error(error.message || 'Không thể thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  if (loadingCategories) {
    return <Spin size="large" />;
  }

  return (
    <div className="add-product">
      <h1>Thêm sản phẩm mới</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          basicInformation: {
            status: 'active'
          },
          pricingAndInventory: {
            currency: 'VND'
          }
        }}
      >
        {/* Basic Information */}
        <Divider orientation="left">Thông tin cơ bản</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name={['basicInformation', 'productName']}
              label="Tên sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['basicInformation', 'sku']}
              label="SKU"
              rules={[{ required: true, message: 'Vui lòng nhập mã SKU' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['basicInformation', 'brand']}
              label="Thương hiệu"
              rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['basicInformation', 'categoryIds']}
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select mode="multiple" loading={loadingCategories}>
                {categories.map(category => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['basicInformation', 'status']}
              label="Trạng thái"
            >
              <Select>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
                <Option value="archived">Đã lưu trữ</Option>
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
              rules={[{ required: true, message: 'Vui lòng nhập giá gốc' }]}
            >
              <InputNumber
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['pricingAndInventory', 'salePrice']}
              label="Giá bán"
              rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
            >
              <InputNumber
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['pricingAndInventory', 'stockQuantity']}
              label="Số lượng tồn kho"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['pricingAndInventory', 'unit']}
              label="Đơn vị"
              rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
            >
              <Input />
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
              rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
            >
              <TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['description', 'detailedDescription']}
              label="Mô tả chi tiết"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
            >
              <TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['description', 'ingredients']}
              label="Thành phần"
              rules={[{ required: true, message: 'Vui lòng nhập thành phần' }]}
            >
              <TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['description', 'usageInstructions']}
              label="Hướng dẫn sử dụng"
              rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn sử dụng' }]}
            >
              <TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['description', 'expiration']}
              label="Hạn sử dụng"
              rules={[{ required: true, message: 'Vui lòng nhập hạn sử dụng' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Technical Details */}
        <Divider orientation="left">Thông số kỹ thuật</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name={['technicalDetails', 'sizeOrWeight']}
              label="Kích thước/Trọng lượng"
              rules={[{ required: true, message: 'Vui lòng nhập kích thước/trọng lượng' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['technicalDetails', 'suitableSkinTypes']}
              label="Loại da phù hợp"
              rules={[{ required: true, message: 'Vui lòng chọn loại da phù hợp' }]}
            >
              <Select mode="multiple">
                <Option value="Da khô">Da khô</Option>
                <Option value="Da dầu">Da dầu</Option>
                <Option value="Da hỗn hợp">Da hỗn hợp</Option>
                <Option value="Da nhạy cảm">Da nhạy cảm</Option>
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
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name={['technicalDetails', 'certifications']}
              label="Chứng nhận"
            >
              <Select mode="tags" />
            </Form.Item>
          </Col>
        </Row>

        {/* SEO */}
        <Divider orientation="left">SEO</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name={['seo', 'metaTitle']}
              label="Meta Title"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['seo', 'metaDescription']}
              label="Meta Description"
            >
              <TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name={['seo', 'keywords']}
              label="Từ khóa"
            >
              <Select mode="tags" />
            </Form.Item>
          </Col>
        </Row>

        {/* Media */}
        <Divider orientation="left">Hình ảnh sản phẩm</Divider>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="mediaFiles"
              label="Hình ảnh"
              rules={[{ required: true, message: 'Vui lòng tải lên ít nhất một hình ảnh' }]}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={() => false}
                multiple
              >
                {fileList.length >= 8 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Thêm sản phẩm
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddProduct;



