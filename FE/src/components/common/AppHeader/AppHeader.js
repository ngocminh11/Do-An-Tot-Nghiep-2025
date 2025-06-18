import React from 'react';
import { Layout, Menu, Input, Avatar, Dropdown, Space, Badge, message, Button } from 'antd';
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
    EnvironmentOutlined // Added for Addresses
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Link
} from 'react-router-dom';
import './AppHeader.scss';

const { Header } = Layout;
const { Search } = Input;

// Mock user data
const mockUser = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    avatar: 'https://via.placeholder.com/150' // Placeholder image
};

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
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: (
                <Link to="/profile">Hồ sơ của tôi</Link>
            ),
            icon: <UserOutlined />,
        },
        {
            key: 'addresses',
            label: (
                <Link to="/addresses">Địa chỉ giao hàng</Link>
            ),
            icon: <EnvironmentOutlined />,
        },
        {
            key: 'orders',
            label: (
                <Link to="/orders">Đơn hàng của tôi</Link>
            ),
            icon: <ContainerOutlined />,
        },
        {
            key: 'rewards',
            label: (
                <Link to="/rewards">Điểm thưởng</Link>
            ),
            icon: <GiftOutlined />,
        },
        {
            key: 'my-skincare-set',
            label: (
                <Link to="/my-skincare">Bộ sản phẩm chăm da của tôi</Link>
            ),
            icon: <SkinOutlined />,
        },
        { type: 'divider' },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            onClick: () => {
                message.success('Đăng xuất thành công!');
                navigate('/login'); // Redirect to login page
            }
        },
    ];

    return (
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
                </Menu>
            </div>

            <div className="header-right">
                <Search
                    placeholder="Tìm kiếm sản phẩm..."
                    onSearch={handleSearch}
                    style={{ width: 250, marginRight: 20 }}
                    className="header-search"
                />

                <Badge count={mockNotifications.length} offset={[5, 0]} className="notification-badge">
                    <Button
                        type="text"
                        icon={<BellOutlined style={{ fontSize: '20px', color: '#333' }} />}
                        onClick={() => handleMenuClick({ key: 'notifications' })}
                    />
                </Badge>

                <Badge count={mockCartItemCount} offset={[5, 0]} className="cart-badge">
                    <Button
                        type="text"
                        icon={<ShoppingCartOutlined style={{ fontSize: '20px', color: '#333' }} />}
                        onClick={() => handleMenuClick({ key: 'cart' })}
                    />
                </Badge>

                <Dropdown
                    menu={{ items: userMenuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                    arrow
                >
                    <Space className="user-profile-dropdown">
                        <Avatar src={mockUser.avatar} icon={<UserOutlined />} />
                        <div className="user-info">
                            <span className="user-name">{mockUser.name}</span>
                            <span className="user-email">{mockUser.email}</span>
                        </div>
                    </Space>
                </Dropdown>
            </div>
        </Header>
    );
};

export default AppHeader; 