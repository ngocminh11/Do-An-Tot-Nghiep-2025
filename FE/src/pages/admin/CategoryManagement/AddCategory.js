import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Select, Spin, Collapse } from 'antd';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../../services/categoryService';

const { Option } = Select;
const { Panel } = Collapse;

const AddCategory = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAllCategories();
                setCategories(response);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                message.error('Không thể tải danh sách danh mục');
            }
        };
        fetchCategories();
    }, []);

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            const categoryData = {
                name: values.name.trim(),
                description: values.description.trim(),
                parentCategory: values.parentCategory || null,
                status: values.status || 'active',
                position: values.position || 0,
                seo: {
                    metaTitle: values.metaTitle?.trim() || '',
                    metaKeywords: values.metaKeywords?.trim() || '',
                    metaDescription: values.metaDescription?.trim() || ''
                }
            };

            const response = await categoryService.createCategory(categoryData);

            if (response) {
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
            console.error('Failed to add category:', error);
            const errorMessage = error.message || 'Thêm danh mục thất bại!';
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
                    name="parentCategory"
                    label="Danh mục cha"
                >
                    <Select
                        placeholder="Chọn danh mục cha (không bắt buộc)"
                        allowClear
                    >
                        {categories.map(category => (
                            <Option key={category._id} value={category._id}>
                                {category.name}
                            </Option>
                        ))}
                    </Select>
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

                <Form.Item
                    name="position"
                    label="Vị trí"
                    initialValue={0}
                >
                    <Input type="number" min={0} />
                </Form.Item>

                <Collapse>
                    <Panel header="Thông tin SEO" key="1">
                        <Form.Item
                            name="metaTitle"
                            label="Meta Title"
                        >
                            <Input placeholder="Nhập meta title" />
                        </Form.Item>

                        <Form.Item
                            name="metaKeywords"
                            label="Meta Keywords"
                        >
                            <Input placeholder="Nhập meta keywords" />
                        </Form.Item>

                        <Form.Item
                            name="metaDescription"
                            label="Meta Description"
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder="Nhập meta description"
                            />
                        </Form.Item>
                    </Panel>
                </Collapse>

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