import React, { useState } from 'react';
import { Form, Input, Button, Steps, Card, Row, Col, Typography, Divider, message } from 'antd';
import { ShoppingCartOutlined, UserOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { mockCarts, mockUserDetails } from '../../../services/mockData';
import './Checkout.scss';

const { Title, Text } = Typography;
const { Step } = Steps;

const Checkout = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();

    const cart = mockCarts[0]; // Using first cart as example
    const userDetails = mockUserDetails[0]; // Using first user details as example

    const handleNext = () => {
        form.validateFields()
            .then(() => {
                setCurrentStep(currentStep + 1);
            })
            .catch(error => {
                console.error('Validation failed:', error);
            });
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                console.log('Form values:', values);
                message.success('Order placed successfully!');
                setCurrentStep(3);
            })
            .catch(error => {
                console.error('Validation failed:', error);
            });
    };

    const steps = [
        {
            title: 'Cart Review',
            icon: <ShoppingCartOutlined />,
            content: (
                <div className="cart-review">
                    {cart.items.map(item => (
                        <div key={item._id} className="cart-item">
                            <img src={item.product.imageUrls[0]} alt={item.product.name} />
                            <div className="item-details">
                                <Text strong>{item.product.name}</Text>
                                <Text>Quantity: {item.quantity}</Text>
                                <Text>Price: ${item.product.price}</Text>
                            </div>
                        </div>
                    ))}
                    <Divider />
                    <div className="cart-summary">
                        <div className="summary-item">
                            <Text>Subtotal:</Text>
                            <Text>${cart.subtotal}</Text>
                        </div>
                        <div className="summary-item">
                            <Text>Shipping:</Text>
                            <Text>${cart.shippingCost}</Text>
                        </div>
                        <div className="summary-item total">
                            <Text strong>Total:</Text>
                            <Text strong>${cart.total}</Text>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Shipping Information',
            icon: <UserOutlined />,
            content: (
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        fullName: userDetails.fullName,
                        phoneNumber: userDetails.phoneNumber,
                        address: userDetails.addresses[0].street,
                        city: userDetails.addresses[0].city,
                        state: userDetails.addresses[0].state,
                        zipCode: userDetails.addresses[0].zipCode,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Full Name"
                                rules={[{ required: true, message: 'Please enter your full name' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Phone Number"
                                rules={[{ required: true, message: 'Please enter your phone number' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please enter your address' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="city"
                                label="City"
                                rules={[{ required: true, message: 'Please enter your city' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="state"
                                label="State"
                                rules={[{ required: true, message: 'Please enter your state' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="zipCode"
                                label="ZIP Code"
                                rules={[{ required: true, message: 'Please enter your ZIP code' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            ),
        },
        {
            title: 'Payment',
            icon: <CreditCardOutlined />,
            content: (
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="cardNumber"
                        label="Card Number"
                        rules={[{ required: true, message: 'Please enter your card number' }]}
                    >
                        <Input placeholder="1234 5678 9012 3456" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="expiryDate"
                                label="Expiry Date"
                                rules={[{ required: true, message: 'Please enter expiry date' }]}
                            >
                                <Input placeholder="MM/YY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="cvv"
                                label="CVV"
                                rules={[{ required: true, message: 'Please enter CVV' }]}
                            >
                                <Input placeholder="123" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            ),
        },
        {
            title: 'Confirmation',
            icon: <CheckCircleOutlined />,
            content: (
                <div className="confirmation">
                    <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                    <Title level={3}>Order Placed Successfully!</Title>
                    <Text>Thank you for your purchase. Your order has been placed successfully.</Text>
                </div>
            ),
        },
    ];

    return (
        <div className="checkout-page">
            <Title level={2}>Checkout</Title>
            <Steps current={currentStep} className="checkout-steps">
                {steps.map(item => (
                    <Step key={item.title} title={item.title} icon={item.icon} />
                ))}
            </Steps>
            <Card className="steps-content">
                {steps[currentStep].content}
            </Card>
            <div className="steps-action">
                {currentStep > 0 && (
                    <Button style={{ margin: '0 8px' }} onClick={handlePrev}>
                        Previous
                    </Button>
                )}
                {currentStep < steps.length - 1 && (
                    <Button type="primary" onClick={handleNext}>
                        Next
                    </Button>
                )}
                {currentStep === steps.length - 2 && (
                    <Button type="primary" onClick={handleSubmit}>
                        Place Order
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Checkout; 