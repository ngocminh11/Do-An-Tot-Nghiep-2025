import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Select, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import categoryService from '../../../services/categoryService';

const { Option } = Select;

const EditCategory = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Log để debug
        console.log('EditCategory mounted with params:', { id });

        // Kiểm tra id trước khi fetch data
        if (!id) {
            console.error('id is undefined or null');
            message.error('Không tìm thấy ID danh mục!');
            navigate('/admin/categories');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                console.log('Fetching category with id:', id);
                const category = await categoryService.getCategoryById(id);
                console.log('Fetched category data:', category);

                if (category) {
                    form.setFieldsValue({
                        name: category.name,
                        description: category.description,
                        status: category.status
                    });
                } else {
                    console.error('Category not found for id:', id);
                    message.error('Không tìm thấy danh mục!');
                    navigate('/admin/categories');
                }
            } catch (error) {
                console.error('Failed to fetch category data:', error);
                message.error('Không thể tải thông tin danh mục.');
                navigate('/admin/categories');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, form, navigate]);

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            const categoryData = {
                name: values.name.trim(),
                description: values.description.trim(),
                status: values.status
            };

            console.log('Updating category with data:', { id, categoryData });

            const response = await categoryService.updateCategory(id, categoryData);

            if (response) {
                message.success({
                    content: 'Cập nhật danh mục thành công!',
                    duration: 2,
                    onClose: () => {
                        navigate('/admin/categories', {
                            state: {
                                message: 'Cập nhật danh mục thành công!',
                                type: 'success'
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Failed to update category:', error);
            const errorMessage = error.message || 'Cập nhật danh mục thất bại!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="category-management">
            <h1>Sửa danh mục</h1>
            {loading ? (
                <Spin size="large" />
            ) : (
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
                            { max: 50, message: 'Tên danh mục không được vượt quá 50 ký tự' }
                        ]}
                    >
                        <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mô tả' },
                            { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
                            { max: 500, message: 'Mô tả không được vượt quá 500 ký tự' }
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
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select>
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Không hoạt động</Option>
                            <Option value="archived">Đã lưu trữ</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Lưu thay đổi
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => navigate('/admin/categories')}
                        >
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </div>
    );
};

export default EditCategory; 