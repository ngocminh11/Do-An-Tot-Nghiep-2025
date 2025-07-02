import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Select, Row, Col, Button, AutoComplete, Typography, Checkbox, Spin } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, EnvironmentOutlined, SearchOutlined, AimOutlined } from '@ant-design/icons';
import vietnamAddressData from '../../pages/user/AddressManagement/vietnamAddressData';

const { Option } = Select;
const { Text } = Typography;

const AddressForm = ({
    form,
    initialValues = {},
    onFinish,
    editingAddress = null,
    addresses = [],
    showIsDefault = false,
    onCancel,
    submitText = 'Lưu',
}) => {
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [autoCompleteResults, setAutoCompleteResults] = useState([]);
    const [mapLoading, setMapLoading] = useState(false);
    const autoCompleteService = useRef(null);

    useEffect(() => {
        if (window.google && window.google.maps) {
            autoCompleteService.current = new window.google.maps.places.AutocompleteService();
        }
    }, []);

    useEffect(() => {
        if (initialValues && initialValues.city && vietnamAddressData[initialValues.city]) {
            setDistricts(Object.keys(vietnamAddressData[initialValues.city]));
            if (initialValues.district && vietnamAddressData[initialValues.city][initialValues.district]) {
                setWards(vietnamAddressData[initialValues.city][initialValues.district]);
            }
        }
    }, [initialValues]);

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
        const addressParts = value.split(', ');
        if (addressParts.length >= 4) {
            const newValues = {
                address: addressParts[0],
                ward: addressParts[1],
                district: addressParts[2],
                city: addressParts[3]
            };
            form.setFieldsValue(newValues);
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
            return;
        }
        setMapLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
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
                            if (city && vietnamAddressData[city]) {
                                setDistricts(Object.keys(vietnamAddressData[city]));
                                if (district && vietnamAddressData[city][district]) {
                                    setWards(vietnamAddressData[city][district]);
                                }
                            }
                        }
                        setMapLoading(false);
                    });
                } catch (error) {
                    setMapLoading(false);
                }
            },
            () => setMapLoading(false)
        );
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={initialValues}
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
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }, { pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ!' }]}
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
                                icon={<AimOutlined />} onClick={getCurrentLocation} loading={mapLoading}
                            />
                        }
                    />
                </AutoComplete>
            </Form.Item>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="address"
                        label="Địa chỉ chi tiết"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' }, { min: 5, max: 300, message: 'Địa chỉ phải từ 5-300 ký tự!' }]}
                    >
                        <Input prefix={<HomeOutlined />} placeholder="Số nhà, tên đường..." />
                    </Form.Item>
                </Col>
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
            </Row>
            <Row gutter={16}>
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
            </Row>
            {showIsDefault && !editingAddress && addresses.length > 0 && (
                <Form.Item
                    name="isDefault"
                    valuePropName="checked"
                >
                    <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                </Form.Item>
            )}
            <Form.Item style={{ textAlign: 'center', marginTop: 24 }}>
                <Button type="primary" htmlType="submit" size="large" style={{ minWidth: 160 }}>
                    {submitText}
                </Button>
                {onCancel && <Button onClick={onCancel} style={{ marginLeft: 16 }}>Hủy</Button>}
            </Form.Item>
        </Form>
    );
};

export default AddressForm; 