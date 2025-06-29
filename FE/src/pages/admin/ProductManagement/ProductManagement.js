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
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import debounce from 'lodash/debounce';
import './ProductManagement.scss';

const { Option } = Select;
const { Title, Text } = Typography;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

  const navigate = useNavigate();

  // Lấy dữ liệu sản phẩm từ API với JSON có cấu trúc { totalItems, currentPage, pageSize, products }
  const fetchProducts = async () => {
    try {
      setLoading(true);

      let response;
      if (filters.category) {
        // Sử dụng API lấy sản phẩm theo danh mục
        response = await productService.getProductsByCategory(filters.category, {
          page: pagination.current,
          limit: pagination.pageSize,
          status: filters.status
        });
      } else {
        // Sử dụng API lấy tất cả sản phẩm
        response = await productService.getAllProducts({
          page: pagination.current,
          limit: pagination.pageSize,
          name: filters.search,
          status: filters.status
        });
      }

      if (response && response.data && response.data.data) {
        const productsData = response.data.data;
        console.log('Products data:', productsData); // Debug log
        setAllProducts(productsData);

        // Cập nhật pagination từ API response
        setPagination(prev => ({
          ...prev,
          total: response.data.totalItems || 0,
          current: response.data.currentPage || 1,
          pageSize: response.data.perPage || 10
        }));
      } else {
        console.error('Invalid products response:', response);
        setAllProducts([]);
        message.error('Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
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
      // Chuẩn hóa lấy đúng mảng danh mục
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
      message.error('Không thể xóa sản phẩm');
    }
  };

  // Hiển thị chi tiết sản phẩm trong hàng mở rộng
  const expandedRowRender = (record) => (
    <div className="expanded-row-content">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <div className="detail-section">
            <Text strong>Mô tả chi tiết:</Text>
            <Text>{record.description?.detailedDescription || 'N/A'}</Text>
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div className="detail-section">
            <Text strong>Thành phần:</Text>
            <Text>{record.description?.ingredients || 'N/A'}</Text>
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div className="detail-section">
            <Text strong>Hướng dẫn sử dụng:</Text>
            <Text>{record.description?.usageInstructions || 'N/A'}</Text>
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div className="detail-section">
            <Text strong>Hạn sử dụng:</Text>
            <Text>{record.description?.expiration || 'N/A'}</Text>
          </div>
        </Col>
      </Row>

      {record.mediaFiles?.videos?.length > 0 && (
        <div className="media-section">
          <Text strong>Videos:</Text>
          <div className="video-links">
            {record.mediaFiles.videos.map((video, index) => (
              <a
                key={index}
                href={video.path}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link"
              >
                Video {index + 1} <VideoCameraOutlined />
              </a>
            ))}
          </div>
        </div>
      )}

      {record.mediaFiles?.images?.length > 1 && (
        <div className="media-section">
          <Text strong>Hình ảnh bổ sung:</Text>
          <div className="additional-images">
            {record.mediaFiles.images.slice(1).map((image, index) => (
              <Image
                key={index}
                src={image.path}
                alt={`Sản phẩm ${index + 2}`}
                width={80}
                height={80}
                className="additional-image"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Định nghĩa các cột cho bảng sản phẩm
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'mediaFiles',
      key: 'mediaFiles',
      render: (mediaFiles, record) => {
        console.log('Record:', record);
        console.log('Media Files:', mediaFiles);

        // Lấy đường dẫn hình ảnh từ mediaFiles.images[0]
        const mainImage = mediaFiles?.images?.[0];
        console.log('Main Image:', mainImage);

        return mainImage ? (
          <Image
            src={imageUrls[record._id] || `${API_URL}/media${mainImage.path}`}
            alt={mainImage.filename}
            width={50}
            height={50}
            className="product-image"
            preview={{
              src: imageUrls[record._id] || `${API_URL}/media${mainImage.path}`,
            }}
            onError={(e) => {
              console.error('Image load error:', e);
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNGMEYwRjAiLz48dGV4dCB4PSIzMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        ) : (
          <div className="no-image-placeholder">
            <Text type="secondary">Không có ảnh</Text>
          </div>
        );
      },
      width: 70,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: ['basicInformation', 'productName'],
      key: 'basicInformation.productName',
      sorter: true,
      render: (productName, record) => (
        <Tooltip title={record.description?.shortDescription || ''}>
          <div className="product-name">
            <Text strong>{productName}</Text>
            <Text type="secondary" className="product-sku">
              SKU: {record.basicInformation?.sku || 'N/A'}
            </Text>
          </div>
        </Tooltip>
      ),
      width: 250,
    },
    {
      title: 'Thương hiệu',
      dataIndex: ['basicInformation', 'brand'],
      key: 'basicInformation.brand',
      render: (brand) => <Text>{brand || 'N/A'}</Text>,
      width: 120,
    },
    {
      title: 'Giá',
      dataIndex: ['pricingAndInventory', 'salePrice'],
      key: 'pricingAndInventory.salePrice',
      sorter: true,
      render: (salePrice, record) => {
        const currency = record.pricingAndInventory?.currency || 'VND';
        if (salePrice === undefined || salePrice === null)
          return <Text type="secondary">N/A</Text>;
        return (
          <div className="price-info">
            <Text strong className="price">
              {parseFloat(salePrice).toLocaleString('vi-VN')} {currency}
            </Text>
          </div>
        );
      },
      width: 130,
    },
    {
      title: 'Tồn kho',
      dataIndex: ['pricingAndInventory', 'stockQuantity'],
      key: 'pricingAndInventory.stockQuantity',
      sorter: true,
      render: (stockQuantity) => {
        const quantity = stockQuantity !== undefined && stockQuantity !== null ? stockQuantity : 0;
        const color = quantity > 10 ? 'green' : quantity > 0 ? 'orange' : 'red';
        return (
          <Tag color={color} className="stock-tag">
            {quantity}
          </Tag>
        );
      },
      width: 100,
    },
    {
      title: 'Danh mục',
      dataIndex: ['basicInformation', 'categoryIds'],
      key: 'categories',
      render: (categoryIds) => {
        if (!categoryIds || categoryIds.length === 0) return <Text type="secondary">N/A</Text>;

        const names = categoryIds.map((category) => {
          // Nếu category là object (đã populate từ API)
          if (typeof category === 'object' && category.name) {
            return category.name;
          }
          // Nếu category là ID, tìm trong danh sách categories
          const foundCategory = categories.find((cat) => String(cat._id) === String(category));
          return foundCategory ? foundCategory.name : `Unknown (${category})`;
        }).filter(Boolean);

        return names.length > 0 ? (
          <div className="categories">
            {names.map((name, index) => (
              <Tag key={index} color="blue" className="category-tag">
                {name}
              </Tag>
            ))}
          </div>
        ) : (
          <Text type="secondary">N/A</Text>
        );
      },
      width: 180,
    },
    {
      title: 'Trạng thái',
      dataIndex: ['basicInformation', 'status'],
      key: 'basicInformation.status',
      render: (status) => {
        const statusConfig = {
          active: { color: 'green', text: 'Hoạt động' },
          inactive: { color: 'red', text: 'Không hoạt động' },
          draft: { color: 'orange', text: 'Bản nháp' }
        };
        const config = statusConfig[status] || { color: 'default', text: status || 'N/A' };
        return <Tag color={config.color} className="status-tag">{config.text}</Tag>;
      },
      width: 120,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" className="action-buttons">
          <Tooltip title="Sửa sản phẩm">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/products/${record._id}`)}
              className="edit-btn"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
            placement="top"
          >
            <Tooltip title="Xóa sản phẩm">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                className="delete-btn"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      width: 120,
    },
  ];

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
        <Card className="filters-card" size="small">
          <div className="filters-header">
            <FilterOutlined className="filter-icon" />
            <Text strong>Bộ lọc tìm kiếm</Text>
          </div>

          <Row gutter={[16, 16]} className="filters-row">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                onChange={handleSearchChange}
                className="search-input"
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Chọn danh mục"
                allowClear
                onChange={handleCategoryChange}
                value={filters.category}
                disabled={!Array.isArray(categories) || categories.length === 0}
                className="filter-select"
                loading={loadingCategories}
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
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Chọn trạng thái"
                allowClear
                onChange={handleStatusChange}
                value={filters.status}
                className="filter-select"
              >
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
                <Option value="draft">Bản nháp</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleResetFilters}
                  className="reset-btn"
                >
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  onClick={fetchProducts}
                  loading={loading}
                  className="refresh-btn"
                >
                  Tải lại
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card className="table-card" size="small">
          <Table
            columns={columns}
            dataSource={sortedProducts}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} sản phẩm`,
            }}
            onChange={handleTableChange}
            expandable={{ expandedRowRender }}
            scroll={{ x: 1200 }}
            className="products-table"
            size="middle"
          />
        </Card>
      </Card>
    </div>
  );
};

export default ProductManagement;