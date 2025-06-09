import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Divider,
  Tabs,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import './UserManagement.scss';

const { Option } = Select;
const { TabPane } = Tabs;

// Mock data (in a real application these would be fetched from the backend)
const mockUsers = [
  { _id: "1", roleId: "admin", email: "admin@example.com", status: "active" },
  { _id: "2", roleId: "user", email: "user@example.com", status: "active" },
];

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
  // States for users, search term and modal handling
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // Compute filtered users based on search term (checks both email and full name)
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter((user) => {
      const userDetail = mockUserDetails.find(detail => detail.userId === user._id) || {};
      const fullName = userDetail.fullName ? userDetail.fullName.toLowerCase() : '';
      return (
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm, users]);

  // Table Column definitions
  const columns = [
    { title: 'ID', dataIndex: '_id', key: '_id', width: 60 },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => {
        const userDetail = mockUserDetails.find(detail => detail.userId === record._id);
        return userDetail ? userDetail.fullName : 'N/A';
      },
      width: 180,
    },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    {
      title: 'Role',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (roleId) => (
        <Tag color={roleId === 'admin' ? 'blue' : 'green'}>{roleId.toUpperCase()}</Tag>
      ),
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
      ),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${record.status === 'active' ? 'khóa' : 'mở khóa'} tài khoản này không?`}
            onConfirm={() => handleToggleStatus(record._id)}
            okText="Yes"
            cancelText="No"
            disabled={record.roleId === 'admin'}
          >
            <Button
              type="primary"
              danger={record.status === 'active'}
              disabled={record.roleId === 'admin'}
            >
              {record.status === 'active' ? 'Khóa' : 'Mở khóa'}
            </Button>
          </Popconfirm>
          <Button onClick={() => handleViewUser(record)}>Xem TT</Button>
        </Space>
      ),
    },
  ];

  // Handler to toggle account status (active/inactive) — disallowed for admin
  const handleToggleStatus = (id) => {
    const updatedUsers = users.map((user) =>
      user._id === id
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    );
    setUsers(updatedUsers);
    message.success('Trạng thái tài khoản đã được cập nhật thành công');
  };

  // Open the modal and set the currently viewing user
  const handleViewUser = (user) => {
    setViewingUser(user);
    setIsModalVisible(true);
  };

  // Render the detailed information inside modal using Tabs
  const renderUserDetail = () => {
    if (!viewingUser) return null;
    const userDetail = mockUserDetails.find(detail => detail.userId === viewingUser._id);
    const userOrders = mockOrders.filter(order => order.userId === viewingUser._id);
    const userLogs = mockUserLogs.filter(log => log.userId === viewingUser._id);

    return (
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Thông Tin Cá Nhân" key="1">
          {userDetail ? (
            <>
              <p><strong>Tên:</strong> {userDetail.fullName}</p>
              <p><strong>Email:</strong> {viewingUser.email}</p>
              <p><strong>Số điện thoại:</strong> {userDetail.phoneNumber}</p>
              <p>
                <strong>Ngày sinh:</strong>{' '}
                {new Date(userDetail.dateOfBirth).toLocaleDateString()}
              </p>
              <p><strong>Giới tính:</strong> {userDetail.gender}</p>
            </>
          ) : (
            <p>Không có thông tin cá nhân.</p>
          )}
        </TabPane>
        <TabPane tab="Địa Chỉ Giao Hàng" key="2">
          {userDetail && userDetail.addresses && userDetail.addresses.length > 0 ? (
            userDetail.addresses.map((address) => (
              <div key={address.addressId}>
                <p>
                  <strong>{address.label}:</strong> {address.fullAddress}, {address.ward},{' '}
                  {address.district}, {address.city}
                </p>
                <Divider style={{ margin: '8px 0' }} />
              </div>
            ))
          ) : (
            <p>Không có địa chỉ giao hàng.</p>
          )}
        </TabPane>
        <TabPane tab="Lịch Sử Giao Dịch" key="3">
          {userOrders.length > 0 ? (
            userOrders.map((order) => (
              <div key={order._id} style={{ marginBottom: '10px', borderBottom: '1px dotted #ccc' }}>
                <p><strong>Mã đơn hàng:</strong> {order._id}</p>
                <p><strong>Trạng thái:</strong> {order.orderStatus}</p>
                <p><strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString()} VND</p>
                <p>
                  <strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}
                </p>
                <Divider style={{ margin: '8px 0' }} />
              </div>
            ))
          ) : (
            <p>Không có giao dịch nào.</p>
          )}
        </TabPane>
        <TabPane tab="Lịch Sử Hoạt Động" key="4">
          {userLogs.length > 0 ? (
            userLogs.map((log) => (
              <div key={log._id} style={{ marginBottom: '10px', borderBottom: '1px dotted #ccc' }}>
                <p><strong>Loại hoạt động:</strong> {log.activityType}</p>
                <p><strong>Sản phẩm:</strong> {log.productId}</p>
                <p><strong>Từ khoá tìm kiếm:</strong> {log.searchKeyword}</p>
                <p>
                  <strong>Thời gian:</strong> {new Date(log.timestamp).toLocaleString()}
                </p>
                <p>
                  <strong>Thiết bị:</strong> {log.deviceInfo?.type} - {log.deviceInfo?.os}
                </p>
                <p>
                  <strong>Địa điểm:</strong> {log.location?.city}
                </p>
                <Divider style={{ margin: '8px 0' }} />
              </div>
            ))
          ) : (
            <p>Không có hoạt động nào.</p>
          )}
        </TabPane>
      </Tabs>
    );
  };

  return (
    <div className="user-management">
      <div className="header" style={{ marginBottom: 16 }}>
        <h1>User Management</h1>
      </div>
      <div
        className="table-header"
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Input.Search
          placeholder="Tìm kiếm người dùng (email hoặc tên)"
          onSearch={setSearchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="Thông Tin Người Dùng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {renderUserDetail()}
      </Modal>
    </div>
  );
};

export default UserManagement;