import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { mockTags } from '../../../services/mockData';

const EditTag = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const tag = mockTags.find(t => t._id === id);
        if (tag) {
            form.setFieldsValue(tag);
        }
    }, [id, form]);

    const handleFinish = (values) => {
        message.success('Cập nhật tag thành công (mock)');
        navigate('/admin/tags');
    };

    return (
        <div className="tag-management">
            <h1>Sửa tag</h1>
            <Form form={form} layout="vertical" onFinish={handleFinish} style={{ maxWidth: 500 }}>
                <Form.Item name="name" label="Tên tag" rules={[{ required: true, message: 'Vui lòng nhập tên tag' }]}> <Input /> </Form.Item>
                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}> <Input.TextArea rows={3} /> </Form.Item>
                <Form.Item> <Button type="primary" htmlType="submit">Lưu thay đổi</Button> <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/tags')}>Hủy</Button> </Form.Item>
            </Form>
        </div>
    );
};

export default EditTag; 