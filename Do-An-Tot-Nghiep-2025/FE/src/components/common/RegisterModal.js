import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import authService from '../../services/authService';

const RegisterModal = ({ open, onClose, onRegisterSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const res = await authService.register(values);
            if (res && res.data) {
                message.success('Đăng ký thành công! Hãy đăng nhập.');
                onRegisterSuccess && onRegisterSuccess();
                onClose();
            } else {
                message.error(res.message || 'Đăng ký thất bại!');
            }
        } catch (err) {
            message.error('Đăng ký thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title="Đăng ký"
            destroyOnClose
        >
            <Form layout="vertical" onFinish={handleFinish}>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}>
                    <Input type="email" autoComplete="email" />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                    <Input.Password autoComplete="new-password" />
                </Form.Item>
                <Form.Item name="confirm" label="Nhập lại mật khẩu" dependencies={["password"]} rules={[
                    { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu không khớp!'));
                        },
                    }),
                ]}>
                    <Input.Password autoComplete="new-password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Đăng ký
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RegisterModal; 