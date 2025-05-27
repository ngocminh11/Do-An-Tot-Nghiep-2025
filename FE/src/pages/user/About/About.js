import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { TeamOutlined, TrophyOutlined, HeartOutlined, SafetyOutlined } from '@ant-design/icons';
import './About.scss';

const { Title, Paragraph } = Typography;

const About = () => {
    return (
        <div className="about-page">
            <Card>
                <div className="about-header">
                    <Title level={1}>Về Chúng Tôi</Title>
                    <Paragraph className="subtitle">
                        Chúng tôi cam kết mang đến những sản phẩm chất lượng và dịch vụ tốt nhất cho khách hàng
                    </Paragraph>
                </div>

                <Row gutter={[32, 32]} className="features">
                    <Col xs={24} sm={12} md={6}>
                        <div className="feature-item">
                            <TeamOutlined className="icon" />
                            <Title level={4}>Đội ngũ chuyên nghiệp</Title>
                            <Paragraph>
                                Đội ngũ nhân viên giàu kinh nghiệm, tận tâm phục vụ khách hàng
                            </Paragraph>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div className="feature-item">
                            <TrophyOutlined className="icon" />
                            <Title level={4}>Chất lượng hàng đầu</Title>
                            <Paragraph>
                                Sản phẩm được kiểm định nghiêm ngặt, đảm bảo chất lượng
                            </Paragraph>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div className="feature-item">
                            <HeartOutlined className="icon" />
                            <Title level={4}>Tận tâm phục vụ</Title>
                            <Paragraph>
                                Luôn lắng nghe và đáp ứng nhu cầu của khách hàng
                            </Paragraph>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div className="feature-item">
                            <SafetyOutlined className="icon" />
                            <Title level={4}>An toàn tuyệt đối</Title>
                            <Paragraph>
                                Đảm bảo an toàn trong mọi giao dịch và vận chuyển
                            </Paragraph>
                        </div>
                    </Col>
                </Row>

                <div className="about-content">
                    <section>
                        <Title level={2}>Câu chuyện của chúng tôi</Title>
                        <Paragraph>
                            Được thành lập vào năm 2020, chúng tôi đã không ngừng phát triển và hoàn thiện để mang đến những sản phẩm chất lượng nhất cho khách hàng. Với sứ mệnh cung cấp các giải pháp làm đẹp an toàn và hiệu quả, chúng tôi cam kết luôn đặt lợi ích của khách hàng lên hàng đầu.
                        </Paragraph>
                    </section>

                    <section>
                        <Title level={2}>Tầm nhìn</Title>
                        <Paragraph>
                            Chúng tôi mong muốn trở thành đơn vị tiên phong trong lĩnh vực làm đẹp, mang đến những sản phẩm chất lượng cao với giá cả phải chăng cho mọi người.
                        </Paragraph>
                    </section>

                    <section>
                        <Title level={2}>Giá trị cốt lõi</Title>
                        <ul>
                            <li>Chất lượng: Cam kết mang đến sản phẩm tốt nhất</li>
                            <li>Đổi mới: Không ngừng cải tiến và phát triển</li>
                            <li>Trách nhiệm: Đặt lợi ích khách hàng lên hàng đầu</li>
                            <li>Chính trực: Hoạt động minh bạch, đáng tin cậy</li>
                        </ul>
                    </section>
                </div>
            </Card>
        </div>
    );
};

export default About; 