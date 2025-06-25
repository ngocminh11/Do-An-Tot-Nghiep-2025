import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Tabs, Form, Input, Button, message, Avatar, Row, Col, Divider, Typography, Space, Modal, Select, Radio, Checkbox, Table, Tag, Spin, Rate } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, ManOutlined, WomanOutlined, PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import accountService from '../../../services/accountService';
import orderService from '../../../services/orderService';
import commentService from '../../../services/commentService';
import './Profile.scss';
import AddressManagement from '../AddressManagement/AddressManagement';
import AddressForm from '../../../components/common/AddressForm';

const { Title, Text } = Typography;
const { Option } = Select;

// Memoized Order Table Component
const OrderTable = React.memo(({ orders, loadingOrders, reviewedProductIds, onOpenReview }) => {
    const orderColumns = useMemo(() => [
        {
            title: 'Mã đơn',
            dataIndex: '_id',
            key: '_id',
            render: id => <b>{id.slice(-6).toUpperCase()}</b>
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: date => date ? new Date(date).toLocaleDateString('vi-VN') : ''
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => <Tag color={status === 'completed' ? 'green' : status === 'cancelled' ? 'red' : 'blue'}>{status}</Tag>
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: total => total ? total.toLocaleString('vi-VN') + ' VNĐ' : ''
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'items',
            key: 'items',
            render: items => Array.isArray(items) ? items.map(i => i.productName || i.name).join(', ') : ''
        },
        {
            title: 'Đánh giá',
            key: 'review',
            render: (_, record) => {
                const status = (record.status || '').toLowerCase();
                const allowReview = [
                    'đã hoàn thành', 'completed', 'hoanthanh', 'done', 'thanhcong', 'success'
                ].some(s => status.includes(s));
                const itemsToReview = Array.isArray(record.items)
                    ? record.items.filter(item => !reviewedProductIds.includes(item.product || item.productId || item._id))
                    : [];
                return allowReview && itemsToReview.length > 0 ? (
                    <Button
                        size="small"
                        onClick={() => onOpenReview(record)}
                    >
                        Đánh giá đơn hàng
                    </Button>
                ) : <span style={{ color: '#aaa' }}>Chỉ đánh giá khi đã hoàn thành</span>;
            }
        }
    ], [reviewedProductIds, onOpenReview]);

    return (
        <Table
            columns={orderColumns}
            dataSource={orders}
            loading={loadingOrders}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
        />
    );
});

