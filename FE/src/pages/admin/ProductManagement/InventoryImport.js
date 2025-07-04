import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    InputNumber,
    Input,
    DatePicker,
    Select,
    Form,
    message,
    Card,
    Row,
    Col,
    Typography,
    Space,
    Modal
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import storeService from '../../../services/StoreService';
import productService, { getProductMainImageUrl } from '../../../services/productService';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

const paymentMethods = [
    { value: 'Tiền mặt', label: 'Tiền mặt' },
    { value: 'Chuyển khoản', label: 'Chuyển khoản' },
    { value: 'Trả chậm', label: 'Trả chậm' },
];

// Mock data cho select
const userOptions = [
    { value: 'Nguyễn Văn A', label: 'Nguyễn Văn A' },
    { value: 'Trần Thị B', label: 'Trần Thị B' },
    { value: 'Lê Văn C', label: 'Lê Văn C' },
];
const supplierOptions = [
    {
        value: 'SUP001',
        label: 'Công ty TNHH Mỹ Phẩm ABC',
        code: 'SUP001',
        name: 'Công ty TNHH Mỹ Phẩm ABC',
        address: '123 Đường Hoa Hồng, Q.1, TP.HCM',
        phone: '0901234567',
        email: 'abc@mypham.com'
    },
    {
        value: 'SUP002',
        label: 'Công ty CP Dược Phẩm XYZ',
        code: 'SUP002',
        name: 'Công ty CP Dược Phẩm XYZ',
        address: '456 Đường Hoa Lan, Q.3, TP.HCM',
        phone: '0907654321',
        email: 'xyz@duocpham.com'
    }
];

