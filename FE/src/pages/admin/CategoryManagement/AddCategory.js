import React, { useState } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../../services/categoryService';

const { Option } = Select;

const AddCategory = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            const categoryData = {
                name: values.name.trim(),
                description: values.description.trim(),
                status: values.status || 'active'
            };

            const created = await categoryService.createCategory(categoryData);

            if (created) {
                message.success({
                    content: 'Thêm danh mục thành công!',
                    duration: 2,
                    onClose: () => {
                        navigate('/admin/categories', {
                            state: {
                                message: 'Thêm danh mục thành công!',
                                type: 'success'
                            }
                        });
                    }
                });
            }
        } catch (error) {
            const errorMessage = error?.message || error?.msg || 'Thêm danh mục thất bại!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="category-management">
            <h1>Thêm danh mục</h1>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                style={{ maxWidth: 500 }}
                validateTrigger={['onChange', 'onBlur']}
            >
                <Form.Item
                    name="name"
                    label="Tên danh mục"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên danh mục' },
                        { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' },
                        { max: 200, message: 'Tên danh mục không được vượt quá 200 ký tự' },
                        {
                            pattern: /^[\p{L}0-9\s,-]+$/u,
                            message: 'Tên danh mục chỉ được chứa chữ cái, số, dấu phẩy và dấu gạch ngang'
                        }
                    ]}
                >
                    <Input placeholder="Nhập tên danh mục" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[
                        { max: 3000, message: 'Mô tả không được vượt quá 3000 ký tự' }
                    ]}
                >
                    <Input.TextArea
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về danh mục"
                    />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    initialValue="active"
                >
                    <Select>
                        <Option value="active">Hoạt động</Option>
                        <Option value="inactive">Không hoạt động</Option>
                        <Option value="archived">Đã lưu trữ</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Thêm danh mục
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate('/admin/categories')}
                    >
                        Hủy
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddCategory; 