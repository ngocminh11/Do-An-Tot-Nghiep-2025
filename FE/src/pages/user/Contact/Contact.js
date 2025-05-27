import React from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, message } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import './Contact.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Contact = () => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        console.log('Form values:', values);
        message.success('Your message has been sent successfully!');
        form.resetFields();
    };

    return (
        <div className="contact-page">
            <Title level={2}>Contact Us</Title>
            <Row gutter={24}>
                <Col xs={24} md={12}>
                    <Card className="contact-form">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                        >
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[{ required: true, message: 'Please enter your name' }]}
                            >
                                <Input placeholder="Your name" />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input placeholder="Your email" />
                            </Form.Item>
                            <Form.Item
                                name="subject"
                                label="Subject"
                                rules={[{ required: true, message: 'Please enter a subject' }]}
                            >
                                <Input placeholder="Subject of your message" />
                            </Form.Item>
                            <Form.Item
                                name="message"
                                label="Message"
                                rules={[{ required: true, message: 'Please enter your message' }]}
                            >
                                <TextArea
                                    placeholder="Your message"
                                    rows={6}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    Send Message
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card className="contact-info">
                        <Title level={3}>Get in Touch</Title>
                        <div className="info-item">
                            <MailOutlined />
                            <div>
                                <Text strong>Email</Text>
                                <Text>support@example.com</Text>
                            </div>
                        </div>
                        <div className="info-item">
                            <PhoneOutlined />
                            <div>
                                <Text strong>Phone</Text>
                                <Text>+1 (555) 123-4567</Text>
                            </div>
                        </div>
                        <div className="info-item">
                            <EnvironmentOutlined />
                            <div>
                                <Text strong>Address</Text>
                                <Text>123 Main Street</Text>
                                <Text>New York, NY 10001</Text>
                            </div>
                        </div>
                        <div className="business-hours">
                            <Title level={4}>Business Hours</Title>
                            <div className="hours-item">
                                <Text>Monday - Friday:</Text>
                                <Text>9:00 AM - 6:00 PM</Text>
                            </div>
                            <div className="hours-item">
                                <Text>Saturday:</Text>
                                <Text>10:00 AM - 4:00 PM</Text>
                            </div>
                            <div className="hours-item">
                                <Text>Sunday:</Text>
                                <Text>Closed</Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Contact; 