import React from 'react';
import { Collapse, Typography, Card } from 'antd';
import { mockFAQs } from '../../../services/mockData';
import './FAQ.scss';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const FAQ = () => {
    return (
        <div className="faq-page">
            <Title level={2}>Frequently Asked Questions</Title>
            <Card className="faq-content">
                <Collapse
                    defaultActiveKey={['1']}
                    expandIconPosition="end"
                    className="faq-collapse"
                >
                    {mockFAQs.map((faq, index) => (
                        <Panel
                            key={index + 1}
                            header={
                                <Text strong>
                                    {faq.question}
                                </Text>
                            }
                        >
                            <Text>{faq.answer}</Text>
                        </Panel>
                    ))}
                </Collapse>
            </Card>
            <Card className="faq-contact">
                <Title level={3}>Still Have Questions?</Title>
                <Text>
                    If you couldn't find the answer you're looking for, please don't hesitate to contact our support team.
                    We're here to help!
                </Text>
                <div className="contact-options">
                    <div className="contact-option">
                        <Title level={4}>Email Support</Title>
                        <Text>support@example.com</Text>
                    </div>
                    <div className="contact-option">
                        <Title level={4}>Phone Support</Title>
                        <Text>+1 (555) 123-4567</Text>
                    </div>
                    <div className="contact-option">
                        <Title level={4}>Live Chat</Title>
                        <Text>Available 24/7</Text>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default FAQ; 