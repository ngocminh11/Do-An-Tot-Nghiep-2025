import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Upload } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { mockUserDetails } from '../../../services/mockData';
import './Profile.scss';

const { TabPane } = Tabs;

const Profile = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // In a real app, you would make an API call here
            console.log('Form values:', values);
            message.success('Cập nhật thông tin thành công');
        } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <Card>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Thông tin cá nhân" key="1">
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={mockUserDetails}
                            onFinish={handleSubmit}
                        >
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                            >
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="dateOfBirth"
                                label="Ngày sinh"
                            >
                                <Input type="date" />
                            </Form.Item>

                            <Form.Item
                                name="gender"
                                label="Giới tính"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Cập nhật thông tin
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane tab="Địa chỉ" key="2">
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={mockUserDetails.addresses[0]}
                        >
                            <Form.Item
                                name="street"
                                label="Địa chỉ"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="city"
                                label="Thành phố"
                                rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="state"
                                label="Tỉnh/Thành phố"
                                rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="zipCode"
                                label="Mã bưu điện"
                                rules={[{ required: true, message: 'Vui lòng nhập mã bưu điện' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Cập nhật địa chỉ
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane tab="Đổi mật khẩu" key="3">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                        >
                            <Form.Item
                                name="currentPassword"
                                label="Mật khẩu hiện tại"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                label="Mật khẩu mới"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
                            >
                                <Input.Password />
                            </Form.Item>

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
                                <Input.Password />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Đổi mật khẩu
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default Profile; 