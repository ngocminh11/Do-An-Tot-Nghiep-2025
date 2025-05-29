import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { mockUsers, mockUserDetails, mockRoles } from '../../../services/mockData';
import './UserManagement.scss';

const { Option } = Select;

const UserManagement = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [users, setUsers] = useState(mockUsers);

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò',
            dataIndex: 'roleId',
            key: 'roleId',
            render: (roleId) => {
                const role = mockRoles.find(r => r._id === roleId);
                return role ? role.name : 'Unknown';
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusColors = {
                    active: 'success',
                    inactive: 'warning',
                    banned: 'error'
                };
                return <Tag color={statusColors[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            email: user.email,
            roleId: user.roleId,
            status: user.status
        });
        setIsModalVisible(true);
    };

    const handleDelete = (user) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa người dùng này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                setUsers(users.filter(u => u._id !== user._id));
                message.success('Xóa người dùng thành công');
            }
        });
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            if (editingUser) {
                // Update existing user
                setUsers(users.map(user =>
                    user._id === editingUser._id ? { ...user, ...values } : user
                ));
                message.success('Cập nhật người dùng thành công');
            } else {
                // Add new user
                const newUser = {
                    _id: Date.now().toString(),
                    ...values,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                setUsers([...users, newUser]);
                message.success('Thêm người dùng thành công');
            }
            setIsModalVisible(false);
        });
    };

    return (
        <div className="user-management">
            <div className="header">
                <h1>Quản lý người dùng</h1>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={handleAdd}
                >
                    Thêm người dùng
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText={editingUser ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
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
                        name="roleId"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                        <Select>
                            {mockRoles.map(role => (
                                <Option key={role._id} value={role._id}>
                                    {role.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select>
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Không hoạt động</Option>
                            <Option value="banned">Bị cấm</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement; 