// Memoized Review Modal Component
const ReviewModal = React.memo(({
    visible,
    order,
    reviewList,
    submittingReview,
    onClose,
    onSubmit,
    onReviewChange
}) => {
    const orderItems = useMemo(() => {
        if (!order || !Array.isArray(order.items)) return [];
        return order.items.filter(item =>
            !item.reviewed &&
            (item.product || item.productId || item._id)
        );
    }, [order]);

    return (
        <Modal
            title="Đánh giá sản phẩm"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {orderItems.map((item, index) => {
                    const productId = item.product || item.productId || item._id;
                    const review = reviewList.find(r => r.productId === productId);

                    return (
                        <Card key={productId} style={{ marginBottom: 16 }}>
                            <Row gutter={16} align="middle">
                                <Col span={8}>
                                    <div>
                                        <strong>{item.productName || item.name}</strong>
                                        <br />
                                        <Text type="secondary">
                                            {item.quantity} x {item.price?.toLocaleString('vi-VN')} VNĐ
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={16}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Rate
                                            value={review?.rating || 0}
                                            onChange={(value) => onReviewChange(productId, 'rating', value)}
                                        />
                                    </div>
                                    <Input.TextArea
                                        placeholder="Viết đánh giá của bạn..."
                                        value={review?.content || ''}
                                        onChange={(e) => onReviewChange(productId, 'content', e.target.value)}
                                        rows={3}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    );
                })}

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button
                        type="primary"
                        onClick={onSubmit}
                        loading={submittingReview}
                        disabled={reviewList.length === 0}
                    >
                        Gửi đánh giá
                    </Button>
                </div>
            </div>
        </Modal>
    );
});

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [infoForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm] = Form.useForm();
    const addresses = user?.addresses || [];
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [reviewModal, setReviewModal] = useState({ visible: false, order: null });
    const [reviewList, setReviewList] = useState([]);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewedProductIds, setReviewedProductIds] = useState([]);

    // Memoized event handlers
    const handleInfoSubmit = useCallback(async (values) => {
        try {
            await accountService.updateUser(user._id, values);
            message.success('Cập nhật thông tin thành công!');
            if (refreshUser) await refreshUser();
        } catch (e) {
            message.error('Cập nhật thông tin thất bại!');
        }
    }, [user._id, refreshUser]);

    const showModal = useCallback((address = null) => {
        setEditingAddress(address);
        if (address) {
            addressForm.setFieldsValue(address);
        } else {
            addressForm.setFieldsValue({
                fullName: user.fullName || '',
                phoneNumber: user.phone || ''
            });
        }
        setIsModalVisible(true);
    }, [addressForm, user.fullName, user.phone]);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        addressForm.resetFields();
        setEditingAddress(null);
    }, [addressForm]);

    const handleAddressSubmit = useCallback(async (values) => {
        try {
            let newAddresses;
            if (editingAddress) {
                newAddresses = addresses.map(addr => addr.id === editingAddress.id ? { ...values, id: addr.id } : addr);
            } else {
                const newAddress = {
                    ...values,
                    id: Date.now().toString(),
                    isDefault: addresses.length === 0
                };
                newAddresses = [...addresses, newAddress];
            }
            await accountService.updateUser(user._id, { addresses: newAddresses });
            message.success(editingAddress ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ mới thành công!');
            if (refreshUser) await refreshUser();
            handleCancel();
        } catch (e) {
            message.error('Có lỗi khi cập nhật địa chỉ!');
        }
    }, [editingAddress, addresses, user._id, refreshUser, handleCancel]);

    const handleDelete = useCallback(async (addressId) => {
        try {
            let newAddresses = addresses.filter(addr => addr.id !== addressId);
            if (newAddresses.length > 0 && !newAddresses.some(addr => addr.isDefault)) {
                newAddresses[0].isDefault = true;
            }
            await accountService.updateUser(user._id, { addresses: newAddresses });
            message.success('Xóa địa chỉ thành công!');
            if (refreshUser) await refreshUser();
        } catch (e) {
            message.error('Có lỗi khi xóa địa chỉ!');
        }
    }, [addresses, user._id, refreshUser]);

    const setDefaultAddress = useCallback(async (addressId) => {
        try {
            const newAddresses = addresses.map(addr => ({ ...addr, isDefault: addr.id === addressId }));
            await accountService.updateUser(user._id, { addresses: newAddresses });
            message.success('Đã cập nhật địa chỉ mặc định!');
            if (refreshUser) await refreshUser();
        } catch (e) {
            message.error('Có lỗi khi cập nhật địa chỉ mặc định!');
        }
    }, [addresses, user._id, refreshUser]);

    const handlePasswordSubmit = useCallback(async (values) => {
        try {
            await accountService.updateUser(user._id, { password: values.newPassword });
            message.success('Đổi mật khẩu thành công!');
            if (refreshUser) await refreshUser();
        } catch (e) {
            message.error('Đổi mật khẩu thất bại!');
        }
    }, [user._id, refreshUser]);

    const fetchReviewedProductIds = useCallback(async (orderId) => {
        try {
            const res = await commentService.getCommentsByOrder(orderId);
            if (res && Array.isArray(res)) {
                const reviewedIds = res.map(comment => comment.productId?._id || comment.productId);
                setReviewedProductIds(reviewedIds);
            }
        } catch (error) {
            console.error('Error fetching reviewed products:', error);
            setReviewedProductIds([]);
        }
    }, []);

    const handleOpenReview = useCallback(async (order) => {
        setReviewModal({ visible: true, order });
        setReviewList([]);
        await fetchReviewedProductIds(order._id);
    }, [fetchReviewedProductIds]);

    const handleCloseReview = useCallback(() => {
        setReviewModal({ visible: false, order: null });
        setReviewList([]);
    }, []);

    const handleReviewChange = useCallback((productId, field, value) => {
        setReviewList(prev => {
            const existing = prev.find(r => r.productId === productId);
            if (existing) {
                return prev.map(r => r.productId === productId ? { ...r, [field]: value } : r);
            } else {
                return [...prev, { productId, [field]: value }];
            }
        });
    }, []);

    const handleSubmitReview = useCallback(async () => {
        if (reviewList.length === 0) {
            message.warning('Vui lòng viết ít nhất một đánh giá!');
            return;
        }

        setSubmittingReview(true);
        try {
            const orderId = reviewModal.order._id;
            const promises = reviewList.map(review =>
                commentService.createComment({
                    productId: review.productId,
                    orderId: orderId,
                    rating: review.rating,
                    content: review.content
                })
            );

            await Promise.all(promises);
            message.success('Đánh giá đã được gửi thành công!');
            handleCloseReview();

            // Refresh orders to update review status
            const res = await orderService.getUserOrders();
            setOrders(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error('Error submitting reviews:', error);
            message.error('Có lỗi khi gửi đánh giá!');
        } finally {
            setSubmittingReview(false);
        }
    }, [reviewList, reviewModal.order, handleCloseReview]);

    // Optimized useEffect for form initialization
    useEffect(() => {
        if (user) {
            infoForm.setFieldsValue({
                fullName: user.fullName || user.name || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth || '',
                gender: user.gender || '',
            });
            if (user.addresses && user.addresses[0]) {
                addressForm.setFieldsValue({
                    street: user.addresses[0].street || user.addresses[0].address || '',
                    city: user.addresses[0].city || '',
                    state: user.addresses[0].state || '',
                    zipCode: user.addresses[0].zipCode || '',
                });
            } else {
                addressForm.resetFields();
            }
        }
    }, [user, infoForm, addressForm]);

    // Optimized useEffect for orders fetching
    useEffect(() => {
        let isMounted = true;

        async function fetchOrders() {
            setLoadingOrders(true);
            try {
                const res = await orderService.getUserOrders();
                if (isMounted) {
                    setOrders(Array.isArray(res) ? res : []);
                    if (Array.isArray(res)) {
                        console.log('Order status debug:', res.map(o => o.status));
                    }
                }
            } catch {
                if (isMounted) {
                    setOrders([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingOrders(false);
                }
            }
        }

        if (user?._id) {
            fetchOrders();
        }

        return () => {
            isMounted = false;
        };
    }, [user?._id]);

    if (!user) return <div className="profile-page"><Card><Text type="danger">Vui lòng đăng nhập để xem thông tin cá nhân.</Text></Card></div>;

    return (
        <div className="profile-page" style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
            <Row gutter={32} align="top">
                <Col xs={24} md={7} style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Avatar size={110} icon={<UserOutlined />} src={user.avatar} style={{ marginBottom: 18 }} />
                    <Title level={4} style={{ marginBottom: 0 }}>{user.fullName || user.name || 'Chưa cập nhật'}</Title>
                    <Text type="secondary">{user.role ? user.role.toUpperCase() : 'Khách hàng'}</Text>
                    <Divider />
                    <div style={{ marginBottom: 8 }}><MailOutlined /> {user.email}</div>
                    <div><PhoneOutlined /> {user.phone || 'Chưa cập nhật'}</div>
                </Col>
                <Col xs={24} md={17}>
                    <Tabs defaultActiveKey="1" tabBarGutter={32} style={{ background: 'transparent' }}>
                        <Tabs.TabPane tab="Thông tin cá nhân" key="1">
                            <Card bordered={false} style={{ marginBottom: 24 }}>
                                <Form
                                    form={infoForm}
                                    layout="vertical"
                                    onFinish={handleInfoSubmit}
                                >
                                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}> <Input prefix={<UserOutlined />} placeholder="Họ và tên" /> </Form.Item>
                                    <Form.Item name="phone" label="Số điện thoại"> <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" /> </Form.Item>
                                    <Form.Item name="dateOfBirth" label="Ngày sinh"> <Input type="date" placeholder="Ngày sinh" /> </Form.Item>
                                    <Form.Item name="gender" label="Giới tính"> <Input prefix={user.gender === 'Nam' ? <ManOutlined /> : <WomanOutlined />} placeholder="Giới tính" /> </Form.Item>
                                    <Form.Item> <Button type="primary" htmlType="submit">Cập nhật thông tin</Button> </Form.Item>
                                </Form>
                            </Card>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Địa chỉ" key="2">
                            <Card bordered={false} style={{ marginBottom: 24 }}>
                                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Title level={4} style={{ margin: 0 }}>Địa chỉ giao hàng</Title>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                                        Thêm địa chỉ mới
                                    </Button>
                                </div>
                                {addresses.length === 0 ? (
                                    <Card style={{ textAlign: 'center', marginBottom: 24 }}>
                                        <Text>Bạn chưa có địa chỉ nào.</Text>
                                        <div style={{ marginTop: 16 }}>
                                            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                                                Thêm địa chỉ đầu tiên
                                            </Button>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="address-list">
                                        {addresses.map(address => (
                                            <Card
                                                key={address.id}
                                                className={`address-card ${address.isDefault ? 'default' : ''}`}
                                                style={{ marginBottom: 16 }}
                                            >
                                                <div className="address-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Space>
                                                        {address.isDefault ? (
                                                            <StarFilled className="default-icon" style={{ color: '#faad14' }} />
                                                        ) : (
                                                            <StarOutlined
                                                                className="set-default-icon"
                                                                style={{ color: '#bbb', cursor: 'pointer' }}
                                                                onClick={() => setDefaultAddress(address.id)}
                                                            />
                                                        )}
                                                        <Text strong>{address.fullName}</Text>
                                                        {address.isDefault && <Text type="secondary">(Mặc định)</Text>}
                                                    </Space>
                                                    <Space>
                                                        <Button
                                                            type="text"
                                                            icon={<EditOutlined />}
                                                            onClick={() => showModal(address)}
                                                        />
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDelete(address.id)}
                                                        />
                                                    </Space>
                                                </div>
                                                <div className="address-content" style={{ marginTop: 8 }}>
                                                    <Text>{address.phoneNumber}</Text><br />
                                                    <Text>{`${address.address}, ${address.ward}, ${address.district}, ${address.city}`}</Text>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                                <Modal
                                    title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                                    open={isModalVisible}
                                    onCancel={handleCancel}
                                    footer={null}
                                    width={600}
                                    styles={{ body: { padding: 24 } }}
                                >
                                    <div style={{ marginBottom: 12, color: '#888' }}>
                                        Vui lòng nhập đầy đủ thông tin để đảm bảo giao hàng chính xác.
                                    </div>
                                    <AddressForm
                                        form={addressForm}
                                        initialValues={editingAddress || { fullName: user.fullName || '', phoneNumber: user.phone || '' }}
                                        onFinish={handleAddressSubmit}
                                        editingAddress={editingAddress}
                                        addresses={addresses}
                                        showIsDefault={true}
                                        onCancel={handleCancel}
                                        submitText={editingAddress ? 'Cập nhật' : 'Thêm mới'}
                                    />
                                </Modal>
                            </Card>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Đổi mật khẩu" key="3">
                            <Card bordered={false} style={{ marginBottom: 24 }}>
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handlePasswordSubmit}
                                >
                                    <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}> <Input.Password placeholder="Mật khẩu hiện tại" /> </Form.Item>
                                    <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}> <Input.Password placeholder="Mật khẩu mới" /> </Form.Item>
                                    <Form.Item
                                        name="confirmPassword"
                                        label="Xác nhận mật khẩu mới"
                                        dependencies={['newPassword']}
                                        rules={[
                                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('newPassword') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Mật khẩu không khớp'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                                    </Form.Item>
                                    <Form.Item> <Button type="primary" htmlType="submit">Đổi mật khẩu</Button> </Form.Item>
                                </Form>
                            </Card>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Đơn hàng của tôi" key="4">
                            <Card bordered={false} style={{ marginBottom: 24 }}>
                                <div style={{ marginTop: 16 }}>
                                    {loadingOrders ? <Spin /> : (
                                        <OrderTable
                                            orders={orders}
                                            loadingOrders={loadingOrders}
                                            reviewedProductIds={reviewedProductIds}
                                            onOpenReview={handleOpenReview}
                                        />
                                    )}
                                </div>
                            </Card>
                        </Tabs.TabPane>
                    </Tabs>
                </Col>
            </Row>
            <ReviewModal
                visible={reviewModal.visible}
                order={reviewModal.order}
                reviewList={reviewList}
                submittingReview={submittingReview}
                onClose={handleCloseReview}
                onSubmit={handleSubmitReview}
                onReviewChange={handleReviewChange}
            />
        </div>
    );
};

export default Profile; 