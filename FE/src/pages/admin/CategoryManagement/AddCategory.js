import React, { useEffect } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../../services/categoryService';

const AddCategory = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleFinish = async (values) => {
        try {
            await categoryService.createCategory(values);
            message.success('Thêm danh mục thành công!');
            form.resetFields();
            navigate('/admin/categories');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Thêm danh mục thất bại!';
            message.error(errorMessage);
            console.error('Failed to add category:', error);
        }
    };

    return (
        <div className="category-management">
            <h1>Thêm danh mục</h1>
            <Form form={form} layout="vertical" onFinish={handleFinish} style={{ maxWidth: 500 }}>
                <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}> <Input /> </Form.Item>
                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}> <Input.TextArea rows={4} /> </Form.Item>
                <Form.Item name="parentId" label="Danh mục cha"> <Input placeholder="Enter parent category ID (optional)" /> </Form.Item>
                <Form.Item> <Button type="primary" htmlType="submit">Thêm danh mục</Button> <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/categories')}>Hủy</Button> </Form.Item>
            </Form>
        </div>
    );
};

export default AddCategory; 