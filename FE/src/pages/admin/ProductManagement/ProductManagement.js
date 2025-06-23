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
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import debounce from 'lodash/debounce';
import './ProductManagement.scss';

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProductManagement = () => {
  // Các state quản lý dữ liệu, bộ lọc, sắp xếp và phân trang
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: undefined });
  const [sorter, setSorter] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const navigate = useNavigate();

  // Lấy dữ liệu sản phẩm từ API với JSON có cấu trúc { totalItems, currentPage, pageSize, products }
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts({
        page: pagination.current,
        limit: pagination.pageSize,
        name: filters.search,
        categoryId: filters.category
      });

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

  // Áp dụng bộ lọc dựa vào tìm kiếm và danh mục
  const filteredProducts = useMemo(() => {
    let data = Array.isArray(allProducts) ? [...allProducts] : [];

    if (filters.search) {
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

    if (filters.category) {
      data = data.filter((product) => {
        const catIds = product?.basicInformation?.categoryIds || [];
        return catIds.map(String).includes(filters.category);
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
    <div style={{ margin: 0, padding: '12px' }}>
      <p>
        <strong>Mô tả chi tiết:</strong>{' '}
        {record.description?.detailedDescription || 'N/A'}
      </p>
      <p>
        <strong>Thành phần:</strong> {record.description?.ingredients || 'N/A'}
      </p>
      <p>
        <strong>Hướng dẫn sử dụng:</strong>{' '}
        {record.description?.usageInstructions || 'N/A'}
      </p>
      <p>
        <strong>Hạn sử dụng:</strong>{' '}
        {record.description?.expiration || 'N/A'}
      </p>
      {record.mediaFiles?.videos?.length > 0 && (
        <p>
          <strong>Videos: </strong>
          {record.mediaFiles.videos.map((video, index) => (
            <a
              key={index}
              href={video.path}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: '10px' }}
            >
              Video {index + 1} <VideoCameraOutlined />
            </a>
          ))}
        </p>
      )}
      {record.mediaFiles?.images?.length > 1 && (
        <div>
          <strong>Hình ảnh bổ sung: </strong>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {record.mediaFiles.images.slice(1).map((image, index) => (
              <Image
                key={index}
                src={image.path}
                alt={`Sản phẩm ${index + 2}`}
                width={100}
                height={100}
                style={{ objectFit: 'cover' }}
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
            src={`${API_URL}/media${mainImage.path}`}
            alt={mainImage.filename}
            width={60}
            height={60}
            style={{ objectFit: 'cover' }}
            preview={{
              src: `${API_URL}/media${mainImage.path}`,
            }}
            onError={(e) => {
              console.error('Image load error:', e);
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNGMEYwRjAiLz48dGV4dCB4PSIzMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f0f0f0',
              borderRadius: 6,
              color: '#bbb',
              fontSize: 12,
            }}
          >
            Không có ảnh
          </div>
        );
      },
      width: 80,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: ['basicInformation', 'productName'],
      key: 'basicInformation.productName',
      sorter: true,
      render: (productName, record) => (
        <Tooltip title={record.description?.shortDescription || ''}>
          <span>{productName}</span>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: 'SKU',
      dataIndex: ['basicInformation', 'sku'],
      key: 'basicInformation.sku',
      sorter: true,
      render: (sku) => (
        <span>{sku || 'N/A'}</span>
      ),
      width: 120,
    },
    {
      title: 'Thương hiệu',
      dataIndex: ['basicInformation', 'brand'],
      key: 'basicInformation.brand',
      render: (brand) => <span>{brand}</span>,
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
          return 'N/A';
        return `${parseFloat(salePrice).toLocaleString('vi-VN')} ${currency}`;
      },
      width: 120,
    },
    {
      title: 'Tồn kho',
      dataIndex: ['pricingAndInventory', 'stockQuantity'],
      key: 'pricingAndInventory.stockQuantity',
      sorter: true,
      render: (stockQuantity) => (
        <Tag
          color={
            stockQuantity !== undefined && stockQuantity !== null && stockQuantity > 10
              ? 'green'
              : stockQuantity !== undefined && stockQuantity !== null && stockQuantity > 0
                ? 'orange'
                : 'red'
          }
        >
          {stockQuantity !== undefined && stockQuantity !== null ? stockQuantity : 0}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Đơn vị',
      dataIndex: ['pricingAndInventory', 'unit'],
      key: 'pricingAndInventory.unit',
      render: (unit) => (
        <span>{unit || 'N/A'}</span>
      ),
      width: 80,
    },
    {
      title: 'Danh mục',
      dataIndex: ['basicInformation', 'categoryIds'],
      key: 'categories',
      render: (categoryIds) => {
        if (!categoryIds || categoryIds.length === 0) return 'N/A';

        const names = categoryIds.map((category) => {
          // Nếu category là object (đã populate từ API)
          if (typeof category === 'object' && category.name) {
            return category.name;
          }
          // Nếu category là ID, tìm trong danh sách categories
          const foundCategory = categories.find((cat) => String(cat._id) === String(category));
          return foundCategory ? foundCategory.name : `Unknown (${category})`;
        }).filter(Boolean);

        return names.length > 0 ? names.join(', ') : 'N/A';
      },
      width: 160,
    },
    {
      title: 'Mô tả ngắn',
      dataIndex: ['description', 'shortDescription'],
      key: 'description.shortDescription',
      render: (shortDescription) => shortDescription || 'N/A',
      width: 200,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
      width: 120,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/products/${record._id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div className="product-management">
      <div
        className="header"
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0 }}>Quản lý sản phẩm</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/products/add')}
        >
          Thêm sản phẩm
        </Button>
      </div>
      <div
        className="filters"
        style={{
          marginBottom: 16,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          prefix={<SearchOutlined />}
          onChange={handleSearchChange}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          placeholder="Danh mục"
          allowClear
          style={{ width: 200 }}
          onChange={handleCategoryChange}
          value={filters.category}
          disabled={!Array.isArray(categories) || categories.length === 0}
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
      <Table
        columns={columns}
        dataSource={sortedProducts}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        onChange={handleTableChange}
        expandable={{ expandedRowRender }}
        scroll={{ x: 1300 }}
      />
    </div>
  );
};

export default ProductManagement;