import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Upload, message, Radio, Spin } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import postService from '../../../services/postService';
import categoryService from '../../../services/categoryService';
import tagService from '../../../services/tagService';
import slugify from 'slugify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const { Option } = Select;
const { TextArea } = Input;

const AddPost = () => {
    const [form] = Form.useForm();
    const [mediaType, setMediaType] = useState('image');
    const [fileList, setFileList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const [catRes, tagRes] = await Promise.all([
                    categoryService.getAllCategories(),
                    tagService.getAllTags()
                ]);
                setCategories(catRes.data || []);
                setTags(tagRes.data || []);
            } catch (error) {
                message.error('Không thể tải danh mục hoặc tag');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            // Sinh excerpt nếu thiếu
            let excerpt = values.excerpt?.trim();
            if (!excerpt) {
                excerpt = content?.substring(0, 297) + (content?.length > 300 ? '...' : '');
            }
            // Sinh slug nếu thiếu
            let slug = slugify(values.title || '', { lower: true, strict: true });
            // Chuẩn bị dữ liệu gửi lên API
            const postData = {
                title: values.title,
                slug,
                content: content,
                excerpt,
                category: values.category,
                tags: values.tags,
                status: values.status || 'draft',
            };
            // Nếu có file media, upload kèm
            if (fileList.length > 0) {
                const formData = new FormData();
                formData.append('media', fileList[0].originFileObj);
                Object.keys(postData).forEach(key => {
                    formData.append(key, Array.isArray(postData[key]) ? JSON.stringify(postData[key]) : postData[key]);
                });
                await postService.createPost(formData);
            } else {
                await postService.createPost(postData);
            }
            message.success('Đã thêm bài viết thành công!');
            navigate('/admin/posts');
        } catch (error) {
            message.error(error?.message || 'Thêm bài viết thất bại!');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) return <Spin size="large" />;

    return (
        <div className="add-post-page" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2>Thêm bài viết mới</h2>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}> <Input /> </Form.Item>
                <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung' }]}>
                    <CKEditor
                        editor={ClassicEditor}
                        data={content}
                        onChange={(event, editor) => setContent(editor.getData())}
                        config={{
                            ckfinder: { uploadUrl: '/api/upload' },
                            toolbar: [
                                'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote',
                                'insertTable', 'imageUpload', 'mediaEmbed', 'undo', 'redo', 'alignment', 'outdent', 'indent', 'codeBlock'
                            ]
                        }}
                    />
                </Form.Item>
                <Form.Item name="excerpt" label="Tóm tắt"> <TextArea rows={2} /> </Form.Item>
                <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}> <Select>{categories.map(cat => <Option key={cat._id} value={cat._id}>{cat.name}</Option>)}</Select> </Form.Item>
                <Form.Item name="tags" label="Tags" rules={[{ required: true, message: 'Chọn tags' }]}> <Select mode="multiple">{tags.map(tag => <Option key={tag._id} value={tag._id}>{tag.name}</Option>)}</Select> </Form.Item>
                <Form.Item name="status" label="Trạng thái" initialValue="draft"> <Select><Option value="published">Đã xuất bản</Option><Option value="draft">Bản nháp</Option><Option value="archived">Đã lưu trữ</Option></Select> </Form.Item>
                <Form.Item label="Loại media">
                    <Radio.Group value={mediaType} onChange={e => setMediaType(e.target.value)}>
                        <Radio value="image">Hình ảnh</Radio>
                        <Radio value="video">Video</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item label={mediaType === 'image' ? 'Hình ảnh' : 'Video'}>
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={({ fileList }) => setFileList(fileList)}
                        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                        maxCount={1}
                    >
                        {fileList.length < 1 && (
                            <div>
                                <UploadOutlined /> <div style={{ marginTop: 8 }}>Tải lên</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>Thêm bài viết</Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddPost; 