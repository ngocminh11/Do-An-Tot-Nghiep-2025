import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Upload, message, Radio } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const mockCategories = ['Chăm sóc da', 'Dưỡng da', 'Chống nắng', 'Trang điểm'];
const mockSkinProblems = ['Mụn', 'Da khô', 'Lão hoá', 'Thâm nám', 'Nhạy cảm'];
const mockPosts = [
    {
        _id: '1',
        title: 'Cách trị mụn hiệu quả',
        content: 'Nội dung bài viết về trị mụn...',
        mediaUrl: 'https://via.placeholder.com/100',
        mediaType: 'image',
        tag: 'Chăm sóc da',
        skinProblem: 'Mụn',
        likes: 5,
    },
    {
        _id: '2',
        title: 'Video hướng dẫn dưỡng da',
        content: 'Video hướng dẫn...',
        mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        mediaType: 'video',
        tag: 'Dưỡng da',
        skinProblem: 'Da khô',
        likes: 2,
    },
    {
        _id: '3',
        title: 'Bí quyết chống nắng mùa hè',
        content: 'Chia sẻ về chống nắng...',
        mediaUrl: 'https://via.placeholder.com/100',
        mediaType: 'image',
        tag: 'Chống nắng',
        skinProblem: 'Nhạy cảm',
        likes: 7,
    },
    {
        _id: '4',
        title: 'Trang điểm tự nhiên cho da dầu',
        content: 'Hướng dẫn trang điểm...',
        mediaUrl: 'https://www.w3schools.com/html/movie.mp4',
        mediaType: 'video',
        tag: 'Trang điểm',
        skinProblem: 'Da dầu',
        likes: 3,
    },
];

const EditPost = () => {
    const [form] = Form.useForm();
    const [mediaType, setMediaType] = useState('image');
    const [fileList, setFileList] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const post = mockPosts.find(p => p._id === id);
        if (post) {
            form.setFieldsValue({
                title: post.title,
                content: post.content,
                tag: post.tag,
                skinProblem: post.skinProblem,
            });
            setMediaType(post.mediaType);
            setFileList(post.mediaUrl ? [{ uid: '-1', name: 'media', url: post.mediaUrl }] : []);
        }
    }, [id, form]);

    const handleFinish = (values) => {
        message.success('Đã cập nhật bài viết (mock)');
        console.log({ ...values, mediaType, fileList });
        navigate('/admin/posts');
    };

    return (
        <div className="edit-post-page" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2>Chỉnh sửa bài viết</h2>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}> <Input /> </Form.Item>
                <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung' }]}> <TextArea rows={5} /> </Form.Item>
                <Form.Item name="tag" label="Tag (Danh mục)" rules={[{ required: true, message: 'Chọn tag' }]}> <Select>{mockCategories.map(tag => <Option key={tag} value={tag}>{tag}</Option>)}</Select> </Form.Item>
                <Form.Item name="skinProblem" label="Vấn đề da" rules={[{ required: true, message: 'Chọn vấn đề da' }]}> <Select>{mockSkinProblems.map(sp => <Option key={sp} value={sp}>{sp}</Option>)}</Select> </Form.Item>
                <Form.Item label="Loại media" required>
                    <Radio.Group value={mediaType} onChange={e => setMediaType(e.target.value)}>
                        <Radio value="image">Hình ảnh</Radio>
                        <Radio value="video">Video</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item label={mediaType === 'image' ? 'Hình ảnh' : 'Video'} required>
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
                    <Button type="primary" htmlType="submit">Cập nhật bài viết</Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditPost; 