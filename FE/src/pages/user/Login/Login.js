import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../../../services/mockData';
import './Login.scss';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = (values) => {
        setLoading(true);

        // Check if it's admin login
        if (values.password === '123456') {
            // Set admin token
            localStorage.setItem('token', 'admin-token');
            localStorage.setItem('userRole', 'admin');
            message.success('Đăng nhập thành công!');
            navigate('/admin');
        } else {
            // Check regular user login
            const user = mockUsers.find(u => u.email === values.email);
            if (user) {
                localStorage.setItem('token', 'user-token');
                localStorage.setItem('userRole', 'customer');
                message.success('Đăng nhập thành công!');
                navigate('/');
            } else {
                message.error('Email hoặc mật khẩu không đúng!');
            }
        }

        setLoading(false);
    };

    return (
        <div className="login-page">
            <Card className="login-card">
                <h2>Đăng nhập</h2>
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login; 