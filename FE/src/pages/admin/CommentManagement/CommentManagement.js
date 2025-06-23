import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Space, Input, Modal, Form } from 'antd';
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import commentService from '../../../services/commentService';

const CommentManagement = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [replyModal, setReplyModal] = useState(false);
    const [replyingComment, setReplyingComment] = useState(null);
    const [replyForm] = Form.useForm();

    const fetchComments = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await commentService.getAllComments({ page, limit: pageSize });
            setComments(response.data);
            setPagination({
                current: response.currentPage,
                pageSize: response.perPage,
                total: response.totalItems
            });
        } catch (error) {
            setComments([]);
            setPagination({ current: 1, pageSize: 10, total: 0 });
            message.error('Không thể tải danh sách bình luận');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments(pagination.current, pagination.pageSize);
        // eslint-disable-next-line
    }, []);

    const handleTableChange = (pag) => {
        fetchComments(pag.current, pag.pageSize);
    };

    const handleDelete = async (id) => {
        try {
            await commentService.deleteComment(id);
            message.success('Xóa bình luận thành công!');
            fetchComments(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Không thể xóa bình luận!');
        }
    };

    const openReplyModal = (comment) => {
        setReplyingComment(comment);
        setReplyModal(true);
        replyForm.resetFields();
    };

    const handleReply = async () => {
        try {
            const values = await replyForm.validateFields();
            await commentService.replyToComment(replyingComment._id, { reply: values.reply });
            message.success('Đã trả lời bình luận!');
            setReplyModal(false);
            fetchComments(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Trả lời bình luận thất bại!');
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => user?.fullName || user?.email || 'Ẩn danh'
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A'
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<MessageOutlined />} onClick={() => openReplyModal(record)}>
                        Trả lời
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xoá bình luận này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xoá"
                        cancelText="Huỷ"
                    >
                        <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="comment-management">
            <h1>Quản lý bình luận</h1>
            <Table
                columns={columns}
                dataSource={comments}
                rowKey="_id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} bình luận`
                }}
                onChange={handleTableChange}
            />
            <Modal
                title="Trả lời bình luận"
                open={replyModal}
                onOk={handleReply}
                onCancel={() => setReplyModal(false)}
                okText="Trả lời"
                cancelText="Hủy"
            >
                <Form form={replyForm} layout="vertical">
                    <Form.Item name="reply" label="Nội dung trả lời" rules={[{ required: true, message: 'Nhập nội dung trả lời' }]}> <Input.TextArea rows={3} /> </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CommentManagement; 