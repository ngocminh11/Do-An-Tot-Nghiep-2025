import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Typography,
    Space,
    Popconfirm,
    Radio,
    Row,
    Col,
    AutoComplete,
    Spin
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    StarOutlined,
    StarFilled,
    UserOutlined,
    PhoneOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    SearchOutlined,
    AimOutlined
} from '@ant-design/icons';
import './AddressManagement.scss';
import accountService from '../../../services/accountService';
import { useAuth } from '../../../contexts/AuthContext';
import vietnamAddressData from './vietnamAddressData'; // File dữ liệu địa chỉ

const { Title, Text } = Typography;
const { Option } = Select;

const AddressManagement = () => {
    const { user, refreshUser } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [form] = Form.useForm();
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const [autoCompleteResults, setAutoCompleteResults] = useState([]);
    const autoCompleteService = useRef(null);

    // Khởi tạo Google Places Autocomplete
    useEffect(() => {
        if (window.google && window.google.maps) {
            autoCompleteService.current = new window.google.maps.places.AutocompleteService();
        }
    }, []);

    // Load địa chỉ từ backend khi user thay đổi
    useEffect(() => {
        if (user && user._id) {
            setAddresses(user.addresses || []);
        }
    }, [user]);

    const showModal = (address = null) => {
        setEditingAddress(address);
        if (address) {
            form.setFieldsValue(address);
            // Load districts và wards tương ứng
            const city = address.city;
            if (city && vietnamAddressData[city]) {
                setDistricts(Object.keys(vietnamAddressData[city]));
                const district = address.district;
                if (district && vietnamAddressData[city][district]) {
                    setWards(vietnamAddressData[city][district]);
                }
            }
        } else {
            // Tự động điền họ tên, sdt từ user khi thêm mới
            form.setFieldsValue({
                fullName: user?.fullName || '',
                phoneNumber: user?.phone || ''
            });
            setDistricts([]);
            setWards([]);
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingAddress(null);
        setDistricts([]);
        setWards([]);
        setAutoCompleteResults([]);
    };

    const handleSubmit = async (values) => {
        try {
            let newAddresses;
            if (editingAddress) {
                // Update existing address
                newAddresses = addresses.map(addr =>
                    addr.id === editingAddress.id ? { ...values, id: addr.id } : addr
                );
            } else {
                // Add new address
                const newAddress = {
                    ...values,
                    id: Date.now().toString(),
                    isDefault: addresses.length === 0
                };
                newAddresses = [...addresses, newAddress];
            }
            await accountService.updateUser(user._id, { addresses: newAddresses });
            message.success(editingAddress ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ mới thành công!');
            if (refreshUser) await refreshUser();
            handleCancel();
        } catch (e) {
            message.error('Có lỗi khi cập nhật địa chỉ!');
        }
    };

    const handleDelete = async (addressId) => {
        try {
            let newAddresses = addresses.filter(addr => addr.id !== addressId);
            // Nếu xóa địa chỉ mặc định, gán địa chỉ đầu tiên còn lại làm mặc định
            if (newAddresses.length > 0 && !newAddresses.some(addr => addr.isDefault)) {
                newAddresses[0].isDefault = true;
            }
            await accountService.updateUser(user._id, { addresses: newAddresses });
            message.success('Xóa địa chỉ thành công!');
            if (refreshUser) await refreshUser();
        } catch (e) {
            message.error('Có lỗi khi xóa địa chỉ!');
        }
    };

    const setDefaultAddress = async (addressId) => {
        try {
            const newAddresses = addresses.map(addr => ({ ...addr, isDefault: addr.id === addressId }));
            await accountService.updateUser(user._id, { addresses: newAddresses });
            message.success('Đã cập nhật địa chỉ mặc định!');
            if (refreshUser) await refreshUser();
        } catch (e) {
            message.error('Có lỗi khi cập nhật địa chỉ mặc định!');
        }
    };

    // Xử lý khi chọn tỉnh/thành phố
    const handleCityChange = (value) => {
        form.setFieldsValue({ district: undefined, ward: undefined });
        setWards([]);

        if (value && vietnamAddressData[value]) {
            setDistricts(Object.keys(vietnamAddressData[value]));
        } else {
            setDistricts([]);
        }
    };

    // Xử lý khi chọn quận/huyện
    const handleDistrictChange = (value) => {
        form.setFieldsValue({ ward: undefined });
        const city = form.getFieldValue('city');

        if (city && value && vietnamAddressData[city]?.[value]) {
            setWards(vietnamAddressData[city][value]);
        } else {
            setWards([]);
        }
    };

    // Tìm kiếm địa chỉ tự động
    const handleAddressSearch = (value) => {
        if (!value || value.length < 3) {
            setAutoCompleteResults([]);
            return;
        }

        if (autoCompleteService.current) {
            autoCompleteService.current.getPlacePredictions(
                {
                    input: value,
                    componentRestrictions: { country: 'vn' }
                },
                (predictions, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setAutoCompleteResults(
                            predictions.map(prediction => ({
                                value: prediction.description,
                                label: (
                                    <div>
                                        <EnvironmentOutlined style={{ marginRight: 8 }} />
                                        {prediction.description}
                                    </div>
                                )
                            }))
                        );
                    } else {
                        setAutoCompleteResults([]);
                    }
                }
            );
        }
    };

    // Xử lý khi chọn địa chỉ tự động
    const handleAddressSelect = (value) => {
        // Phân tích địa chỉ (đơn giản hóa)
        const addressParts = value.split(', ');
        if (addressParts.length >= 4) {
            const newValues = {
                address: addressParts[0],
                ward: addressParts[1],
                district: addressParts[2],
                city: addressParts[3]
            };

            form.setFieldsValue(newValues);

            // Cập nhật districts và wards
            if (vietnamAddressData[newValues.city]) {
                setDistricts(Object.keys(vietnamAddressData[newValues.city]));
                if (vietnamAddressData[newValues.city][newValues.district]) {
                    setWards(vietnamAddressData[newValues.city][newValues.district]);
                }
            }
        }
    };

    // Sử dụng vị trí hiện tại
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            message.error('Trình duyệt của bạn không hỗ trợ định vị');
            return;
        }

        setMapLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // Sử dụng Geocoding API để lấy địa chỉ
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            const addressComponents = results[0].address_components;
                            let city = '';
                            let district = '';
                            let ward = '';
                            let street = '';

                            addressComponents.forEach(component => {
                                const types = component.types;
                                if (types.includes('administrative_area_level_1')) {
                                    city = component.long_name;
                                } else if (types.includes('administrative_area_level_2')) {
                                    district = component.long_name;
                                } else if (types.includes('sublocality_level_1') || types.includes('ward')) {
                                    ward = component.long_name;
                                } else if (types.includes('route')) {
                                    street = component.long_name;
                                } else if (types.includes('street_number') && !street) {
                                    street = component.long_name;
                                }
                            });

                            form.setFieldsValue({
                                address: street,
                                ward: ward,
                                district: district,
                                city: city
                            });

                            // Cập nhật districts và wards
                            if (city && vietnamAddressData[city]) {
                                setDistricts(Object.keys(vietnamAddressData[city]));
                                if (district && vietnamAddressData[city][district]) {
                                    setWards(vietnamAddressData[city][district]);
                                }
                            }
                        } else {
                            message.error('Không thể lấy địa chỉ từ vị trí hiện tại');
                        }
                        setMapLoading(false);
                    });
                } catch (error) {
                    message.error('Có lỗi khi lấy vị trí');
                    setMapLoading(false);
                }
            },
            (error) => {
                message.error('Không thể lấy vị trí: ' + error.message);
                setMapLoading(false);
            }
        );
    };

    // Mở bản đồ để chọn địa chỉ
    const openMapPicker = () => {
        setMapModalVisible(true);
    };

    return (
        <div className="address-management">
            <div className="header">
                <Title level={2}>Địa chỉ giao hàng</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                >
                    Thêm địa chỉ mới
                </Button>
            </div>

            <div className="address-list">
                {addresses.map(address => (
                    <Card
                        key={address.id}
                        className={`address-card ${address.isDefault ? 'default' : ''}`}
                    >
                        <div className="address-header">
                            <Space>
                                {address.isDefault ? (
                                    <StarFilled className="default-icon" />
                                ) : (
                                    <StarOutlined
                                        className="set-default-icon"
                                        onClick={() => setDefaultAddress(address.id)}
                                    />
                                )}
                                <Text strong>{address.fullName}</Text>
                                {address.isDefault && <Text type="secondary">(Mặc định)</Text>}
                            </Space>
                            <Space>
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => showModal(address)}
                                />
                                <Popconfirm
                                    title="Bạn có chắc muốn xóa địa chỉ này?"
                                    onConfirm={() => handleDelete(address.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                    />
                                </Popconfirm>
                            </Space>
                        </div>
                        <div className="address-content">
                            <Text>{address.phoneNumber}</Text>
                            <Text>{`${address.address}, ${address.ward}, ${address.district}, ${address.city}`}</Text>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={700}
                bodyStyle={{ padding: 24 }}
            >
                <div style={{ marginBottom: 12, color: '#888' }}>
                    Vui lòng nhập đầy đủ thông tin để đảm bảo giao hàng chính xác.
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={editingAddress}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[{
                                    required: true,
                                    message: 'Vui lòng nhập số điện thoại!'
                                }, {
                                    pattern: /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
                                    message: 'Số điện thoại không hợp lệ!'
                                }]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Tìm kiếm địa chỉ"
                        help="Nhập địa chỉ để tự động điền thông tin"
                    >
                        <AutoComplete
                            options={autoCompleteResults}
                            onSelect={handleAddressSelect}
                            onSearch={handleAddressSearch}
                            placeholder="Nhập địa chỉ để tự động điền"
                        >
                            <Input
                                prefix={<SearchOutlined />}
                                suffix={
                                    <Button
                                        type="text"
                                        icon={<AimOutlined />}
                                        onClick={getCurrentLocation}
                                        loading={mapLoading}
                                    />
                                }
                            />
                        </AutoComplete>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
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
                                        <Option key={city} value={city}>{city}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
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
                                        <Option key={district} value={district}>{district}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
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
                                        <Option key={ward} value={ward}>{ward}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="address"
                                label="Địa chỉ chi tiết"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' }]}
                            >
                                <Input prefix={<HomeOutlined />} placeholder="Số nhà, tên đường..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    {!editingAddress && addresses.length > 0 && (
                        <Form.Item
                            name="isDefault"
                            valuePropName="checked"
                        >
                            <Radio>Đặt làm địa chỉ mặc định</Radio>
                        </Form.Item>
                    )}

                    <Form.Item style={{ textAlign: 'center', marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" size="large" style={{ minWidth: 160 }}>
                            {editingAddress ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                        <Button onClick={handleCancel} style={{ marginLeft: 16 }}>
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chọn địa chỉ trên bản đồ */}
            <Modal
                title="Chọn địa chỉ trên bản đồ"
                open={mapModalVisible}
                onCancel={() => setMapModalVisible(false)}
                width={800}
                footer={null}
            >
                <div style={{ height: '500px', position: 'relative' }}>
                    <Spin tip="Đang tải bản đồ..." spinning={mapLoading}>
                        <div id="map-container" style={{ height: '100%', width: '100%' }} />
                    </Spin>
                    <div style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: 'white',
                        padding: 10,
                        borderRadius: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        <Input.Search
                            placeholder="Tìm kiếm địa chỉ..."
                            enterButton={<SearchOutlined />}
                            onSearch={value => console.log('Search:', value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AddressManagement;