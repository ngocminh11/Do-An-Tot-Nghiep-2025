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
      const response = await productService.getAllProducts();
      // Assuming the backend returns an array of products directly or { products: [...], ...}
      const productsArray = response.data.products || response.data;
      console.log('Fetched Products:', productsArray);
      setAllProducts(productsArray);
      // Update pagination if backend provides totalItems
      if (response.data.totalItems !== undefined) {
        setPagination(prev => ({ ...prev, total: response.data.totalItems }));
      }
    } catch (error) {
      setAllProducts([]);
      message.error('Failed to fetch products.');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh mục sản phẩm từ API
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      // Use categoryService to fetch categories
      const data = await categoryService.getAllCategories();
      // Ensure _id is treated as string for consistent comparison
      setCategories(data.map(cat => ({ ...cat, _id: String(cat._id) })));
      console.log('Fetched Categories:', data);
    } catch (error) {
      message.error('Không thể tải danh mục sản phẩm.');
      console.error('Error fetching categories:', error);
      setCategories([]); // Set to empty array on error
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    // Fetch categories first, then products
    fetchCategories().then(() => {
      fetchProducts();
    });
  }, []);

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
    let data = [...allProducts];
    if (filters.search) {
      data = data.filter((product) => {
        const name = product.basicInformation?.productName || '';
        const shortDesc = product.description?.shortDescription || '';
        const sku = product.basicInformation?.sku || '';
        return (
          name.toLowerCase().includes(filters.search.toLowerCase()) ||
          shortDesc.toLowerCase().includes(filters.search.toLowerCase()) ||
          sku.toLowerCase().includes(filters.search.toLowerCase())
        );
      });
    }
    if (filters.category) {
      data = data.filter((product) => {
        const catIds = product.basicInformation?.categoryIds || [];
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
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  // Hiển thị chi tiết sản phẩm trong hàng mở rộng
  const expandedRowRender = (record) => (
    <div style={{ margin: 0, padding: '12px' }}>
      <p>
        <strong>Detailed Description:</strong>{' '}
        {record.description?.detailedDescription || 'N/A'}
      </p>
      <p>
        <strong>Ingredients:</strong> {record.description?.ingredients || 'N/A'}
      </p>
      <p>
        <strong>Usage Instructions:</strong>{' '}
        {record.description?.usageInstructions || 'N/A'}
      </p>
      <p>
        <strong>Expiration:</strong>{' '}
        {record.description?.expiration || 'N/A'}
      </p>
      {record.media?.videoUrl && (
        <p>
          <strong>Video: </strong>
          <a
            href={record.media.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch Demo <VideoCameraOutlined />
          </a>
        </p>
      )}
    </div>
  );

  // Định nghĩa các cột cho bảng sản phẩm
  const columns = [
    {
      title: 'Image',
      dataIndex: 'media',
      key: 'media',
      render: (media) =>
        media && media.mainImage ? (
          <Image
            src={media.mainImage}
            alt="Product"
            width={60}
            height={60}
            style={{ objectFit: 'cover' }}
            preview={false}
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
            No Image
          </div>
        ),
      width: 80,
    },
    {
      title: 'Name',
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
      title: 'Brand',
      dataIndex: ['basicInformation', 'brand'],
      key: 'basicInformation.brand',
      render: (brand) => <span>{brand}</span>,
      width: 120,
    },
    {
      title: 'Price',
      dataIndex: ['pricingAndInventory', 'salePrice'],
      key: 'pricingAndInventory.salePrice',
      sorter: true,
      render: (salePrice, record) => {
        const currency = record.pricingAndInventory?.currency || '';
        if (salePrice === undefined || salePrice === null)
          return 'N/A';
        return `${parseFloat(salePrice).toLocaleString('vi-VN')} ${currency}`;
      },
      width: 120,
    },
    {
      title: 'Stock',
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
      title: 'Unit',
      dataIndex: ['pricingAndInventory', 'unit'],
      key: 'pricingAndInventory.unit',
      render: (unit) => (
        <span>{unit || 'N/A'}</span>
      ),
      width: 80,
    },
    {
      title: 'Categories',
      dataIndex: ['basicInformation', 'categoryIds'],
      key: 'categories',
      render: (categoryIds) => {
        console.log('Rendering Categories Column:');
        console.log('Product Category IDs:', categoryIds);
        console.log('Available Categories:', categories);

        if (!categoryIds || categoryIds.length === 0)
          return 'N/A';
        const names = categoryIds.map((id) => {
          // Ensure id from product is treated as string for consistent comparison
          const category = categories.find((cat) => {
            console.log(`Comparing Product ID: ${String(id)} with Category ID: ${String(cat._id)}`);
            return String(cat._id) === String(id);
          });
          console.log(`Found Category for ID ${id}:`, category);
          return category ? category.name : `Unknown (${id})`; // Display Unknown and ID if not found
        }).filter(name => name); // Filter out any null/undefined names just in case
        return names.join(', ');
      },
      width: 160,
    },
    {
      title: 'Short Description',
      dataIndex: ['description', 'shortDescription'],
      key: 'description.shortDescription',
      render: (shortDescription) => shortDescription || 'N/A',
      width: 200,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/products/${record._id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
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
        <h1 style={{ margin: 0 }}>Product Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/products/add')}
        >
          Add Product
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
          placeholder="Search products..."
          prefix={<SearchOutlined />}
          onChange={handleSearchChange}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          placeholder="Category"
          allowClear
          style={{ width: 200 }}
          onChange={handleCategoryChange}
          value={filters.category}
          disabled={categories.length === 0}
        >
          {categories.length === 0 ? (
            <Option disabled>No categories</Option>
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