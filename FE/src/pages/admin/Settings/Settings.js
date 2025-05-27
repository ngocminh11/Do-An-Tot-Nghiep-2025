import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    message,
    Switch,
    InputNumber,
    Select,
    Upload,
} from 'antd';
import {
    SaveOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import './Settings.scss';

const { Option } = Select;
const { TextArea } = Input;

const Settings = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (values) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Settings values:', values);
            message.success('Settings saved successfully');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="settings">
            <div className="header">
                <h1>Settings</h1>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    siteName: 'My Store',
                    siteDescription: 'Your one-stop shop for all your needs',
                    contactEmail: 'contact@example.com',
                    phoneNumber: '+1234567890',
                    address: '123 Main St, City, Country',
                    currency: 'USD',
                    taxRate: 10,
                    enableRegistration: true,
                    enableGuestCheckout: true,
                    maintenanceMode: false,
                }}
            >
                <Card title="General Settings" className="settings-card">
                    <Form.Item
                        name="siteName"
                        label="Site Name"
                        rules={[{ required: true, message: 'Please enter site name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="siteDescription"
                        label="Site Description"
                        rules={[{ required: true, message: 'Please enter site description' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="logo"
                        label="Site Logo"
                    >
                        <Upload
                            listType="picture"
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                    </Form.Item>
                </Card>

                <Card title="Contact Information" className="settings-card">
                    <Form.Item
                        name="contactEmail"
                        label="Contact Email"
                        rules={[
                            { required: true, message: 'Please enter contact email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <TextArea rows={3} />
                    </Form.Item>
                </Card>

                <Card title="Store Settings" className="settings-card">
                    <Form.Item
                        name="currency"
                        label="Currency"
                        rules={[{ required: true, message: 'Please select currency' }]}
                    >
                        <Select>
                            <Option value="USD">USD ($)</Option>
                            <Option value="EUR">EUR (€)</Option>
                            <Option value="GBP">GBP (£)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="taxRate"
                        label="Tax Rate (%)"
                        rules={[{ required: true, message: 'Please enter tax rate' }]}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Card>

                <Card title="System Settings" className="settings-card">
                    <Form.Item
                        name="enableRegistration"
                        label="Enable User Registration"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="enableGuestCheckout"
                        label="Enable Guest Checkout"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="maintenanceMode"
                        label="Maintenance Mode"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Card>

                <div className="form-actions">
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                        size="large"
                    >
                        Save Settings
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Settings; 