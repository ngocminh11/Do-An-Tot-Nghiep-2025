import React, { useState } from 'react';
import { Form, Input, Button, Select, Upload, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;

// Dữ liệu mẫu
const mockPost = {
    title: 'Cách chăm sóc da mụn hiệu quả',
    slug: 'cach-cham-soc-da-mun',
    excerpt: 'Hướng dẫn chi tiết cách chăm sóc da mụn tại nhà...',
    content: '<p>Nội dung chi tiết về cách chăm sóc da mụn...</p>',
    status: 'published',
    category: 'skincare',
    tags: ['skincare', 'acne'],
    thumbnail: 'https://via.placeholder.com/300x200'
};

const EditPost = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [content, setContent] = useState(mockPost.content);
    const [thumbnail, setThumbnail] = useState(mockPost.thumbnail);

    // Thiết lập giá trị mặc định cho form
    React.useEffect(() => {
        form.setFieldsValue({
            title: mockPost.title,
            slug: mockPost.slug,
            excerpt: mockPost.excerpt,
            status: mockPost.status,
            category: mockPost.category,
            tags: mockPost.tags
        });
    }, [form]);

    const handleFinish = (values) => {
        console.log('Form values:', values);
        console.log('Content:', content);
        console.log('Thumbnail:', thumbnail);
        message.success('Cập nhật bài viết thành công!');
        navigate('/admin/posts');
    };

    const handleImageUpload = (info) => {
        if (info.file.status === 'done') {
            message.success('Tải ảnh lên thành công!');
            setThumbnail(URL.createObjectURL(info.file.originFileObj));
        } else if (info.file.status === 'error') {
            message.error('Tải ảnh lên thất bại!');
        }
    };

    return (
        <div className="edit-post">
            <Card title="Chỉnh sửa bài viết" style={{ marginBottom: 20 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={mockPost}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề bài viết" />
                    </Form.Item>

                    <Form.Item
                        name="slug"
                        label="Slug"
                        rules={[{ required: true, message: 'Vui lòng nhập slug!' }]}
                    >
                        <Input placeholder="Nhập slug bài viết" />
                    </Form.Item>

                    <Form.Item
                        name="excerpt"
                        label="Tóm tắt"
                        rules={[{ required: true, message: 'Vui lòng nhập tóm tắt!' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Nhập tóm tắt bài viết" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Nội dung"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                        <ReactQuill
                            value={content}
                            onChange={setContent}
                            style={{ height: '300px', marginBottom: '50px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            <Option value="skincare">Chăm sóc da</Option>
                            <Option value="makeup">Trang điểm</Option>
                            <Option value="reviews">Đánh giá sản phẩm</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Tags"
                        rules={[{ required: true, message: 'Vui lòng chọn tags!' }]}
                    >
                        <Select mode="tags" placeholder="Nhập tags">
                            <Option value="skincare">Skincare</Option>
                            <Option value="makeup">Makeup</Option>
                            <Option value="acne">Acne</Option>
                            <Option value="tutorial">Tutorial</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Option value="published">Đã xuất bản</Option>
                            <Option value="draft">Bản nháp</Option>
                            <Option value="archived">Đã lưu trữ</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ảnh đại diện"
                        name="thumbnail"
                    >
                        <Upload
                            name="thumbnail"
                            listType="picture"
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={handleImageUpload}
                        >
                            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                        </Upload>
                        {thumbnail && (
                            <div style={{ marginTop: 10 }}>
                                <img
                                    src={thumbnail}
                                    alt="Thumbnail"
                                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                                />
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Cập nhật bài viết
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => navigate('/admin/posts')}
                        >
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditPost; 