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
        if (!id) {
            message.error('Không tìm thấy ID danh mục!');
            navigate('/admin/categories');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const categoryData = await categoryService.getCategoryById(id);
                if (categoryData) {
                    form.setFieldsValue({
                        name: categoryData.name,
                        description: categoryData.description,
                        status: categoryData.status
                    });
                } else {
                    message.error('Không tìm thấy danh mục!');
                    navigate('/admin/categories');
                }
            } catch (error) {
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

            const updated = await categoryService.updateCategory(id, categoryData);

            if (updated) {
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
            const errorMessage = error?.message || error?.msg || 'Cập nhật danh mục thất bại!';
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