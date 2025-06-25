import React, { useState, useEffect } from 'react';
import { Collapse, Typography, Card, Spin, Alert } from 'antd';
import faqService from '../../../services/faqService';
import './FAQ.scss';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const FAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                setLoading(true);
                const data = await faqService.getFAQs();
                setFaqs(data);
            } catch (err) {
                console.error('Error fetching FAQs:', err);
                setError('Không thể tải câu hỏi thường gặp');
            } finally {
                setLoading(false);
            }
        };

        fetchFAQs();
    }, []);

    if (loading) {
        return (
            <div className="faq-page">
                <Title level={2}>Câu hỏi thường gặp</Title>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="faq-page">
                <Title level={2}>Câu hỏi thường gặp</Title>
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '20px' }}
                />
            </div>
        );
    }

    return (
        <div className="faq-page">
            <Title level={2}>Câu hỏi thường gặp</Title>
            <Card className="faq-content">
                {faqs.length > 0 ? (
                    <Collapse
                        defaultActiveKey={['1']}
                        expandIconPosition="end"
                        className="faq-collapse"
                    >
                        {faqs.map((faq, index) => (
                            <Panel
                                key={index + 1}
                                header={
                                    <Text strong>
                                        {faq.question}
                                    </Text>
                                }
                            >
                                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </Panel>
                        ))}
                    </Collapse>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        Chưa có câu hỏi nào
                    </div>
                )}
            </Card>
            <Card className="faq-contact">
                <Title level={3}>Vẫn còn thắc mắc?</Title>
                <Text>
                    Nếu bạn không tìm thấy câu trả lời mong muốn, đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi.
                    Chúng tôi luôn sẵn sàng giúp đỡ!
                </Text>
                <div className="contact-options">
                    <div className="contact-option">
                        <Title level={4}>Email Hỗ trợ</Title>
                        <Text>support@cocoo.com</Text>
                    </div>
                    <div className="contact-option">
                        <Title level={4}>Điện thoại</Title>
                        <Text>+84 123 456 789</Text>
                    </div>
                    <div className="contact-option">
                        <Title level={4}>Chat trực tuyến</Title>
                        <Text>Có sẵn 24/7</Text>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default FAQ; 