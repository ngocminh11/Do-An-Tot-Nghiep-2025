import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Button, Typography, message, Select } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import debounce from 'lodash/debounce'; // Cần cài: npm install lodash

const { Title } = Typography;

export function LoginModal({ open, onClose }) {
    const { loginStep1, loginStep2 } = useAuth();
    const [form] = Form.useForm();
    const [step, setStep] = useState(1);
    const [otpToken, setOtpToken] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (!open) {
            setStep(1);
            setOtpToken('');
            form.resetFields();
        }
    }, [open]);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            if (step === 1) {
                const { otpToken } = await loginStep1(values.email, values.password);
                setOtpToken(otpToken);
                setStep(2);
                form.resetFields();
                message.success('Đã gửi OTP đến email!');
            } else if (step === 2) {
                const otpValue = form.getFieldValue('otp');
                await loginStep2(otpToken, otpValue);
                setStep(1);
                setOtpToken('');
                form.resetFields();
                onClose && onClose();
            }
        } catch (err) {
            // AntD sẽ tự hiển thị lỗi validate, chỉ catch lỗi API
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setStep(1);
        setOtpToken('');
        form.resetFields();
        onClose && onClose();
    };

    return (
        <Modal open={open} onCancel={handleCancel} footer={null} destroyOnClose>
            <Title level={3} style={{ textAlign: 'center' }}>Đăng nhập</Title>
            <Form form={form} onFinish={handleFinish} layout="vertical" autoComplete="off">
                {step === 1 && (
                    <>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Nhập email!' }]}>
                            <Input autoFocus placeholder="Email" />
                        </Form.Item>
                        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
                            <Input.Password placeholder="Mật khẩu" />
                        </Form.Item>
                        <Button htmlType="submit" type="primary" block loading={loading} style={{ marginTop: 8 }}>
                            Gửi OTP
                        </Button>
                    </>
                )}
                {step === 2 && (
                    <>
                        <Form.Item name="otp" label="Mã OTP" rules={[{ required: true, message: 'Nhập mã OTP!' }]}>
                            <Input autoFocus placeholder="Mã OTP" />
                        </Form.Item>
                        <Button htmlType="submit" type="primary" block loading={loading} style={{ marginTop: 8 }}>
                            Đăng nhập
                        </Button>
                    </>
                )}
            </Form>
        </Modal>
    );
}

