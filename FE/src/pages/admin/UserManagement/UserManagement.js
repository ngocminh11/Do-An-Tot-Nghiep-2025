import React, { useState } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    message,
    Popconfirm,
    Tag,
    Divider
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import './UserManagement.scss';

const { Option } = Select;

// Dữ liệu tĩnh dựa theo JSON mẫu

// 1. Thông tin tài khoản người dùng (User)
const mockUsers = [
    { _id: "1", roleId: "admin", email: "admin@example.com", status: "active" },
    { _id: "2", roleId: "user", email: "user@example.com", status: "active" },
];

// 2. Chi tiết tài khoản người dùng (User Detail)
const mockUserDetails = [
    {
        _id: "ud1",
        userId: "1",
        fullName: "Admin Nguyen",
        phoneNumber: "0123456789",
        dateOfBirth: "1990-01-01T00:00:00Z",
        gender: "male",
    },
    {
        _id: "ud2",
        userId: "2",
        fullName: "Nguyễn Văn A",
        phoneNumber: "0901234567",
        dateOfBirth: "1990-01-01T00:00:00Z",
        gender: "male",
        addresses: [
            {
                addressId: "a2",
                label: "Nhà",
                fullAddress: "123 Đường ABC, Phường XYZ",
                city: "Hồ Chí Minh",
                district: "Quận 1",
                ward: "Phường Bến Nghé",
                isDefault: true,
            },
        ],
    },
];

// 3. Quyền hạn của người dùng (User Permissions)
const mockUserPermissions = [
    {
        _id: "perm1",
        name: "manageUsers",
        description: "Quyền quản lý người dùng",
    },
];

// 4. Sản phẩm (Products)
const mockProducts = [
    {
        _id: "p1",
        name: "Serum Vitamin C Chống Lão Hóa",
        description: "Serum Vitamin C giúp làm sáng da, mờ thâm và chống lão hóa hiệu quả.",
        brand: "The Ordinary",
        categoryId: "cat1",
        price: 250000.0,
        stockQuantity: 50,
        attributes: {
            volume: "30ml",
            skinType: ["da dầu", "da hỗn hợp", "da thường"],
        },
        imageUrls: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
        viewCount: 1200,
        purchaseCount: 300,
        averageRating: 4.8,
        tags: ["vitamin c", "serum", "chống lão hóa"],
        status: "published",
        createdAt: "2025-05-20T10:00:00Z",
        updatedAt: "2025-05-21T11:00:00Z",
    },
];

// 5. Đơn hàng (Order) – lịch sử giao dịch
const mockOrders = [
    {
        _id: "o1",
        userId: "2",
        cartSnapshot: {
            items: [
                {
                    productId: "p1",
                    productName: "Serum Vitamin C",
                    quantity: 2,
                    pricePerUnit: 250000.0,
                },
            ],
            subTotal: 500000.0,
            discountAmount: 50000.0,
        },
        shippingInformation: {
            recipientName: "Nguyễn Thị B",
            phoneNumber: "0912345678",
            address: "456 Đường XYZ, Phường LMN, Quận UVW, TP.HCM",
            city: "Hồ Chí Minh",
            district: "Quận UVW",
            ward: "Phường LMN",
            shippingFee: 30000.0,
        },
        paymentMethod: "cod",
        paymentStatus: "pending",
        orderStatus: "pending_confirmation",
        totalAmount: 480000.0,
        discountCodeUsed: "SUMMERFLASH10",
        customerNote: "Giao hàng vào giờ hành chính, vui lòng gọi trước.",
        internalNote: "Khách hàng VIP, ưu tiên xử lý.",
        createdAt: "2025-05-24T04:12:00Z",
        updatedAt: "2025-05-24T04:15:00Z",
    },
];

// 6. Nhật ký hoạt động của người dùng (User’s Log) – ví dụ bổ sung (không dùng trong component demo)
const mockUserLogs = [
    {
        _id: "l1",
        userId: "2",
        activityType: "viewed_product",
        productId: "p1",
        categoryId: "",
        searchKeyword: "kem chống nắng",
        timestamp: "2025-05-24T10:30:00Z",
        deviceInfo: {
            type: "mobile",
            os: "iOS",
        },
        location: {
            city: "Hà Nội",
        },
    },
];

