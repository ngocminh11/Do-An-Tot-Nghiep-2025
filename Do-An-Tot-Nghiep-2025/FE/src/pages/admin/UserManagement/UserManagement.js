import React, { useState, useEffect } from 'react';
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
  Form,
  Row,
  Col,
  Card,
  Statistic,
} from 'antd';
import { DeleteOutlined, EditOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import accountService from '../../../services/accountService';
import './UserManagement.scss';

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch users with pagination and filters
  const fetchUsers = async (params = {}) => {
    try {
      setLoading(true);
      const { current, pageSize, ...filters } = params;
      const response = await accountService.getAllUsers({
        page: current,
        limit: pageSize,
        ...filters
      });

      if (response && response.data) {
        setUsers(response.data.data);
        setPagination({
          ...pagination,
          total: response.data.total,
          current: response.data.currentPage
        });
      }
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination);
  }, []);

  // Handle table change (pagination, sorting, filtering)
  const handleTableChange = (pagination, filters, sorter) => {
    fetchUsers({
      ...pagination,
      ...filters,
      sortBy: sorter.field,
      sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
    });
  };

  // Handle user update
  const handleUpdateUser = async (values) => {
    try {
      await accountService.updateUser(editingUser._id, values);
      message.success('Cập nhật người dùng thành công');
      setIsModalVisible(false);
      fetchUsers(pagination);
    } catch (error) {
      message.error(error.message || 'Không thể cập nhật người dùng');
    }
  };

  // Handle user delete
  const handleDeleteUser = async (id) => {
    try {
      await accountService.deleteUser(id);
      message.success('Xóa người dùng thành công');
      fetchUsers(pagination);
    } catch (error) {
      message.error(error.message || 'Không thể xóa người dùng');
    }
  };

  // Table columns definition
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 100,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: 'Loại da',
      dataIndex: 'skinType',
      key: 'skinType',
      width: 150,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={role === 'admin' ? 'blue' : 'green'}>
          {role === 'admin' ? 'Admin' : 'Khách hàng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue({
                fullName: record.fullName,
                email: record.email,
                phone: record.phone,
                skinType: record.skinType,
                gender: record.gender,
                address: record.address,
                role: record.role
              });
              setIsModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div className="header" style={{ marginBottom: 16 }}>
              <h1>Quản lý người dùng</h1>
            </div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Input.Search
                  placeholder="Tìm kiếm theo tên hoặc email"
                  onSearch={(value) => {
                    setSearchTerm(value);
                    fetchUsers({ ...pagination, fullName: value, email: value });
                  }}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={8}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Lọc theo vai trò"
                  onChange={(value) => fetchUsers({ ...pagination, role: value })}
                >
                  <Option value="">Tất cả</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="customer">Khách hàng</Option>
                </Select>
              </Col>
            </Row>
            <Table
              columns={columns}
              dataSource={users}
              rowKey="_id"
              pagination={pagination}
              loading={loading}
              onChange={handleTableChange}
            />
          </Card>
        </Col>
      </Row>

      {/* Edit User Modal */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateUser}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên' },
              { min: 3, max: 100, message: 'Họ và tên phải từ 3 đến 100 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="skinType"
            label="Loại da"
            rules={[{ required: true, message: 'Vui lòng chọn loại da' }]}
          >
            <Select>
              <Option value="Da khô">Da khô</Option>
              <Option value="Da dầu">Da dầu</Option>
              <Option value="Da hỗn hợp">Da hỗn hợp</Option>
              <Option value="Da nhạy cảm">Da nhạy cảm</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select>
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ' },
              { min: 5, max: 300, message: 'Địa chỉ phải từ 5 đến 300 ký tự' }
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="customer">Khách hàng</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Lưu thay đổi
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;