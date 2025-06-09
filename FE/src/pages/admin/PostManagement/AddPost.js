import React, { useState } from 'react';
import { Form, Input, Button, Select, Upload, message, Radio } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const mockCategories = ['Chăm sóc da', 'Dưỡng da', 'Chống nắng', 'Trang điểm'];
const mockSkinProblems = ['Mụn', 'Da khô', 'Lão hoá', 'Thâm nám', 'Nhạy cảm'];

const AddPost = () => {
    const [form] = Form.useForm();
    const [mediaType, setMediaType] = useState('image');
    const [fileList, setFileList] = useState([]);
    const navigate = useNavigate();

    const handleFinish = (values) => {
        message.success('Đã thêm bài viết (mock)');
        console.log({ ...values, mediaType, fileList });
        navigate('/admin/posts');
    };

    return (
        <div className="add-post-page" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2>Thêm bài viết mới</h2>
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
                    <Button type="primary" htmlType="submit">Thêm bài viết</Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddPost; 