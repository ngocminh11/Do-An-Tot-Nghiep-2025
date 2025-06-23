import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import authService from '../../services/authService';

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const res = await authService.login(values);
            if (res && res.data && res.data.token) {
                localStorage.setItem('token', res.data.token);
                message.success('Đăng nhập thành công!');
                onLoginSuccess && onLoginSuccess();
                onClose();
            } else {
                message.error(res.message || 'Đăng nhập thất bại!');
            }
        } catch (err) {
            message.error('Sai tài khoản hoặc mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title="Đăng nhập"
            destroyOnClose
        >
            <Form layout="vertical" onFinish={handleFinish}>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}>
                    <Input type="email" autoComplete="email" />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                    <Input.Password autoComplete="current-password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default LoginModal; 