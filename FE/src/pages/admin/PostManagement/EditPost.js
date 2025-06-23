import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Upload, message, Card, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import postService from '../../../services/postService';
import categoryService from '../../../services/categoryService';
import tagService from '../../../services/tagService';

const { Option } = Select;

const EditPost = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [catRes, tagRes, postRes] = await Promise.all([
                    categoryService.getAllCategories(),
                    tagService.getAllTags(),
                    postService.getPostById(id)
                ]);
                setCategories(catRes.data || []);
                setTags(tagRes.data || []);
                if (postRes) {
                    form.setFieldsValue({
                        title: postRes.title,
                        slug: postRes.slug,
                        excerpt: postRes.excerpt,
                        status: postRes.status,
                        category: postRes.category,
                        tags: postRes.tags,
                        content: postRes.content
                    });
                    setContent(postRes.content || '');
                    setThumbnail(typeof postRes.thumbnail === 'string' ? postRes.thumbnail : '');
                    if (postRes.thumbnail) {
                        setFileList([
                            {
                                uid: '-1',
                                name: 'thumbnail',
                                status: 'done',
                                url: typeof postRes.thumbnail === 'string' ? postRes.thumbnail : ''
                            }
                        ]);
                    }
                }
            } catch (error) {
                message.error('Không thể tải dữ liệu bài viết, danh mục hoặc tag!');
                navigate('/admin/posts');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line
    }, [id]);

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            const postData = {
                title: values.title,
                content: content,
                excerpt: values.excerpt || '',
                category: values.category,
                tags: values.tags,
                status: values.status || 'draft',
            };
            // Nếu có file media, upload kèm
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const formData = new FormData();
                formData.append('media', fileList[0].originFileObj);
                Object.keys(postData).forEach(key => {
                    formData.append(key, Array.isArray(postData[key]) ? JSON.stringify(postData[key]) : postData[key]);
                });
                await postService.updatePost(id, formData);
            } else {
                await postService.updatePost(id, postData);
            }
            message.success('Cập nhật bài viết thành công!');
            navigate('/admin/posts');
        } catch (error) {
            message.error(error?.message || 'Cập nhật bài viết thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = ({ fileList }) => {
        // Đảm bảo url là string hoặc undefined
        const normalized = fileList.map(file => {
            if (file.originFileObj) {
                // File mới upload
                return file;
            }
            return {
                ...file,
                url: typeof file.url === 'string' ? file.url : '',
            };
        });
        setFileList(normalized);
        if (normalized.length > 0 && normalized[0].originFileObj) {
            setThumbnail(URL.createObjectURL(normalized[0].originFileObj));
        } else if (normalized.length > 0 && typeof normalized[0].url === 'string') {
            setThumbnail(normalized[0].url);
        } else {
            setThumbnail('');
        }
    };

    if (loading) return <Spin size="large" />;

    return (
        <div className="edit-post">
            <Card title="Chỉnh sửa bài viết" style={{ marginBottom: 20 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
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
                            {categories.map(cat => (
                                <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Tags"
                        rules={[{ required: true, message: 'Vui lòng chọn tags!' }]}
                    >
                        <Select mode="multiple" placeholder="Nhập tags">
                            {tags.map(tag => (
                                <Option key={tag._id} value={tag._id}>{tag.name}</Option>
                            ))}
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
                            fileList={fileList}
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
                        <Button type="primary" htmlType="submit" loading={loading}>
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