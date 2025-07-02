import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tag,
  Image,
  Tooltip,
  Input,
  Select,
  message,
  Spin,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Card as AntCard,
  Pagination,
  Modal,
  Form,
  InputNumber,
  Dropdown,
  Menu,
  Timeline
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  FilterOutlined,
  ReloadOutlined,
  HistoryOutlined,
  SwapOutlined,
  PlusSquareOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import debounce from 'lodash/debounce';
import './ProductManagement.scss';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthModal } from '../../../contexts/AuthModalContext';

const { Option } = Select;
const { Title, Text } = Typography;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProductCard = ({ product, imageUrl, categories, onEdit, onDelete, onInventory, onChangeStatus, onShowLogs }) => {
  const mainImage = product.mediaFiles?.images?.[0];
  const statusConfig = {
    active: { color: 'green', text: 'Hoạt động' },
    inactive: { color: 'red', text: 'Không hoạt động' },
    draft: { color: 'orange', text: 'Bản nháp' }
  };
  const config = statusConfig[product.basicInformation?.status] || { color: 'default', text: product.basicInformation?.status || 'N/A' };
  const categoryNames = (product.basicInformation?.categoryIds || []).map((category) => {
    if (typeof category === 'object' && category.name) return category.name;
    const found = categories.find((cat) => String(cat._id) === String(category));
    return found ? found.name : `Unknown (${category})`;
  });
  return (
    <AntCard
      className="product-card"
      cover={mainImage ? (
        <Image
          src={imageUrl || `${API_URL}/media${mainImage.path}`}
          alt={mainImage.filename}
          width={180}
          height={180}
          style={{ objectFit: 'cover', borderRadius: 8, margin: 'auto', marginTop: 12 }}
          preview={false}
        />
      ) : (
        <div className="no-image-placeholder" style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 8 }}>
          <Text type="secondary">Không có ảnh</Text>
        </div>
      )}
      actions={[
        <Tooltip title="Sửa sản phẩm" key="edit"><Button type="link" icon={<EditOutlined />} onClick={onEdit} /></Tooltip>,
        <Popconfirm title="Bạn có chắc chắn muốn xóa sản phẩm này?" onConfirm={onDelete} okText="Có" cancelText="Không"><Tooltip title="Xóa sản phẩm"><Button type="link" danger icon={<DeleteOutlined />} /></Tooltip></Popconfirm>,
        <Tooltip title="Nhập kho" key="inventory"><Button type="link" icon={<PlusSquareOutlined />} onClick={onInventory} /></Tooltip>,
        <Dropdown
          overlay={<Menu onClick={({ key }) => onChangeStatus(key)}>
            <Menu.Item key="Hiển Thị">Hiển Thị</Menu.Item>
            <Menu.Item key="Ẩn">Ẩn</Menu.Item>
            <Menu.Item key="Ngừng Bán">Ngừng Bán</Menu.Item>
          </Menu>}
          trigger={['click']}
        >
          <Tooltip title="Đổi trạng thái"><Button type="link" icon={<SwapOutlined />} /></Tooltip>
        </Dropdown>,
        <Tooltip title="Lịch sử thao tác" key="logs"><Button type="link" icon={<HistoryOutlined />} onClick={onShowLogs} /></Tooltip>
      ]}
      hoverable
      bodyStyle={{ padding: 16 }}
    >
      <div className="product-card-content">
        <div className="product-name" style={{ fontWeight: 600, fontSize: 16 }}>{product.basicInformation?.productName}</div>
        <div className="product-sku" style={{ color: '#999', fontSize: 12 }}>SKU: {product.basicInformation?.sku || 'N/A'}</div>
        <div className="product-price" style={{ color: '#1890ff', fontWeight: 600, margin: '8px 0' }}>{parseFloat(product.pricingAndInventory?.salePrice || 0).toLocaleString('vi-VN')} {product.pricingAndInventory?.currency || 'VND'}</div>
        <div className="product-stock"><Tag color={product.pricingAndInventory?.stockQuantity > 10 ? 'green' : product.pricingAndInventory?.stockQuantity > 0 ? 'orange' : 'red'}>{product.pricingAndInventory?.stockQuantity ?? 0} tồn kho</Tag></div>
        <div className="product-status"><Tag color={config.color}>{config.text}</Tag></div>
        <div className="product-categories" style={{ marginTop: 4 }}>{categoryNames.map((name, idx) => <Tag color="blue" key={idx}>{name}</Tag>)}</div>
      </div>
    </AntCard>
  );
};

