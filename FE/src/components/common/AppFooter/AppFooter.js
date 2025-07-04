import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { FacebookOutlined, InstagramOutlined, TwitterOutlined } from '@ant-design/icons';
import './AppFooter.scss';

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const AppFooter = () => {
    return (
        <Footer className="app-footer">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8} className="footer-col footer-logo-col">
                    <Title level={4} className="footer-logo">CoCoo</Title>
                    <Text>© 2025 CoCoo. Bản quyền thuộc về CoCoo</Text>
                </Col>
                <Col xs={24} md={8} className="footer-col footer-contact-col">
                    <Title level={5}>Thông tin liên hệ</Title>
                    <Space direction="vertical" align="center">
                        <Text>Hỗ trợ khách hàng</Text>
                        <Link href="#">Chính sách đổi trả</Link>
                    </Space>
                </Col>
                <Col xs={24} md={8} className="footer-col footer-support-col">
                    <Title level={5}>Kết nối với chúng tôi</Title>
                    <Space direction="vertical" align="center">
                        <Link href="#">Liên hệ</Link>
                        <Link href="#">Chính sách đổi trả</Link>
                    </Space>
                    <Space size="middle" className="social-icons">
                        <Link href="#"><FacebookOutlined /></Link>
                        <Link href="#"><InstagramOutlined /></Link>
                        <Link href="#"><TwitterOutlined /></Link>
                    </Space>
                </Col>
            </Row>
        </Footer>
    );
};

export default AppFooter; 