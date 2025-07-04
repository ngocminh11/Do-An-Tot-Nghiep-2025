import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Button, Typography, message, Select, Divider } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import debounce from 'lodash/debounce'; // Cần cài: npm install lodash
import AddressForm from './AddressForm';
import vietnamAddressData from '../../pages/user/AddressManagement/vietnamAddressData';

const { Title, Text } = Typography;

export function LoginModal({ open, onClose }) {
    const { loginStep1, loginStep2 } = useAuth();
    const [form] = Form.useForm();
    const [step, setStep] = useState(1);
    const [otpToken, setOtpToken] = useState('');
    const [loading, setLoading] = useState(false);
    // THÊM STATE ĐỂ LƯU EMAIL Ở BƯỚC 1
    const [loginEmail, setLoginEmail] = useState('');

    React.useEffect(() => {
        if (!open) {
            setStep(1);
            setOtpToken('');
            setLoginEmail(''); // RESET EMAIL
            // Chỉ reset form khi form đã được mount
            setTimeout(() => {
                if (form && form.resetFields) {
                    form.resetFields();
                }
            }, 0);
        }
    }, [open]);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            if (step === 1) {
                const { otpToken } = await loginStep1(values.email, values.password);
                setOtpToken(otpToken);
                setLoginEmail(values.email); // LƯU EMAIL ĐỂ HIỂN THỊ Ở BƯỚC 2
                setStep(2);
                if (form && form.resetFields) {
                    form.resetFields(['otp']); // CHỈ RESET OTP, GIỮ NGUYÊN EMAIL
                }
                message.success('Đã gửi OTP đến email!');
            } else if (step === 2) {
                const otpValue = form.getFieldValue('otp');
                await loginStep2(otpToken, otpValue);
                setStep(1);
                setOtpToken('');
                setLoginEmail(''); // RESET EMAIL
                if (form && form.resetFields) {
                    form.resetFields();
                }
                onClose && onClose();
            }
        } catch (err) {
            // Error is already handled in AuthContext
            console.error('Login error:', err);
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setStep(1);
        setOtpToken('');
        if (form && form.resetFields) {
            form.resetFields();
        }
        onClose && onClose();
        setLoading(false);
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
            width={400}
            centered
        >
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
                Đăng nhập
            </Title>
            <Form form={form} onFinish={handleFinish} layout="vertical" autoComplete="off">
                {step === 1 && (
                    <>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input autoFocus placeholder="Nhập email của bạn" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>
                        <Button
                            htmlType="submit"
                            type="primary"
                            block
                            loading={loading}
                            style={{ marginTop: 16 }}
                            disabled={loading}
                        >
                            Gửi OTP
                        </Button>
                    </>
                )}
                {step === 2 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Text>Mã OTP đã được gửi đến email: <strong>{loginEmail}</strong></Text>
                        </div>
                        <Form.Item
                            name="otp"
                            label="Mã OTP"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã OTP!' },
                                { pattern: /^\d{6}$/, message: 'Mã OTP phải gồm 6 chữ số!' }
                            ]}
                        >
                            <Input
                                autoFocus
                                placeholder="Nhập mã OTP 6 số"
                                maxLength={6}
                            />
                        </Form.Item>
                        <Button
                            htmlType="submit"
                            type="primary"
                            block
                            loading={loading}
                            style={{ marginTop: 16 }}
                            disabled={loading}
                        >
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
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Khi chọn tỉnh/thành phố
    const handleCityChange = (value) => {
        form.setFieldsValue({ district: undefined, ward: undefined });
        setWards([]);
        if (value && vietnamAddressData[value]) {
            setDistricts(Object.keys(vietnamAddressData[value]));
        } else {
            setDistricts([]);
        }
    };

    // Khi chọn quận/huyện
    const handleDistrictChange = (value) => {
        form.setFieldsValue({ ward: undefined });
        const city = form.getFieldValue('city');
        if (city && value && vietnamAddressData[city]?.[value]) {
            setWards(vietnamAddressData[city][value]);
        } else {
            setWards([]);
        }
    };

    // Lưu thông tin đăng ký tạm thời vào localStorage
    useEffect(() => {
        if (step === 1) {
            const handler = () => {
                const values = form.getFieldsValue();
                localStorage.setItem('registerDraft', JSON.stringify(values));
            };

            // Debounced save to avoid too many localStorage writes
            const debouncedHandler = debounce(handler, 500);

            // Listen to form changes
            const interval = setInterval(() => {
                const values = form.getFieldsValue();
                if (Object.keys(values).length > 0) {
                    debouncedHandler();
                }
            }, 1000);

            return () => {
                clearInterval(interval);
                debouncedHandler.cancel();
            };
        }
    }, [form, step]);

    // Khi mở modal, tự động điền lại nếu có dữ liệu tạm
    useEffect(() => {
        if (open && step === 1) {
            const draft = localStorage.getItem('registerDraft');
            if (draft) {
                try {
                    const parsedDraft = JSON.parse(draft);
                    form.setFieldsValue(parsedDraft);

                    // Restore districts and wards if city/district were selected
                    if (parsedDraft.city) {
                        handleCityChange(parsedDraft.city);
                        if (parsedDraft.district) {
                            handleDistrictChange(parsedDraft.district);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to restore draft:', e);
                }
            }
        }
    }, [open, step, form]);

    // Xóa dữ liệu tạm khi đăng ký thành công hoặc hủy/quay lại bước 1
    const clearRegisterDraft = () => {
        localStorage.removeItem('registerDraft');
    };

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            if (step === 1) {
                // Validate required fields
                const requiredFields = ['fullName', 'email', 'password', 'gender', 'skinType', 'phone', 'address', 'city', 'district', 'ward'];
                const missingFields = requiredFields.filter(field => !values[field]);

                if (missingFields.length > 0) {
                    message.error('Vui lòng điền đầy đủ thông tin!');
                    return;
                }

                // Lấy đúng các trường cần thiết
                const fullName = values.fullName;
                const email = values.email;
                const password = values.password;
                const gender = values.gender;
                const skinType = values.skinType;
                const phone = values.phone;

                // Gộp địa chỉ thành 1 string
                const address = [values.address, values.ward, values.district, values.city].filter(Boolean).join(', ');

                const registerValues = { fullName, email, password, phone, skinType, address, gender };
                const { otpToken } = await sendRegisterOTP(email);
                setOtpToken(otpToken);
                setRegisterData(registerValues);
                setStep(2);
                message.success('Đã gửi OTP đến email!');
            } else if (step === 2) {
                const { verifiedOtpToken, user } = await verifyRegisterOTP(otpToken, values.otp);
                setVerifiedOtpToken(verifiedOtpToken);
                setRegisterData(prev => ({ ...prev, verifiedOtpToken, user }));
                setStep(3);
                message.success('Xác thực OTP thành công!');
            } else if (step === 3) {
                let otpTokenToUse = verifiedOtpToken || registerData.verifiedOtpToken;
                if (!otpTokenToUse) {
                    message.error('Không có token xác thực OTP. Vui lòng thử lại!');
                    setLoading(false);
                    return;
                }

                await register(registerData, otpTokenToUse);
                setStep(1);
                setOtpToken('');
                setVerifiedOtpToken('');
                setRegisterData({});
                form.resetFields();
                clearRegisterDraft();
                onClose && onClose();
            }
        } catch (error) {
            // Error is already handled in AuthContext
            console.error('Register error:', error);
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setStep(1);
        setOtpToken('');
        setVerifiedOtpToken('');
        setRegisterData({});
        setDistricts([]);
        setWards([]);
        form.resetFields();
        clearRegisterDraft();
        onClose && onClose();
        setLoading(false);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            if (step === 2) {
                setOtpToken('');
            } else if (step === 3) {
                setVerifiedOtpToken('');
            }
        }
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
            width={500}
            centered
        >
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
                Đăng ký tài khoản
            </Title>
            <Form form={form} onFinish={handleFinish} layout="vertical">
                {step === 1 && (
                    <>
                        <Form.Item
                            name="fullName"
                            label="Họ tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                            <Input autoFocus placeholder="Nhập họ tên đầy đủ" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input placeholder="Nhập email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }
                            ]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>

                        <Form.Item
                            name="gender"
                            label="Giới tính"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        >
                            <Select placeholder="Chọn giới tính">
                                <Select.Option value="Nam">Nam</Select.Option>
                                <Select.Option value="Nữ">Nữ</Select.Option>
                                <Select.Option value="Khác">Khác</Select.Option>
                                <Select.Option value="Không muốn tiết lộ">Không muốn tiết lộ</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="skinType"
                            label="Loại da"
                            rules={[{ required: true, message: 'Vui lòng chọn loại da!' }]}
                        >
                            <Select placeholder="Chọn loại da">
                                <Select.Option value="Da dầu">Da dầu</Select.Option>
                                <Select.Option value="Da khô">Da khô</Select.Option>
                                <Select.Option value="Da hỗn hợp">Da hỗn hợp</Select.Option>
                                <Select.Option value="Da thường">Da thường</Select.Option>
                                <Select.Option value="Da nhạy cảm">Da nhạy cảm</Select.Option>
                                <Select.Option value="Không rõ">Không rõ</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                { pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ!' }
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="Địa chỉ chi tiết"
                            rules={[
                                { required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' },
                                { min: 5, max: 300, message: 'Địa chỉ phải từ 5-300 ký tự!' }
                            ]}
                        >
                            <Input placeholder="Số nhà, tên đường..." />
                        </Form.Item>

                        <Form.Item
                            name="city"
                            label="Tỉnh/Thành phố"
                            rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn Tỉnh/Thành phố"
                                onChange={handleCityChange}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {Object.keys(vietnamAddressData).map(city => (
                                    <Select.Option key={city} value={city}>{city}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="district"
                            label="Quận/Huyện"
                            rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn Quận/Huyện"
                                onChange={handleDistrictChange}
                                disabled={!districts.length}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {districts.map(district => (
                                    <Select.Option key={district} value={district}>{district}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="ward"
                            label="Phường/Xã"
                            rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn Phường/Xã"
                                disabled={!wards.length}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {wards.map(ward => (
                                    <Select.Option key={ward} value={ward}>{ward}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Text>Mã OTP đã được gửi đến email: <strong>{loginEmail}</strong></Text>
                        </div>
                        <Form.Item
                            name="otp"
                            label="Mã OTP"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã OTP!' },
                                { pattern: /^\d{6}$/, message: 'Mã OTP phải gồm 6 chữ số!' }
                            ]}
                        >
                            <Input
                                autoFocus
                                placeholder="Nhập mã OTP 6 số"
                                maxLength={6}
                            />
                        </Form.Item>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Text>Xác nhận thông tin đăng ký</Text>
                            <Divider />
                            <div style={{ textAlign: 'left' }}>
                                <p><strong>Họ tên:</strong> {registerData.fullName}</p>
                                <p><strong>Email:</strong> {registerData.email}</p>
                                <p><strong>Số điện thoại:</strong> {registerData.phone}</p>
                                <p><strong>Địa chỉ:</strong> {registerData.address}</p>
                            </div>
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {step > 1 && (
                        <Button
                            onClick={handleBack}
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            Quay lại
                        </Button>
                    )}
                    <Button
                        htmlType="submit"
                        type="primary"
                        loading={loading}
                        style={{ flex: 1 }}
                        disabled={loading}
                    >
                        {step === 1 ? 'Gửi OTP' : step === 2 ? 'Xác thực OTP' : 'Hoàn tất đăng ký'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export function ForgotPasswordModal({ open, onClose }) {
    const { forgotPassword, resetPassword } = useAuth();
    const [form] = Form.useForm();
    const [step, setStep] = useState(1);
    const [otpToken, setOtpToken] = useState('');
    const [verifiedOtpToken, setVerifiedOtpToken] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (!open) {
            setStep(1);
            setOtpToken('');
            setVerifiedOtpToken('');
            setEmail('');
            form.resetFields();
        }
    }, [open, form]);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            if (step === 1) {
                const { otpToken } = await forgotPassword(values.email);
                setOtpToken(otpToken);
                setEmail(values.email);
                setStep(2);
                form.resetFields();
                message.success('Đã gửi OTP đến email!');
            } else if (step === 2) {
                const { otpToken: verifiedToken } = await userAPI.verifyOTP(otpToken, values.otp);
                setVerifiedOtpToken(verifiedToken);
                setStep(3);
                message.success('Xác thực OTP thành công!');
            } else if (step === 3) {
                await resetPassword(values.newPassword, verifiedOtpToken);
                setStep(1);
                setOtpToken('');
                setVerifiedOtpToken('');
                setEmail('');
                form.resetFields();
                onClose && onClose();
            }
        } catch (error) {
            // Error is already handled in AuthContext
            console.error('Forgot password error:', error);
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setStep(1);
        setOtpToken('');
        setVerifiedOtpToken('');
        setEmail('');
        form.resetFields();
        onClose && onClose();
        setLoading(false);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            if (step === 2) {
                setOtpToken('');
            } else if (step === 3) {
                setVerifiedOtpToken('');
            }
        }
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
            width={400}
            centered
        >
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
                Quên mật khẩu
            </Title>
            <Form form={form} onFinish={handleFinish} layout="vertical">
                {step === 1 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Text>Nhập email để nhận mã OTP đặt lại mật khẩu</Text>
                        </div>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input autoFocus placeholder="Nhập email của bạn" />
                        </Form.Item>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Text>Mã OTP đã được gửi đến email: <strong>{email}</strong></Text>
                        </div>
                        <Form.Item
                            name="otp"
                            label="Mã OTP"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã OTP!' },
                                { pattern: /^\d{6}$/, message: 'Mã OTP phải gồm 6 chữ số!' }
                            ]}
                        >
                            <Input
                                autoFocus
                                placeholder="Nhập mã OTP 6 số"
                                maxLength={6}
                            />
                        </Form.Item>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Text>Nhập mật khẩu mới</Text>
                        </div>
                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }
                            ]}
                        >
                            <Input.Password
                                autoFocus
                                placeholder="Nhập mật khẩu mới"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Nhập lại mật khẩu mới" />
                        </Form.Item>
                    </>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {step > 1 && (
                        <Button
                            onClick={handleBack}
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            Quay lại
                        </Button>
                    )}
                    <Button
                        htmlType="submit"
                        type="primary"
                        loading={loading}
                        style={{ flex: 1 }}
                        disabled={loading}
                    >
                        {step === 1 ? 'Gửi OTP' : step === 2 ? 'Xác thực OTP' : 'Đặt lại mật khẩu'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}