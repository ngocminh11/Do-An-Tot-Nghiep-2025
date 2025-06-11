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
                <Col xs={24} md={8}>
                    <Title level={4} className="footer-logo">CoCoo</Title>
                    <Text>© 2025 CoCoo. Bản quyền thuộc về CoCoo</Text>
                </Col>
                <Col xs={24} md={8}>
                    <Title level={5}>Thông tin liên hệ</Title>
                    <Space direction="vertical">
                        <Text>Hỗ trợ khách hàng</Text>
                        <Link href="#">Chính sách đổi trả</Link>
                    </Space>
                </Col>
                <Col xs={24} md={8}>
                    <Title level={5}>Hỗ trợ khách hàng</Title>
                    <Space direction="vertical">
                        <Link href="#">Thông tin liên hệ</Link>
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