const InventoryImport = () => {
    const [products, setProducts] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [importData, setImportData] = useState({});
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [billInfo, setBillInfo] = useState({
        billCode: '',
        billDate: dayjs(),
        createdBy: '',
        receivedBy: '',
        supplier: '',
        supplierCode: '',
        supplierAddress: '',
        supplierPhone: '',
        supplierEmail: '',
        poNumber: '',
        paymentMethod: '',
        shippingFee: 0,
        discountPercent: 0,
        vatPercent: 0,
        note: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    // Hàm chuẩn hóa dữ liệu sản phẩm từ { product, detail }
    function normalizeProduct(item) {
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
    }

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productService.getAllProducts({ page: 1, limit: 100 });
            let data = [];
            if (Array.isArray(res?.data?.data)) data = res.data.data;
            else if (Array.isArray(res?.data)) data = res.data;
            else if (Array.isArray(res)) data = res;
            // CHUẨN HÓA DỮ LIỆU
            const normalized = data.map(normalizeProduct).filter(Boolean);
            setProducts(normalized);
        } catch (err) {
            setProducts([]);
            message.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Tính toán tổng tiền hàng trước chiết khấu (dựa vào giá nhập)
    const totalBeforeDiscount = selectedRowKeys.reduce((sum, pid) => {
        const d = importData[pid];
        return sum + ((d?.quantity || 0) * (d?.originalPrice || 0));
    }, 0);
    // Tổng chiết khấu (tự động tính theo % trên tổng tiền hàng)
    const totalDiscount = Math.round((billInfo.discountPercent || 0) * totalBeforeDiscount / 100);
    // Tổng tiền sau chiết khấu
    const totalAfterDiscount = totalBeforeDiscount - totalDiscount;
    // Tổng VAT (tự động tính theo % trên tổng sau chiết khấu)
    const totalVAT = Math.round((billInfo.vatPercent || 0) * totalAfterDiscount / 100);
    // Phí vận chuyển
    const shippingFee = billInfo.shippingFee || 0;
    // Tổng thanh toán cuối cùng
    const totalFinal = totalAfterDiscount + totalVAT + shippingFee;

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (_, record) => (
                <img
                    src={getProductMainImageUrl(record)}
                    alt="Ảnh"
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                />
            )
        },
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (_, __, idx) => idx + 1,
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
            title: 'Số lượng nhập',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (_, record) => (
                <InputNumber
                    min={1}
                    value={importData[record._id]?.quantity || ''}
                    onChange={val => handleImportFieldChange(record._id, 'quantity', val)}
                />
            )
        },
        {
            title: 'Giá nhập',
            dataIndex: 'originalPrice',
            key: 'originalPrice',
            render: (_, record) => (
                <InputNumber
                    min={0}
                    value={importData[record._id]?.originalPrice || ''}
                    onChange={val => handleImportFieldChange(record._id, 'originalPrice', val)}
                />
            )
        },
        {
            title: 'Mã lô',
            dataIndex: 'batchCode',
            key: 'batchCode',
            render: (_, record) => (
                <Input
                    value={importData[record._id]?.batchCode || ''}
                    onChange={e => handleImportFieldChange(record._id, 'batchCode', e.target.value)}
                />
            )
        },
        {
            title: 'NSX',
            dataIndex: 'mfgDate',
            key: 'mfgDate',
            render: (_, record) => (
                <DatePicker
                    value={importData[record._id]?.mfgDate}
                    onChange={date => handleImportFieldChange(record._id, 'mfgDate', date)}
                    format="DD/MM/YYYY"
                />
            )
        },
        {
            title: 'HSD',
            dataIndex: 'expDate',
            key: 'expDate',
            render: (_, record) => (
                <DatePicker
                    value={importData[record._id]?.expDate}
                    onChange={date => handleImportFieldChange(record._id, 'expDate', date)}
                    format="DD/MM/YYYY"
                />
            )
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (_, record) => (
                <Input
                    value={importData[record._id]?.note || ''}
                    onChange={e => handleImportFieldChange(record._id, 'note', e.target.value)}
                />
            )
        },
    ];

    const handleImportFieldChange = (productId, field, value) => {
        setImportData(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    const handleBillInfoChange = (field, value) => {
        setBillInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleImport = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một sản phẩm để nhập kho!');
            return;
        }
        // Validate dữ liệu nhập
        for (const pid of selectedRowKeys) {
            const data = importData[pid];
            if (!data?.quantity || data.quantity <= 0) {
                message.error('Vui lòng nhập số lượng hợp lệ cho tất cả sản phẩm!');
                return;
            }
        }
        setLoading(true);
        try {
            // Gọi API tạo Storage cho từng sản phẩm, truyền đúng productDetail
            const createPromises = selectedRowKeys.map(pid => {
                const d = importData[pid] || {};
                const productObj = products.find(p => p._id === pid);
                return storeService.create({
                    product: pid,
                    productDetail: productObj?.productDetailId,
                    type: 'import',
                    quantity: d.quantity,
                    originalPrice: d.originalPrice,
                    batchCode: d.batchCode,
                    mfgDate: d.mfgDate ? d.mfgDate.format('YYYY-MM-DD') : undefined,
                    expDate: d.expDate ? d.expDate.format('YYYY-MM-DD') : undefined,
                    note: d.note,
                    // Thông tin hóa đơn chung
                    billCode: billInfo.billCode,
                    billDate: billInfo.billDate ? billInfo.billDate.format('YYYY-MM-DD') : undefined,
                    createdBy: billInfo.createdBy,
                    receivedBy: billInfo.receivedBy,
                    supplier: billInfo.supplier,
                    supplierCode: billInfo.supplierCode,
                    supplierAddress: billInfo.supplierAddress,
                    supplierPhone: billInfo.supplierPhone,
                    supplierEmail: billInfo.supplierEmail,
                    paymentMethod: billInfo.paymentMethod,
                    shippingFee: shippingFee,
                    discount: billInfo.discountPercent,
                    vat: billInfo.vatPercent,
                    totalBeforeDiscount,
                    totalDiscount,
                    totalAfterDiscount,
                    totalVAT,
                    totalFinal
                });
            });
            await Promise.all(createPromises);
            message.success('Nhập kho thành công!');
            setSelectedRowKeys([]);
            setImportData({});
            setBillInfo(prev => ({ ...prev, billCode: '', poNumber: '' }));
            fetchProducts();
        } catch (err) {
            message.error(err?.message || 'Nhập kho thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    };

    return (
        <div className="inventory-import-page">
            <Card className="main-card">
                <Title level={2}>Nhập hàng vào kho</Title>
                <Form layout="vertical" style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item label="Mã phiếu nhập">
                                <Input value={billInfo.billCode} onChange={e => handleBillInfoChange('billCode', e.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Ngày lập phiếu">
                                <DatePicker value={billInfo.billDate} onChange={date => handleBillInfoChange('billDate', date)} format="DD/MM/YYYY" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Người lập phiếu">
                                <Select
                                    showSearch
                                    allowClear
                                    value={billInfo.createdBy}
                                    onChange={val => handleBillInfoChange('createdBy', val)}
                                    placeholder="Chọn hoặc nhập người lập phiếu"
                                    options={userOptions}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Người tiếp nhận hàng">
                                <Select
                                    showSearch
                                    allowClear
                                    value={billInfo.receivedBy}
                                    onChange={val => handleBillInfoChange('receivedBy', val)}
                                    placeholder="Chọn hoặc nhập người nhận"
                                    options={userOptions}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Nhà cung cấp">
                                <Select
                                    showSearch
                                    allowClear
                                    value={billInfo.supplier}
                                    onChange={val => {
                                        handleBillInfoChange('supplier', val);
                                        // Tự động fill các trường liên quan nếu chọn từ danh sách
                                        const found = supplierOptions.find(s => s.value === val);
                                        if (found) {
                                            handleBillInfoChange('supplierCode', found.code);
                                            handleBillInfoChange('supplierAddress', found.address);
                                            handleBillInfoChange('supplierPhone', found.phone);
                                            handleBillInfoChange('supplierEmail', found.email);
                                        }
                                    }}
                                    placeholder="Chọn hoặc nhập nhà cung cấp"
                                    options={supplierOptions}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Mã nhà cung cấp">
                                <Input value={billInfo.supplierCode} onChange={e => handleBillInfoChange('supplierCode', e.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Địa chỉ nhà cung cấp">
                                <Input value={billInfo.supplierAddress} onChange={e => handleBillInfoChange('supplierAddress', e.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Số điện thoại nhà cung cấp">
                                <Input value={billInfo.supplierPhone} onChange={e => handleBillInfoChange('supplierPhone', e.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Email nhà cung cấp">
                                <Input value={billInfo.supplierEmail} onChange={e => handleBillInfoChange('supplierEmail', e.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Hình thức thanh toán">
                                <Select
                                    allowClear
                                    value={billInfo.paymentMethod}
                                    onChange={val => handleBillInfoChange('paymentMethod', val)}
                                    placeholder="Chọn hình thức thanh toán"
                                    options={paymentMethods}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24}>
                            <Form.Item label="Ghi chú chung">
                                <Input.TextArea value={billInfo.note} onChange={e => handleBillInfoChange('note', e.target.value)} rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <Table
                    rowKey="_id"
                    dataSource={products}
                    columns={columns}
                    rowSelection={rowSelection}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                />
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col xs={24} md={6}><Form.Item label="Tổng tiền hàng trước chiết khấu"><Input value={totalBeforeDiscount.toLocaleString('vi-VN')} disabled /></Form.Item></Col>
                        <Col xs={24} md={6}><Form.Item label="Tổng chiết khấu"><Input value={totalDiscount.toLocaleString('vi-VN')} disabled /></Form.Item></Col>
                        <Col xs={24} md={6}><Form.Item label="Tổng tiền sau chiết khấu"><Input value={totalAfterDiscount.toLocaleString('vi-VN')} disabled /></Form.Item></Col>
                        <Col xs={24} md={6}><Form.Item label="Tổng VAT"><Input value={totalVAT.toLocaleString('vi-VN')} disabled /></Form.Item></Col>
                        <Col xs={24} md={6}><Form.Item label="Tổng thanh toán cuối cùng"><Input value={totalFinal.toLocaleString('vi-VN')} disabled style={{ color: 'red', fontWeight: 600 }} /></Form.Item></Col>
                    </Row>
                </div>
                <Space style={{ marginTop: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleImport} loading={loading}>
                        Xác nhận nhập kho
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default InventoryImport; 