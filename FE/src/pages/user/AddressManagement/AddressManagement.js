import React, { useState } from 'react';
import {
    Card,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Typography,
    Space,
    Popconfirm,
    Radio
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import './AddressManagement.scss';

const { Title, Text } = Typography;
const { Option } = Select;

// Mock data for addresses
const mockAddresses = [
    {
        id: '1',
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0987654321',
        address: '123 Đường ABC',
        city: 'TP Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        isDefault: true
    },
    {
        id: '2',
        fullName: 'Nguyễn Văn B',
        phoneNumber: '0987654322',
        address: '456 Đường XYZ',
        city: 'TP Hồ Chí Minh',
        district: 'Quận Bình Thạnh',
        ward: 'Phường 25',
        isDefault: false
    }
];

const AddressManagement = () => {
    const [addresses, setAddresses] = useState(mockAddresses);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [form] = Form.useForm();

    const showModal = (address = null) => {
        setEditingAddress(address);
        if (address) {
            form.setFieldsValue(address);
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingAddress(null);
    };

    const handleSubmit = (values) => {
        if (editingAddress) {
            // Update existing address
            setAddresses(prevAddresses =>
                prevAddresses.map(addr =>
                    addr.id === editingAddress.id ? { ...values, id: addr.id } : addr
                )
            );
            message.success('Cập nhật địa chỉ thành công!');
        } else {
            // Add new address
            const newAddress = {
                ...values,
                id: Date.now().toString(),
                isDefault: addresses.length === 0 // Set as default if it's the first address
            };
            setAddresses(prevAddresses => [...prevAddresses, newAddress]);
            message.success('Thêm địa chỉ mới thành công!');
        }
        handleCancel();
    };

    const handleDelete = (addressId) => {
        setAddresses(prevAddresses => {
            const newAddresses = prevAddresses.filter(addr => addr.id !== addressId);
            // If deleted address was default, set the first remaining address as default
            if (newAddresses.length > 0 && !newAddresses.some(addr => addr.isDefault)) {
                newAddresses[0].isDefault = true;
            }
            return newAddresses;
        });
        message.success('Xóa địa chỉ thành công!');
    };

    const setDefaultAddress = (addressId) => {
        setAddresses(prevAddresses =>
            prevAddresses.map(addr => ({
                ...addr,
                isDefault: addr.id === addressId
            }))
        );
        message.success('Đã cập nhật địa chỉ mặc định!');
    };

    return (
        <div className="address-management">
            <div className="header">
                <Title level={2}>Địa chỉ giao hàng</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                >
                    Thêm địa chỉ mới
                </Button>
            </div>

            <div className="address-list">
                {addresses.map(address => (
                    <Card
                        key={address.id}
                        className={`address-card ${address.isDefault ? 'default' : ''}`}
                    >
                        <div className="address-header">
                            <Space>
                                {address.isDefault ? (
                                    <StarFilled className="default-icon" />
                                ) : (
                                    <StarOutlined
                                        className="set-default-icon"
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
                                <Popconfirm
                                    title="Bạn có chắc muốn xóa địa chỉ này?"
                                    onConfirm={() => handleDelete(address.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                    />
                                </Popconfirm>
                            </Space>
                        </div>
                        <div className="address-content">
                            <Text>{address.phoneNumber}</Text>
                            <Text>{`${address.address}, ${address.ward}, ${address.district}, ${address.city}`}</Text>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={editingAddress}
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="city"
                        label="Tỉnh/Thành phố"
                        rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
                    >
                        <Select placeholder="Chọn Tỉnh/Thành phố">
                            <Option value="TP Hồ Chí Minh">TP Hồ Chí Minh</Option>
                            <Option value="Hà Nội">Hà Nội</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="district"
                        label="Quận/Huyện"
                        rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện!' }]}
                    >
                        <Select placeholder="Chọn Quận/Huyện">
                            <Option value="Quận 1">Quận 1</Option>
                            <Option value="Quận Bình Thạnh">Quận Bình Thạnh</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="ward"
                        label="Phường/Xã"
                        rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
                    >
                        <Select placeholder="Chọn Phường/Xã">
                            <Option value="Phường Bến Nghé">Phường Bến Nghé</Option>
                            <Option value="Phường 25">Phường 25</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Địa chỉ chi tiết"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    {!editingAddress && addresses.length > 0 && (
                        <Form.Item
                            name="isDefault"
                            valuePropName="checked"
                        >
                            <Radio>Đặt làm địa chỉ mặc định</Radio>
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingAddress ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={handleCancel}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AddressManagement; 