export function RegisterModal({ open, onClose }) {
    const { sendRegisterOTP, verifyRegisterOTP, register } = useAuth();
    const [form] = Form.useForm();
    const [step, setStep] = useState(1);
    const [otpToken, setOtpToken] = useState('');
    const [verifiedOtpToken, setVerifiedOtpToken] = useState('');
    const [registerData, setRegisterData] = useState({});
    const [loading, setLoading] = useState(false);

    // State cho chức năng tìm kiếm địa chỉ
    const [addressQuery, setAddressQuery] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Reset khi đóng modal
    useEffect(() => {
        if (!open) {
            setAddressQuery('');
            setAddressSuggestions([]);
            setShowSuggestions(false);
        }
    }, [open]);

    // Hàm tìm kiếm địa chỉ với debounce
    const searchAddress = useCallback(debounce(async (query) => {
        if (!query || query.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&addressdetails=1`
            );
            const data = await response.json();
            setAddressSuggestions(data);
        } catch (error) {
            console.error('Lỗi tìm kiếm địa chỉ:', error);
            setAddressSuggestions([]);
        }
    }, 300), []);

    // Xử lý khi chọn một địa chỉ từ gợi ý
    const handleAddressSelect = (suggestion) => {
        const address = suggestion.address;

        // Tạo chuỗi địa chỉ đường phố
        const houseNumber = address.house_number || '';
        const road = address.road || '';
        const street = (houseNumber + ' ' + road).trim();

        // Điền dữ liệu vào form
        form.setFieldsValue({
            street: street,
            ward: address.suburb || address.neighbourhood || address.village || '',
            district: address.city_district || address.county || '',
            city: address.city || address.state || ''
        });

        setShowSuggestions(false);
        setAddressQuery('');
    };

    // Xử lý khi người dùng nhập địa chỉ
    const handleAddressChange = (e) => {
        const value = e.target.value;
        setAddressQuery(value);
        setShowSuggestions(true);

        if (value.length >= 3) {
            searchAddress(value);
        } else {
            setAddressSuggestions([]);
        }
    };

    // Xử lý khi click ra ngoài để ẩn gợi ý
    useEffect(() => {
        const handleClickOutside = () => {
            setShowSuggestions(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            if (step === 1) {
                const { otpToken } = await sendRegisterOTP(values.email);
                setOtpToken(otpToken);
                setRegisterData(values);
                setStep(2);
                message.success('Đã gửi OTP đến email!');
            } else if (step === 2) {
                const { verifiedOtpToken } = await verifyRegisterOTP(otpToken, values.otp);
                setVerifiedOtpToken(verifiedOtpToken);
                setStep(3);
                message.success('Xác thực OTP thành công!');
            } else if (step === 3) {
                await register(registerData, verifiedOtpToken);
                setStep(1);
                setOtpToken('');
                setVerifiedOtpToken('');
                setRegisterData({});
                form.resetFields();
                onClose && onClose();
            }
        } catch { }
        setLoading(false);
    };

    const handleCancel = () => {
        setStep(1);
        setOtpToken('');
        setVerifiedOtpToken('');
        setRegisterData({});
        setAddressQuery('');
        setAddressSuggestions([]);
        setShowSuggestions(false);
        form.resetFields();
        onClose && onClose();
    };

    return (
        <Modal open={open} onCancel={handleCancel} footer={null} destroyOnClose>
            <Title level={3} style={{ textAlign: 'center' }}>Đăng ký</Title>
            <Form form={form} onFinish={handleFinish} layout="vertical">
                {step === 1 && (
                    <>
                        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                            <Input autoFocus placeholder="Họ tên" />
                        </Form.Item>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Nhập email!' }]}>
                            <Input placeholder="Email" />
                        </Form.Item>
                        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}>
                            <Input.Password placeholder="Mật khẩu" />
                        </Form.Item>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại!' }]}>
                            <Input placeholder="Số điện thoại" />
                        </Form.Item>
                        <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Chọn giới tính!' }]}>
                            <Select placeholder="Chọn giới tính">
                                <Select.Option value="Nam">Nam</Select.Option>
                                <Select.Option value="Nữ">Nữ</Select.Option>
                                <Select.Option value="Khác">Khác</Select.Option>
                                <Select.Option value="Không muốn tiết lộ">Không muốn tiết lộ</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="skinType" label="Loại da" rules={[{ required: true, message: 'Chọn loại da!' }]}>
                            <Select placeholder="Chọn loại da">
                                <Select.Option value="Da dầu">Da dầu</Select.Option>
                                <Select.Option value="Da khô">Da khô</Select.Option>
                                <Select.Option value="Da hỗn hợp">Da hỗn hợp</Select.Option>
                                <Select.Option value="Da thường">Da thường</Select.Option>
                                <Select.Option value="Da nhạy cảm">Da nhạy cảm</Select.Option>
                                <Select.Option value="Không rõ">Không rõ</Select.Option>
                            </Select>
                        </Form.Item>

                        {/* ===== PHẦN TÌM KIẾM ĐỊA CHỈ MỚI ===== */}
                        <Form.Item label="Tìm kiếm địa chỉ">
                            <div style={{ position: 'relative' }}>
                                <Input
                                    value={addressQuery}
                                    onChange={handleAddressChange}
                                    placeholder="Nhập địa chỉ để tìm kiếm (số nhà, đường, phường, quận)..."
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSuggestions(true);
                                    }}
                                />
                                {showSuggestions && addressSuggestions.length > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            width: '100%',
                                            zIndex: 1000,
                                            background: 'white',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '4px',
                                            maxHeight: '250px',
                                            overflowY: 'auto',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                        }}
                                    >
                                        {addressSuggestions.map(suggestion => (
                                            <div
                                                key={suggestion.place_id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddressSelect(suggestion);
                                                }}
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    ':hover': { backgroundColor: '#f5f5f5' }
                                                }}
                                            >
                                                {suggestion.display_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Form.Item>

                        {/* Các trường địa chỉ sẽ được điền tự động */}
                        <Form.Item name="city" label="Tỉnh/Thành phố" rules={[{ required: true, message: 'Chọn tỉnh/thành phố!' }]}>
                            <Select placeholder="Chọn tỉnh/thành phố">
                                <Select.Option value="TP.HCM">TP.HCM</Select.Option>
                                <Select.Option value="Hà Nội">Hà Nội</Select.Option>
                                <Select.Option value="Đà Nẵng">Đà Nẵng</Select.Option>
                                <Select.Option value="Cần Thơ">Cần Thơ</Select.Option>
                                <Select.Option value="Hải Phòng">Hải Phòng</Select.Option>
                                <Select.Option value="Khác">Khác</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Nhập quận/huyện!' }]}>
                            <Input placeholder="Ví dụ: Quận 1" />
                        </Form.Item>
                        <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Nhập phường/xã!' }]}>
                            <Input placeholder="Ví dụ: Phường Bến Nghé" />
                        </Form.Item>
                        <Form.Item name="street" label="Số nhà, tên đường" rules={[{ required: true, message: 'Nhập số nhà, tên đường!' }]}>
                            <Input placeholder="Ví dụ: 123 Lê Lợi" />
                        </Form.Item>
                    </>
                )}
                {step === 2 && (
                    <Form.Item name="otp" label="Mã OTP" rules={[{ required: true, message: 'Nhập mã OTP!' }]}>
                        <Input autoFocus placeholder="Mã OTP" />
                    </Form.Item>
                )}
                {step === 3 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>Xác nhận đăng ký</div>
                        <Button htmlType="submit" type="primary" block loading={loading} style={{ marginTop: 8 }}>
                            Hoàn tất đăng ký
                        </Button>
                    </>
                )}
                {step !== 3 && (
                    <Button htmlType="submit" type="primary" block loading={loading} style={{ marginTop: 8 }}>
                        {step === 1 ? 'Gửi OTP' : 'Xác thực OTP'}
                    </Button>
                )}
            </Form>
        </Modal>
    );
}