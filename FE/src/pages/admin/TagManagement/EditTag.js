import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import tagService from '../../../services/tagService';
import './TagManagement.scss';

const EditTag = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchTag = async () => {
            try {
                setInitialLoading(true);
                const response = await tagService.getTagById(id);
                form.setFieldsValue(response.data);
            } catch (error) {
                message.error(error.message || 'Không thể tải thông tin tag');
                navigate('/admin/tags');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchTag();
    }, [id, form, navigate]);

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            await tagService.updateTag(id, values);
            message.success('Cập nhật tag thành công!');
            navigate('/admin/tags');
        } catch (error) {
            message.error(error.message || 'Có lỗi xảy ra khi cập nhật tag');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tag-management">
            <Card 
                title="Sửa tag" 
                className="tag-card"
                loading={initialLoading}
            >
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
                            Lưu thay đổi
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

export default EditTag; 