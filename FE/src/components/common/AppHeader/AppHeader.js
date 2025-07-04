import React, { useState } from 'react';
import { Layout, Menu, Input, Avatar, Dropdown, Space, Badge, message, Button, Tooltip } from 'antd';
import {
    HomeOutlined,
    ShoppingCartOutlined,
    BellOutlined,
    ReadOutlined,
    PhoneOutlined,
    SearchOutlined,
    UserOutlined,
    LogoutOutlined,
    ContainerOutlined, // For Orders
    GiftOutlined,      // For Reward Points
    SkinOutlined,      // Changed from SkincareOutlined
    EnvironmentOutlined, // Added for Addresses
    SettingOutlined,
    HeartOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Link
} from 'react-router-dom';
import './AppHeader.scss';
import { useAuth } from '../../../contexts/AuthContext';
import { LoginModal, RegisterModal } from '../AuthModals';

const { Header } = Layout;
const { Search } = Input;

// Mock notifications
const mockNotifications = [
    { id: '1', message: 'Bạn có ưu đãi mới 10% cho đơn hàng tiếp theo!' },
    { id: '2', message: 'Đơn hàng #12345 đã được giao thành công.' }
];

// Mock cart items count
const mockCartItemCount = 3; // Giả lập có 3 sản phẩm trong giỏ hàng

const AppHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchVisible, setSearchVisible] = useState(false);
    const { user, logout } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // Helper: xác định có phải admin/manager không
    const isAdmin = user && user.role && user.role !== 'Khách Hàng';

    const handleSearch = (value) => {
        console.log('Tìm kiếm:', value);
        // Implement search logic here, e.g., navigate to search results page
        message.info(`Tìm kiếm: ${value}`);
    };

    const handleMenuClick = (e) => {
        // Handle navigation for main menu items
        if (e.key === 'home') {
            navigate('/');
        } else if (e.key === 'products') {
            navigate('/products');
        } else if (e.key === 'blog') {
            navigate('/blog'); // Assuming /blog route exists
        } else if (e.key === 'contact') {
            navigate('/contact'); // Assuming /contact route exists
        } else if (e.key === 'notifications') {
            // Handle notifications click, maybe open a modal or navigate to notifications page
            message.info('Hiển thị thông báo...');
        } else if (e.key === 'cart') {
            navigate('/cart');
        } else if (e.key === 'admin') {
            navigate('/admin');
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to="/profile">Hồ sơ của tôi</Link>,
            icon: <UserOutlined />,
        },
        { type: 'divider' },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            onClick: () => {
                logout();
                // Logout luôn về trang chủ, không redirect sang /login
            }
        },
    ];

    // Function to get user initials for avatar
    const getUserInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <Header className="app-header">
                <div className="header-left">
                    <Link to="/" className="logo">CoCoo</Link>
                    <Menu
                        mode="horizontal"
                        defaultSelectedKeys={[location.pathname.split('/')[1] || 'home']}
                        onClick={handleMenuClick}
                        className="main-menu"
                    >
                        <Menu.Item key="home" icon={<HomeOutlined />}>Trang chủ</Menu.Item>
                        <Menu.Item key="products" icon={<ShoppingCartOutlined />}>Sản phẩm</Menu.Item>
                        <Menu.Item key="blog" icon={<ReadOutlined />}>Blog</Menu.Item>
                        <Menu.Item key="contact" icon={<PhoneOutlined />}>Liên hệ chúng tôi</Menu.Item>
                        {isAdmin && (
                            <Menu.Item key="admin" icon={<SettingOutlined />} onClick={() => navigate('/admin')} style={{ fontWeight: 600, color: '#C7A15A' }}>
                                Quản trị
                            </Menu.Item>
                        )}
                    </Menu>
                </div>

                <div className="header-right">
                    <div className="search-container">
                        {searchVisible ? (
                            <Search
                                placeholder="Tìm kiếm sản phẩm..."
                                onSearch={handleSearch}
                                className="header-search"
                                allowClear
                                onBlur={() => setSearchVisible(false)}
                                autoFocus
                            />
                        ) : (
                            <Tooltip title="Tìm kiếm">
                                <Button
                                    type="text"
                                    icon={<SearchOutlined style={{ fontSize: '20px' }} />}
                                    onClick={() => setSearchVisible(true)}
                                    className="search-icon-button"
                                />
                            </Tooltip>
                        )}
                    </div>

                    <Tooltip title="Thông báo">
                        <Badge count={mockNotifications.length} offset={[5, 0]} className="notification-badge">
                            <Button
                                type="text"
                                icon={<BellOutlined style={{ fontSize: '20px' }} />}
                                onClick={() => handleMenuClick({ key: 'notifications' })}
                            />
                        </Badge>
                    </Tooltip>

                    <Tooltip title="Giỏ hàng">
                        <Badge count={mockCartItemCount} offset={[5, 0]} className="cart-badge">
                            <Button
                                type="text"
                                icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />}
                                onClick={() => handleMenuClick({ key: 'cart' })}
                            />
                        </Badge>
                    </Tooltip>

                    {user ? (
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                            arrow
                        >
                            <Space className="user-profile-dropdown">
                                <Avatar
                                    size={40}
                                    src={user.avatar}
                                    style={{
                                        backgroundColor: user.avatar ? 'var(--cocoon-white)' : 'var(--cocoon-brown)',
                                        border: '2px solid var(--cocoon-gold)',
                                        boxShadow: '0 2px 8px rgba(199, 161, 90, 0.15)',
                                        color: 'var(--cocoon-gold)',
                                        fontSize: 22,
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                    icon={!user.avatar ? <UserOutlined /> : undefined}
                                />
                                <div className="user-info">
                                    <span className="user-name">{user.name || user.fullName || user.email}</span>
                                </div>
                            </Space>
                        </Dropdown>
                    ) : (
                        <>
                            <Button style={{ marginRight: 8 }} onClick={() => setShowLogin(true)}>Đăng nhập</Button>
                            <Button type="primary" onClick={() => setShowRegister(true)}>Đăng ký</Button>
                        </>
                    )}
                </div>
            </Header>
            <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
            <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
        </>
    );
};

export default AppHeader; 