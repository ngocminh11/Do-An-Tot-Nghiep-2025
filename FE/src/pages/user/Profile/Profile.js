import React, { useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, message, Avatar, Row, Col, Divider, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import './Profile.scss';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const Profile = () => {
    const { user } = useAuth();
    const [infoForm] = Form.useForm();
    const [addressForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    // Luôn cập nhật form khi user thay đổi
    useEffect(() => {
        if (user) {
            infoForm.setFieldsValue(user);
            if (user.addresses && user.addresses[0]) {
                addressForm.setFieldsValue(user.addresses[0]);
            }
        }
    }, [user, infoForm, addressForm]);

    if (!user) return <div className="profile-page"><Card><Text type="danger">Vui lòng đăng nhập để xem thông tin cá nhân.</Text></Card></div>;

    const handleInfoSubmit = async (values) => {
        message.success('Cập nhật thông tin thành công!');
    };

    const handleAddressSubmit = async (values) => {
        message.success('Cập nhật địa chỉ thành công!');
    };

    const handlePasswordSubmit = async (values) => {
        message.success('Đổi mật khẩu thành công!');
    };

    return (
        <div className="profile-page">
            <Card className="profile-card" bordered={false}>
                <Row gutter={24} align="middle">
                    <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                        <Avatar size={96} icon={<UserOutlined />} src={user.avatar} style={{ marginBottom: 16 }} />
                        <Title level={4} style={{ marginBottom: 0 }}>{user.fullName || user.name || 'Chưa cập nhật'}</Title>
                        <Text type="secondary">{user.role ? user.role.toUpperCase() : 'Khách hàng'}</Text>
                        <Divider />
                        <Text><MailOutlined /> {user.email}</Text><br />
                        <Text><PhoneOutlined /> {user.phone || 'Chưa cập nhật'}</Text>
                    </Col>
                    <Col xs={24} md={18}>
                        <Tabs defaultActiveKey="1" tabBarGutter={32}>
                            <TabPane tab="Thông tin cá nhân" key="1">
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
                            </TabPane>
                            <TabPane tab="Địa chỉ" key="2">
                                <Form
                                    form={addressForm}
                                    layout="vertical"
                                    onFinish={handleAddressSubmit}
                                >
                                    <Form.Item name="street" label="Địa chỉ"> <Input placeholder="Địa chỉ" /> </Form.Item>
                                    <Form.Item name="city" label="Thành phố"> <Input placeholder="Thành phố" /> </Form.Item>
                                    <Form.Item name="state" label="Tỉnh/Thành phố"> <Input placeholder="Tỉnh/Thành phố" /> </Form.Item>
                                    <Form.Item name="zipCode" label="Mã bưu điện"> <Input placeholder="Mã bưu điện" /> </Form.Item>
                                    <Form.Item> <Button type="primary" htmlType="submit">Cập nhật địa chỉ</Button> </Form.Item>
                                </Form>
                            </TabPane>
                            <TabPane tab="Đổi mật khẩu" key="3">
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
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Profile; 