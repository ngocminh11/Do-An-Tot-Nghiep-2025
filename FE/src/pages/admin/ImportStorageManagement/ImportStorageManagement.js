import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Select, message, Modal, Input, Popconfirm } from 'antd';
import storeService from '../../../services/StoreService';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const statusColors = {
    'Đợi Duyệt': 'orange',
    'Đã Duyệt': 'green',
};

const ImportStorageManagement = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [status, setStatus] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [pinModal, setPinModal] = useState({ visible: false, storageId: null });
    const [pinInput, setPinInput] = useState('');
    const [approving, setApproving] = useState(false);
    const [cancelModal, setCancelModal] = useState({ visible: false, storageId: null });
    const [cancelPin, setCancelPin] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [page, status, refresh]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await storeService.getAllImportStorage({ page, limit: 20, status });
            let list = [];
            if (Array.isArray(res?.data?.data)) list = res.data.data;
            else if (Array.isArray(res?.data)) list = res.data;
            else if (Array.isArray(res)) list = res;
            setData(list);
            setTotal(res?.data?.totalItems || 0);
        } catch (err) {
            message.error('Không thể tải danh sách phiếu nhập kho!');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (storageId) => {
        setPinModal({ visible: true, storageId });
        setPinInput('');
    };

    const handlePinOk = async () => {
        setApproving(true);
        try {
            await storeService.changeStatus(pinModal.storageId, 'Đã Duyệt', pinInput);
            message.success('Duyệt phiếu thành công!');
            setPinModal({ visible: false, storageId: null });
            setRefresh(r => !r);
        } catch (err) {
            message.error(err?.message || 'Duyệt phiếu thất bại!');
        } finally {
            setApproving(false);
        }
    };

    const handlePinCancel = () => {
        setPinModal({ visible: false, storageId: null });
        setPinInput('');
    };

    const handleCancel = (record) => {
        if (record.status === 'Đã Duyệt') {
            setCancelModal({ visible: true, storageId: record._id });
            setCancelPin('');
        } else {
            // Đợi Duyệt: chỉ xác nhận
            Modal.confirm({
                title: 'Xác nhận hủy phiếu?',
                content: 'Bạn có chắc chắn muốn hủy phiếu này? Hành động này không thể hoàn tác.',
                okText: 'Hủy phiếu',
                cancelText: 'Không',
                onOk: async () => {
                    setCancelling(true);
                    try {
                        await storeService.cancelStorage(record._id);
                        message.success('Đã hủy phiếu thành công!');
                        setRefresh(r => !r);
                    } catch (err) {
                        message.error(err?.message || 'Hủy phiếu thất bại!');
                    } finally {
                        setCancelling(false);
                    }
                }
            });
        }
    };

    const handleCancelPinOk = async () => {
        setCancelling(true);
        try {
            await storeService.cancelStorage(cancelModal.storageId, cancelPin);
            message.success('Đã hủy phiếu thành công!');
            setCancelModal({ visible: false, storageId: null });
            setRefresh(r => !r);
        } catch (err) {
            message.error(err?.message || 'Hủy phiếu thất bại!');
        } finally {
            setCancelling(false);
        }
    };

    const handleCancelPinCancel = () => {
        setCancelModal({ visible: false, storageId: null });
        setCancelPin('');
    };

    const columns = [
        {
            title: 'Mã phiếu',
            dataIndex: 'billCode',
            key: 'billCode',
        },
        {
            title: 'Ngày lập',
            dataIndex: 'billDate',
            key: 'billDate',
            render: d => d ? new Date(d).toLocaleDateString('vi-VN') : '',
        },
        {
            title: 'Người lập',
            dataIndex: 'createdBy',
            key: 'createdBy',
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier',
            key: 'supplier',
        },
        {
            title: 'Sản phẩm',
            dataIndex: ['product', 'basicInformation', 'productName'],
            key: 'productName',
            render: (_, record) => record.product?.basicInformation?.productName || 'N/A',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Giá nhập',
            dataIndex: 'originalPrice',
            key: 'originalPrice',
            render: v => v?.toLocaleString('vi-VN') || '',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: v => <Tag color={statusColors[v] || 'default'}>{v}</Tag>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <>
                    {record.status === 'Đợi Duyệt' && (
                        <Button type="primary" onClick={() => handleApprove(record._id)} style={{ marginRight: 8 }}>Duyệt phiếu</Button>
                    )}
                    {(record.status === 'Đợi Duyệt' || record.status === 'Đã Duyệt') && (
                        <Button danger loading={cancelling} onClick={() => handleCancel(record)}>
                            Hủy phiếu
                        </Button>
                    )}
                </>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Quản lý phiếu nhập kho</h2>
                <Button type="primary" onClick={() => navigate('/admin/inventory-import/select-products')}>
                    Nhập kho
                </Button>
            </div>
            <div style={{ marginBottom: 16 }}>
                <span>Lọc trạng thái: </span>
                <Select value={status} onChange={setStatus} style={{ width: 160 }} allowClear placeholder="Tất cả">
                    <Option value="Đợi Duyệt">Đợi Duyệt</Option>
                    <Option value="Đã Duyệt">Đã Duyệt</Option>
                    <Option value="Trả Hàng">Đã Duyệt</Option>
                </Select>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: 20,
                    total,
                    onChange: setPage,
                    showTotal: t => `Tổng ${t} phiếu nhập`,
                }}
            />
            <Modal
                title="Nhập mã PIN để duyệt phiếu"
                open={pinModal.visible}
                onOk={handlePinOk}
                onCancel={handlePinCancel}
                confirmLoading={approving}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Input.Password
                    placeholder="Nhập mã PIN"
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    onPressEnter={handlePinOk}
                />
            </Modal>
            <Modal
                title="Nhập mã PIN để hủy phiếu đã duyệt"
                open={cancelModal.visible}
                onOk={handleCancelPinOk}
                onCancel={handleCancelPinCancel}
                confirmLoading={cancelling}
                okText="Xác nhận hủy"
                cancelText="Hủy"
            >
                <Input.Password
                    placeholder="Nhập mã PIN"
                    value={cancelPin}
                    onChange={e => setCancelPin(e.target.value)}
                    onPressEnter={handleCancelPinOk}
                />
            </Modal>
        </div>
    );
};

export default ImportStorageManagement; 