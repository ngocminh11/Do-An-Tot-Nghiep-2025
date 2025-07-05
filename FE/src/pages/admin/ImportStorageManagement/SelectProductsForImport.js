import React, { useEffect, useState } from 'react';
import { Table, Button, message, Card, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import productService, { getProductMainImageUrl } from '../../../services/productService';

const { Title } = Typography;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Hàm lấy URL ảnh sản phẩm an toàn
function getSafeProductImageUrl(productData) {
    const mainImagePath = productData?.mediaFiles?.images?.[0]?.path;
    return mainImagePath
        ? (mainImagePath.startsWith('http') ? mainImagePath : `${API_URL}${mainImagePath}`)
        : '/images/products/default.jpg';
}

const SelectProductsForImport = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productService.getAllProducts({ page: 1, limit: 100 });
            let data = [];
            if (Array.isArray(res?.data?.data)) data = res.data.data;
            else if (Array.isArray(res?.data)) data = res.data;
            else if (Array.isArray(res)) data = res;
            setProducts(data.map(item => {
                if (!item || !item.product) return null;
                const { product, detail } = item;
                let merged = { ...product };
                if (detail) {
                    merged = {
                        ...merged,
                        productDetailId: detail._id,
                        pricingAndInventory: detail.pricingAndInventory,
                        description: detail.description,
                        mediaFiles: detail.mediaFiles,
                    };
                }
                return merged;
            }).filter(Boolean));
        } catch (err) {
            setProducts([]);
            message.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (_, record) => (
                <img
                    src={getSafeProductImageUrl(record)}
                    alt="Ảnh"
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                />
            )
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: ['basicInformation', 'productName'],
            key: 'productName',
            render: (text, record) => text || record.name || 'N/A',
        },
        {
            title: 'SKU',
            dataIndex: ['basicInformation', 'sku'],
            key: 'sku',
        },
        {
            title: 'Tồn kho',
            dataIndex: ['pricingAndInventory', 'stockQuantity'],
            key: 'stockQuantity',
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    };

    const handleConfirm = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một sản phẩm để nhập kho!');
            return;
        }
        // Lấy danh sách sản phẩm đã chọn
        const selectedProducts = products.filter(p => selectedRowKeys.includes(p._id));
        navigate('/admin/inventory-import', { state: { selectedProducts } });
    };

    return (
        <div className="select-products-import-page">
            <Card className="main-card">
                <Title level={2}>Chọn sản phẩm để nhập kho</Title>
                <Table
                    rowKey="_id"
                    dataSource={products}
                    columns={columns}
                    rowSelection={rowSelection}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                />
                <Space style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={handleConfirm}>
                        Xác nhận
                    </Button>
                    <Button onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default SelectProductsForImport; 