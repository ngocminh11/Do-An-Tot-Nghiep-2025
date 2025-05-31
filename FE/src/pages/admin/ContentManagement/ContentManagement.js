import React, { useState } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    message,
    Popconfirm,
    Tabs,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import './ContentManagement.scss';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ContentManagement = () => {
    const [activeTab, setActiveTab] = useState('1');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingContent, setEditingContent] = useState(null);
    const [form] = Form.useForm();

    // Mock data for different content types
    const [banners, setBanners] = useState([
        {
            id: 1,
            title: 'Summer Sale',
            description: 'Get up to 50% off on selected items',
            imageUrl: 'https://example.com/banner1.jpg',
            status: 'active',
        },
    ]);

    const [pages, setPages] = useState([
        {
            id: 1,
            title: 'About Us',
            content: 'Welcome to our store...',
            slug: 'about-us',
            status: 'active',
        },
    ]);

    const [faqs, setFaqs] = useState([
        {
            id: 1,
            question: 'What is your return policy?',
            answer: 'We accept returns within 30 days...',
            category: 'Shipping',
            status: 'active',
        },
    ]);

    const columns = {
        banners: [
            {
                title: 'Title',
                dataIndex: 'title',
                key: 'title',
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
            },
            {
                title: 'Image URL',
                dataIndex: 'imageUrl',
                key: 'imageUrl',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                    <span className={`status-${status}`}>{status}</span>
                ),
            },
            {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                    <Space>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record, 'banners')}
                        >
                            Edit
                        </Button>
                        <Popconfirm
                            title="Are you sure you want to delete this banner?"
                            onConfirm={() => handleDelete(record.id, 'banners')}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" danger icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
        pages: [
            {
                title: 'Title',
                dataIndex: 'title',
                key: 'title',
            },
            {
                title: 'Slug',
                dataIndex: 'slug',
                key: 'slug',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                    <span className={`status-${status}`}>{status}</span>
                ),
            },
            {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                    <Space>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record, 'pages')}
                        >
                            Edit
                        </Button>
                        <Popconfirm
                            title="Are you sure you want to delete this page?"
                            onConfirm={() => handleDelete(record.id, 'pages')}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" danger icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
        faqs: [
            {
                title: 'Question',
                dataIndex: 'question',
                key: 'question',
            },
            {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                    <span className={`status-${status}`}>{status}</span>
                ),
            },
            {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                    <Space>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record, 'faqs')}
                        >
                            Edit
                        </Button>
                        <Popconfirm
                            title="Are you sure you want to delete this FAQ?"
                            onConfirm={() => handleDelete(record.id, 'faqs')}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" danger icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
    };

    const handleAdd = (type) => {
        setEditingContent(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (content, type) => {
        setEditingContent({ ...content, type });
        form.setFieldsValue(content);
        setIsModalVisible(true);
    };

    const handleDelete = (id, type) => {
        switch (type) {
            case 'banners':
                setBanners(banners.filter((banner) => banner.id !== id));
                break;
            case 'pages':
                setPages(pages.filter((page) => page.id !== id));
                break;
            case 'faqs':
                setFaqs(faqs.filter((faq) => faq.id !== id));
                break;
            default:
                break;
        }
        message.success('Content deleted successfully');
    };

    const handleModalOk = () => {
        form.validateFields().then((values) => {
            const type = editingContent?.type || activeTab;
            const content = { ...values, type };

            switch (type) {
                case 'banners':
                    if (editingContent) {
                        setBanners(
                            banners.map((banner) =>
                                banner.id === editingContent.id ? { ...banner, ...values } : banner
                            )
                        );
                    } else {
                        setBanners([...banners, { id: banners.length + 1, ...values }]);
                    }
                    break;
                case 'pages':
                    if (editingContent) {
                        setPages(
                            pages.map((page) =>
                                page.id === editingContent.id ? { ...page, ...values } : page
                            )
                        );
                    } else {
                        setPages([...pages, { id: pages.length + 1, ...values }]);
                    }
                    break;
                case 'faqs':
                    if (editingContent) {
                        setFaqs(
                            faqs.map((faq) =>
                                faq.id === editingContent.id ? { ...faq, ...values } : faq
                            )
                        );
                    } else {
                        setFaqs([...faqs, { id: faqs.length + 1, ...values }]);
                    }
                    break;
                default:
                    break;
            }

            message.success(
                `Content ${editingContent ? 'updated' : 'added'} successfully`
            );
            setIsModalVisible(false);
        });
    };

    const renderForm = () => {
        switch (activeTab) {
            case '1':
                return (
                    <>
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: 'Please enter title' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Please enter description' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="imageUrl"
                            label="Image URL"
                            rules={[{ required: true, message: 'Please enter image URL' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select>
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </Form.Item>
                    </>
                );
            case '2':
                return (
                    <>
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: 'Please enter title' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="slug"
                            label="Slug"
                            rules={[{ required: true, message: 'Please enter slug' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="content"
                            label="Content"
                            rules={[{ required: true, message: 'Please enter content' }]}
                        >
                            <TextArea rows={6} />
                        </Form.Item>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select>
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </Form.Item>
                    </>
                );
            case '3':
                return (
                    <>
                        <Form.Item
                            name="question"
                            label="Question"
                            rules={[{ required: true, message: 'Please enter question' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="answer"
                            label="Answer"
                            rules={[{ required: true, message: 'Please enter answer' }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                        <Form.Item
                            name="category"
                            label="Category"
                            rules={[{ required: true, message: 'Please select category' }]}
                        >
                            <Select>
                                <Option value="Shipping">Shipping</Option>
                                <Option value="Returns">Returns</Option>
                                <Option value="Payment">Payment</Option>
                                <Option value="General">General</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select>
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </Form.Item>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="content-management">
            <div className="header">
                <h1>Content Management</h1>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane
                    tab="Banners"
                    key="1"
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleAdd('banners')}
                        >
                            Add Banner
                        </Button>
                    }
                >
                    <Table
                        columns={columns.banners}
                        dataSource={banners}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </TabPane>
                <TabPane
                    tab="Pages"
                    key="2"
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleAdd('pages')}
                        >
                            Add Page
                        </Button>
                    }
                >
                    <Table
                        columns={columns.pages}
                        dataSource={pages}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </TabPane>
                <TabPane
                    tab="FAQs"
                    key="3"
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleAdd('faqs')}
                        >
                            Add FAQ
                        </Button>
                    }
                >
                    <Table
                        columns={columns.faqs}
                        dataSource={faqs}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </TabPane>
            </Tabs>

            <Modal
                title={
                    editingContent
                        ? `Edit ${activeTab === '1' ? 'Banner' : activeTab === '2' ? 'Page' : 'FAQ'}`
                        : `Add ${activeTab === '1' ? 'Banner' : activeTab === '2' ? 'Page' : 'FAQ'}`
                }
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    {renderForm()}
                </Form>
            </Modal>
        </div>
    );
};

export default ContentManagement; 