const UserManagement = () => {
    const [users, setUsers] = useState(mockUsers);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [form] = Form.useForm();

    // Định nghĩa các cột cho Table
    const columns = [
        { title: 'ID', dataIndex: '_id', key: '_id' },
        {
            title: 'Name',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (_, record) => {
                // Lấy thông tin fullName từ mockUserDetails dựa vào userId
                const userDetail = mockUserDetails.find(detail => detail.userId === record._id);
                return userDetail ? userDetail.fullName : 'N/A';
            },
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Role',
            dataIndex: 'roleId',
            key: 'roleId',
            render: (roleId) => (
                <Tag color={roleId === 'admin' ? 'blue' : 'green'}>
                    {roleId.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Popconfirm
                        title={`Bạn có chắc chắn muốn ${record.roleId === 'admin' ? 'khóa' : 'mở khóa'} tài khoản này không?`}
                        onConfirm={() => handleToggleStatus(record._id)}
                        okText="Yes"
                        cancelText="No"
                        disabled={record.roleId === 'admin'}
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={record.roleId === 'admin'}
                        >
                            {record.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        </Button>
                    </Popconfirm>
                    <Button onClick={() => handleViewUser(record)}>Xem Thông Tin</Button>
                </Space>
            ),
        },
    ];

    // Hàm cập nhật trạng thái (active/inactive) của tài khoản
    const handleToggleStatus = (id) => {
        setUsers(users.map(user =>
            user._id === id
                ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
                : user
        ));
        message.success('Trạng thái tài khoản đã được cập nhật thành công');
    };

    // Mở modal xem thông tin chi tiết của user
    const handleViewUser = (user) => {
        setViewingUser(user);
        setIsModalVisible(true);
    };

    // Render nội dung chi tiết: cá nhân, địa chỉ giao hàng và lịch sử giao dịch
    const renderUserDetail = () => {
        if (!viewingUser) return null;
        const userDetail = mockUserDetails.find(detail => detail.userId === viewingUser._id);
        // Lọc đơn hàng theo userId
        const userOrders = mockOrders.filter(order => order.userId === viewingUser._id);

        return (
            <div>
                {userDetail && (
                    <div>
                        <h3>Thông Tin Cá Nhân</h3>
                        <p><strong>Tên:</strong> {userDetail.fullName}</p>
                        <p><strong>Email:</strong> {viewingUser.email}</p>
                        <p><strong>Số điện thoại:</strong> {userDetail.phoneNumber}</p>
                        <p>
                            <strong>Ngày sinh:</strong>{' '}
                            {new Date(userDetail.dateOfBirth).toLocaleDateString()}
                        </p>
                        <p><strong>Giới tính:</strong> {userDetail.gender}</p>
                        <Divider />
                        <h3>Địa chỉ giao hàng</h3>
                        {userDetail.addresses && userDetail.addresses.length > 0 ? (
                            userDetail.addresses.map(address => (
                                <div key={address.addressId}>
                                    <p>
                                        <strong>{address.label}:</strong> {address.fullAddress}, {address.ward}, {address.district}, {address.city}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>Không có địa chỉ giao hàng.</p>
                        )}
                    </div>
                )}
                <Divider />
                <div>
                    <h3>Lịch sử giao dịch</h3>
                    {userOrders.length > 0 ? (
                        userOrders.map(order => (
                            <div key={order._id} style={{ marginBottom: '10px', borderBottom: '1px dotted #ccc' }}>
                                <p><strong>Mã đơn hàng:</strong> {order._id}</p>
                                <p><strong>Trạng thái:</strong> {order.orderStatus}</p>
                                <p>
                                    <strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString()} VND
                                </p>
                                <p>
                                    <strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>Không có giao dịch nào.</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="user-management">
            <div className="header">
                <h1>User Management</h1>
            </div>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
            />
            <Modal
                title="Thông Tin Người Dùng"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                {renderUserDetail()}
            </Modal>
        </div>
    );
};

export default UserManagement;