import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import tagService from '../../../services/tagService';
import './TagManagement.scss';

const AddTag = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Hàm tạo urlSlug từ tên tag
    const generateUrlSlug = (name) => {
        if (!name) return '';
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
            .replace(/[^a-z0-9]/g, '-') // Thay thế ký tự đặc biệt bằng dấu gạch ngang
            .replace(/-+/g, '-') // Loại bỏ dấu gạch ngang liên tiếp
            .replace(/^-|-$/g, ''); // Loại bỏ dấu gạch ngang ở đầu và cuối
    };

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            // Tạo urlSlug từ tên tag
            const urlSlug = generateUrlSlug(values.name);

            // Thêm seo object với urlSlug
            const tagData = {
                ...values,
                seo: {
                    urlSlug,
                    keywords: values.name, // Sử dụng tên tag làm keywords mặc định
                    metaTitle: values.name, // Sử dụng tên tag làm metaTitle mặc định
                    metaDescription: values.description // Sử dụng mô tả làm metaDescription mặc định
                }
            };

            const response = await tagService.createTag(tagData);
            message.success('Thêm tag thành công!');
            navigate('/admin/tags');
        } catch (error) {
            message.error(error.message || 'Có lỗi xảy ra khi thêm tag');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tag-management">
            <Card title="Thêm tag mới" className="tag-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    requiredMark={false}
                >
                    <Form.Item
                        name="name"
                        label="Tên tag"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên tag' },
                            { min: 2, message: 'Tên tag phải có ít nhất 2 ký tự' },
                            { max: 50, message: 'Tên tag không được vượt quá 50 ký tự' },
                            {
                                pattern: /^[\p{L}0-9\s,-]+$/u,
                                message: 'Tên tag chỉ được chứa chữ cái, số, dấu phẩy và dấu gạch ngang'
                            }
                        ]}
                    >
                        <Input placeholder="Nhập tên tag" />
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
                            placeholder="Nhập mô tả chi tiết về tag"
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Thêm tag
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => navigate('/admin/tags')}
                        >
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddTag; 