const ProductManagement = () => {
  // Các state quản lý dữ liệu, bộ lọc, sắp xếp và phân trang
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: undefined,
    status: undefined
  });
  const [sorter, setSorter] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [imageUrls, setImageUrls] = useState({}); // key: product._id, value: objectURL
  const [statusModal, setStatusModal] = useState({ visible: false, product: null });
  const [logsModal, setLogsModal] = useState({ visible: false, product: null, logs: [], loading: false });
  const [form] = Form.useForm();
  const { logout, handleSessionExpired } = useAuth();
  const { setShowLogin } = useAuthModal();
  const [loginMessage, setLoginMessage] = useState('');
  const pinInputRef = React.useRef();
  const [inventoryModal, setInventoryModal] = useState({ visible: false, product: null });

  const navigate = useNavigate();

  // Lấy dữ liệu sản phẩm từ API với JSON có cấu trúc { totalItems, currentPage, pageSize, products }
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let response;
      if (filters.category) {
        response = await productService.getProductsByCategory(filters.category, {
          page: pagination.current,
          limit: pagination.pageSize,
          status: filters.status
        });
      } else {
        response = await productService.getAllProducts({
          page: pagination.current,
          limit: pagination.pageSize,
          name: filters.search,
          status: filters.status
        });
      }

      let productsData = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (Array.isArray(response?.data)) {
        productsData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response?.data?.products)) {
        productsData = response.data.products;
      }

      setAllProducts(productsData);
      setPagination(prev => ({
        ...prev,
        total: response?.data?.totalItems || productsData.length || 0,
        current: response?.data?.currentPage || 1,
        pageSize: response?.data?.perPage || pagination.pageSize
      }));

      if (!productsData || productsData.length === 0) {
        message.info('Không có sản phẩm nào để hiển thị');
      }
    } catch (error) {
      console.error('Error fetching products:', error);

      // Handle authentication errors
      if (error?.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      setAllProducts([]);
      setPagination(prev => ({ ...prev, total: 0 }));
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh mục sản phẩm từ API
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
      console.error('Error fetching categories:', error);

      // Handle authentication errors
      if (error?.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      setCategories([]);
      message.error('Không thể tải danh mục sản phẩm');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize, filters]);

  // Lấy ảnh blob cho từng sản phẩm khi allProducts thay đổi
  useEffect(() => {
    if (!Array.isArray(allProducts)) return;
    allProducts.forEach(async (product) => {
      let imgPath = '';
      if (product.mediaFiles && Array.isArray(product.mediaFiles.images) && product.mediaFiles.images[0]?.path) {
        imgPath = product.mediaFiles.images[0].path;
      } else if (product.media && product.media.mainImage) {
        imgPath = product.media.mainImage;
      }
      if (imgPath && !imageUrls[product._id]) {
        try {
          const blob = await productService.getImageById(imgPath.replace('/media/', ''));
          const objectUrl = URL.createObjectURL(blob);
          setImageUrls(prev => ({ ...prev, [product._id]: objectUrl }));
        } catch (e) {
          // fallback
        }
      }
    });
    // eslint-disable-next-line
  }, [allProducts]);

  // Sử dụng debounce để lọc tìm kiếm (tránh render quá nhiều khi gõ liên tục)
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi tìm kiếm
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Lọc sản phẩm theo danh mục được chọn
  const handleCategoryChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Lọc sản phẩm theo trạng thái
  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Reset tất cả bộ lọc
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: undefined,
      status: undefined
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Áp dụng bộ lọc dựa vào tìm kiếm và danh mục
  const filteredProducts = useMemo(() => {
    let data = Array.isArray(allProducts) ? [...allProducts] : [];

    // Chỉ áp dụng filter search nếu không có category filter (vì API đã filter rồi)
    if (filters.search && !filters.category) {
      data = data.filter((product) => {
        const name = product?.basicInformation?.productName || '';
        const shortDesc = product?.description?.shortDescription || '';
        const sku = product?.basicInformation?.sku || '';
        return (
          name.toLowerCase().includes(filters.search.toLowerCase()) ||
          shortDesc.toLowerCase().includes(filters.search.toLowerCase()) ||
          sku.toLowerCase().includes(filters.search.toLowerCase())
        );
      });
    }

    // Chỉ áp dụng filter status nếu không có category filter (vì API đã filter rồi)
    if (filters.status && !filters.category) {
      data = data.filter((product) => {
        const status = product?.basicInformation?.status || '';
        return status === filters.status;
      });
    }

    return data;
  }, [allProducts, filters]);

  // Áp dụng sắp xếp dựa theo state sorter
  const sortedProducts = useMemo(() => {
    let data = [...filteredProducts];
    if (sorter.field) {
      data.sort((a, b) => {
        let aValue, bValue;
        const getNestedValue = (obj, path) => {
          const keys = path.split('.');
          let value = obj;
          for (const key of keys) {
            if (value && value[key] !== undefined) {
              value = value[key];
            } else {
              return undefined;
            }
          }
          return value;
        };

        aValue = getNestedValue(a, sorter.field);
        bValue = getNestedValue(b, sorter.field);

        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sorter.order === 'ascend' ? 1 : -1;
        if (bValue === undefined) return sorter.order === 'ascend' ? -1 : 1;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sorter.order === 'ascend' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sorter.order === 'ascend' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return sorter.order === 'ascend' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        }
        return 0;
      });
    }
    return data;
  }, [filteredProducts, sorter]);

  // Cập nhật lại số lượng sản phẩm sau khi lọc và sắp xếp (nếu không lấy từ API)
  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: sortedProducts.length }));
  }, [sortedProducts]);

  // Xử lý thay đổi trên bảng (phân trang & sắp xếp)
  const handleTableChange = (newPagination, _filters, newSorter) => {
    setPagination(newPagination);
    if (newSorter.order) {
      setSorter({ field: newSorter.field, order: newSorter.order });
    } else {
      setSorter({});
    }
  };

  // Xử lý xóa sản phẩm
  const handleDelete = async (id) => {
    try {
      await productService.deleteProduct(id);
      message.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);

      // Handle authentication errors
      if (error?.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      message.error('Không thể xóa sản phẩm');
    }
  };

  // Đổi trạng thái sản phẩm
  const handleChangeStatus = async (status) => {
    if (!statusModal.product) return;
    if (status === statusModal.product.basicInformation.status) {
      message.info('Sản phẩm đã ở trạng thái này.');
      return;
    }
    try {
      await productService.changeStatus(statusModal.product._id, status);
      message.success('Đổi trạng thái thành công');
      setStatusModal({ visible: false, product: null });
      fetchProducts();
    } catch (error) {
      console.error('Error changing status:', error);

      // Handle authentication errors
      if (error?.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      message.error(error?.message || 'Đổi trạng thái thất bại');
    }
  };

  const openStatusModal = (product) => setStatusModal({ visible: true, product });

  // Xem log thao tác sản phẩm
  const handleShowLogs = async (product) => {
    setLogsModal({ visible: true, product, logs: [], loading: true });
    try {
      const res = await productService.getProductLogs(product._id);
      setLogsModal({ visible: true, product, logs: res.data?.data || [], loading: false });
    } catch (error) {
      console.error('Error fetching logs:', error);

      // Handle authentication errors
      if (error?.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      setLogsModal({ visible: true, product, logs: [], loading: false });
      message.error('Không thể tải lịch sử thao tác');
    }
  };

  const handleInventory = (product) => {
    setInventoryModal({ visible: true, product });
    form.resetFields();
  };

  const handleInventoryOk = async () => {
    try {
      const values = await form.validateFields();

      // Validate PIN: phải là 6 số
      if (!values.pin || !/^\d{6}$/.test(values.pin)) {
        message.error('Mã PIN phải gồm đúng 6 chữ số!');
        pinInputRef.current?.focus();
        return;
      }

      // Nếu cả hai trường đều rỗng
      if (!values.quantity && !values.originalPrice) {
        message.error('Vui lòng nhập số lượng hoặc giá nhập mới!');
        return;
      }

      // Chuẩn hóa payload
      const payload = {
        quantity: values.quantity || 0,
        originalPrice: values.originalPrice || undefined,
        pin: values.pin
      };

      // Gọi API nhập kho
      await productService.updateInventory(
        inventoryModal.product._id,
        payload
      );

      message.success('Nhập kho thành công');
      setInventoryModal({ visible: false, product: null });
      form.resetFields();
      fetchProducts();
    } catch (error) {
      console.error('Error updating inventory:', error);

      // Handle authentication errors
      if (error?.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      const errorMessage = error?.response?.data?.message || error?.message || 'Nhập kho thất bại';

      if (errorMessage.toLowerCase().includes('pin')) {
        message.error(errorMessage);
        pinInputRef.current?.focus();
      } else {
        message.error(errorMessage);
      }
    }
  };

  return (
    <div className="product-management">
      <Card className="main-card">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <Title level={2} className="page-title">
              Quản lý sản phẩm
            </Title>
            <Text type="secondary" className="page-subtitle">
              Quản lý danh sách sản phẩm trong hệ thống
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/products/add')}
            className="add-product-btn"
            size="large"
          >
            Thêm sản phẩm
          </Button>
        </div>

        <Divider />

        {/* Filters */}
        <div className="filters-modern">
          <Row gutter={[16, 16]} align="middle" justify="center">
            <Col xs={24} sm={12} md={6} lg={5} xl={5}>
              <div className="filter-field">
                <label className="filter-label"><SearchOutlined style={{ marginRight: 4 }} />Từ khóa</label>
                <Input
                  size="large"
                  placeholder="Nhập tên, mô tả, SKU..."
                  onChange={handleSearchChange}
                  className="search-input"
                  allowClear
                  bordered
                  style={{ borderRadius: 12, background: '#fff' }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5} xl={5}>
              <div className="filter-field">
                <label className="filter-label"><FilterOutlined style={{ marginRight: 4 }} />Danh mục</label>
                <Select
                  size="large"
                  placeholder="Chọn danh mục"
                  allowClear
                  onChange={handleCategoryChange}
                  value={filters.category}
                  disabled={!Array.isArray(categories) || categories.length === 0}
                  className="filter-select"
                  loading={loadingCategories}
                  bordered
                  style={{ borderRadius: 12, background: '#fff', width: '100%' }}
                >
                  {!Array.isArray(categories) || categories.length === 0 ? (
                    <Option value="" disabled>Không có danh mục</Option>
                  ) : (
                    categories.map((category) => (
                      <Option key={category._id} value={category._id}>
                        {category.name}
                      </Option>
                    ))
                  )}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5} xl={5}>
              <div className="filter-field">
                <label className="filter-label"><FilterOutlined style={{ marginRight: 4 }} />Trạng thái</label>
                <Select
                  size="large"
                  placeholder="Chọn trạng thái"
                  allowClear
                  onChange={handleStatusChange}
                  value={filters.status}
                  className="filter-select"
                  bordered
                  style={{ borderRadius: 12, background: '#fff', width: '100%' }}
                >
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Không hoạt động</Option>
                  <Option value="draft">Bản nháp</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5} xl={5} style={{ textAlign: 'center', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                className="reset-btn"
                size="large"
                style={{ borderRadius: 12, background: '#f6f8fa', border: 'none', color: '#666', marginTop: 8 }}
              />
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Card className="table-card" size="small" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
          {loading ? (
            <Spin style={{ width: '100%', margin: '40px 0' }} />
          ) : (
            <Row gutter={[24, 24]}>
              {sortedProducts.length === 0 ? (
                <Col span={24} style={{ textAlign: 'center', padding: 40 }}>
                  <Text type="secondary">Không có sản phẩm nào</Text>
                </Col>
              ) : (
                sortedProducts.slice((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize).map((product) => (
                  <Col xs={24} sm={12} md={8} lg={6} xl={6} key={product._id}>
                    <ProductCard
                      product={product}
                      imageUrl={imageUrls[product._id]}
                      categories={categories}
                      onEdit={() => navigate(`/admin/products/${product._id}`)}
                      onDelete={() => handleDelete(product._id)}
                      onInventory={() => handleInventory(product)}
                      onChangeStatus={(status) => { setStatusModal({ visible: true, product }); handleChangeStatus(status); }}
                      onShowLogs={() => handleShowLogs(product)}
                    />
                  </Col>
                ))
              )}
            </Row>
          )}
          {/* Pagination dưới dạng menu/card */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              showQuickJumper
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
              onChange={(page, pageSize) => setPagination((prev) => ({ ...prev, current: page, pageSize }))}
              style={{ display: 'inline-block' }}
            />
          </div>
        </Card>
      </Card>

      {/* Modal đổi trạng thái */}
      <Modal
        title={`Đổi trạng thái: ${statusModal.product?.basicInformation?.productName || ''}`}
        visible={statusModal.visible}
        onCancel={() => setStatusModal({ visible: false, product: null })}
        footer={null}
      >
        <Menu onClick={({ key }) => handleChangeStatus(key)}>
          <Menu.Item key="Hiển Thị" disabled={statusModal.product?.basicInformation?.status === 'Hiển Thị'}>Hiển Thị</Menu.Item>
          <Menu.Item key="Ẩn" disabled={statusModal.product?.basicInformation?.status === 'Ẩn'}>Ẩn</Menu.Item>
          <Menu.Item key="Ngừng Bán" disabled={statusModal.product?.basicInformation?.status === 'Ngừng Bán'}>Ngừng Bán</Menu.Item>
        </Menu>
      </Modal>

      {/* Modal log thao tác */}
      <Modal
        title={`Lịch sử thao tác: ${logsModal.product?.basicInformation?.productName || ''}`}
        visible={logsModal.visible}
        onCancel={() => setLogsModal({ visible: false, product: null, logs: [], loading: false })}
        footer={null}
        width={600}
      >
        {logsModal.loading ? <Spin /> : (
          <Timeline>
            {logsModal.logs.map((log, idx) => (
              <Timeline.Item key={idx} color="blue">
                <div><b>Hành động:</b> {log.action}</div>
                <div><b>Thời gian:</b> {new Date(log.createdAt).toLocaleString('vi-VN')}</div>
                <div><b>Người thao tác:</b> {log.operatorId?.name || 'N/A'}</div>
                <div><b>Chi tiết:</b> <pre style={{ margin: 0, background: '#f6f8fa', padding: 8, borderRadius: 4 }}>{JSON.stringify(log.payload, null, 2)}</pre></div>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Modal>

      {/* Modal nhập kho */}
      <Modal
        title={`Nhập kho: ${inventoryModal.product?.basicInformation?.productName || ''}`}
        visible={inventoryModal.visible}
        onOk={handleInventoryOk}
        onCancel={() => {
          setInventoryModal({ visible: false, product: null });
          form.resetFields();
        }}
        okText="Nhập kho"
        cancelText="Hủy"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="quantity"
            label="Số lượng nhập thêm"
            rules={[{
              validator: (_, value) => {
                if (!value && !form.getFieldValue('originalPrice')) {
                  return Promise.reject('Vui lòng nhập số lượng hoặc giá nhập mới!');
                }
                if (value && value <= 0) {
                  return Promise.reject('Số lượng phải lớn hơn 0');
                }
                return Promise.resolve();
              }
            }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Nhập số lượng (nếu có)"
            />
          </Form.Item>

          <Form.Item
            name="originalPrice"
            label="Giá nhập mới (nếu có)"
            rules={[{
              validator: (_, value) => {
                if (!value && !form.getFieldValue('quantity')) {
                  return Promise.reject('Vui lòng nhập số lượng hoặc giá nhập mới!');
                }
                if (value && value <= 0) {
                  return Promise.reject('Giá nhập phải lớn hơn 0');
                }
                return Promise.resolve();
              }
            }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Nhập giá nhập mới (nếu có)"
            />
          </Form.Item>

          <Form.Item
            name="pin"
            label="Mã PIN xác nhận"
            rules={[
              { required: true, message: 'Vui lòng nhập mã PIN!' },
              { pattern: /^\d{6}$/, message: 'Mã PIN phải gồm đúng 6 chữ số!' }
            ]}
          >
            <Input.Password
              placeholder="Nhập mã PIN"
              maxLength={6}
              ref={pinInputRef}
            />
          </Form.Item>

          <div style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
            <Text type="secondary">
              • Bạn có thể nhập chỉ số lượng, chỉ giá nhập mới hoặc cả hai.<br />
              • Mã PIN là bắt buộc để xác nhận thao tác nhập kho.<br />
              • Thao tác này sẽ được ghi lại trong lịch sử.
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;