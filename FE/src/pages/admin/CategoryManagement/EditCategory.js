import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import categoryService from '../../../services/categoryService';

const EditCategory = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategory = async () => {
            setLoading(true);
            try {
                const category = await categoryService.getCategoryById(id);
                if (category) {
                    form.setFieldsValue(category);
                } else {
                    message.error('Không tìm thấy danh mục!');
                    navigate('/admin/categories');
                }
            } catch (error) {
                message.error('Không thể tải thông tin danh mục.');
                console.error('Failed to fetch category for edit:', error);
                navigate('/admin/categories');
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [id, form, navigate]);

    const handleFinish = async (values) => {
        try {
            await categoryService.updateCategory(id, values);
            message.success('Cập nhật danh mục thành công!');
            navigate('/admin/categories');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Cập nhật danh mục thất bại!';
            message.error(errorMessage);
            console.error('Failed to update category:', error);
        }
    };

    return (
        <div className="category-management">
            <h1>Sửa danh mục</h1>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Form form={form} layout="vertical" onFinish={handleFinish} style={{ maxWidth: 500 }}>
                    <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}> <Input /> </Form.Item>
                    <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}> <Input.TextArea rows={4} /> </Form.Item>
                    <Form.Item name="parentId" label="Danh mục cha"> <Input placeholder="Enter parent category ID (optional)" /> </Form.Item>
                    <Form.Item> <Button type="primary" htmlType="submit">Lưu thay đổi</Button> <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/categories')}>Hủy</Button> </Form.Item>
                </Form>
            )}
        </div>
    );
};

export default EditCategory; 