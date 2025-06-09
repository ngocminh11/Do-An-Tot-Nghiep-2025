import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const AddTag = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleFinish = (values) => {
        message.success('Thêm tag thành công (mock)');
        navigate('/admin/tags');
    };

    return (
        <div className="tag-management">
            <h1>Thêm tag</h1>
            <Form form={form} layout="vertical" onFinish={handleFinish} style={{ maxWidth: 500 }}>
                <Form.Item name="name" label="Tên tag" rules={[{ required: true, message: 'Vui lòng nhập tên tag' }]}> <Input /> </Form.Item>
                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}> <Input.TextArea rows={3} /> </Form.Item>
                <Form.Item> <Button type="primary" htmlType="submit">Thêm tag</Button> <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/tags')}>Hủy</Button> </Form.Item>
            </Form>
        </div>
    );
};

export default AddTag; 