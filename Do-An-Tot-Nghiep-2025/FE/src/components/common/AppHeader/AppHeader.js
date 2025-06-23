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
import LoginModal from '../LoginModal';
import RegisterModal from '../RegisterModal';

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

    // Check login state
    const [token, setToken] = React.useState(localStorage.getItem('token'));
    const [showLogin, setShowLogin] = React.useState(false);
    const [showRegister, setShowRegister] = React.useState(false);

    React.useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

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
                <Link to="/" className="logo" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: 2 }}>
                    CoCoo
                </Link>
                <Menu
                    mode="horizontal"
                    defaultSelectedKeys={[location.pathname.split('/')[1] || 'home']}
                    onClick={handleMenuClick}
                    className="main-menu"
                    style={{ background: 'transparent', borderBottom: 'none', minWidth: 400 }}
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
                    enterButton={<SearchOutlined style={{ color: '#fff', fontWeight: 'bold' }} />}
                />

                <Badge count={mockNotifications.length} offset={[5, 0]} className="notification-badge" style={{ backgroundColor: '#1976d2' }}>
                    <Button
                        type="text"
                        icon={<BellOutlined style={{ fontSize: '20px', color: '#1976d2' }} />}
                        onClick={() => handleMenuClick({ key: 'notifications' })}
                    />
                </Badge>

                <Badge count={mockCartItemCount} offset={[5, 0]} className="cart-badge" style={{ backgroundColor: '#1976d2' }}>
                    <Button
                        type="text"
                        icon={<ShoppingCartOutlined style={{ fontSize: '20px', color: '#1976d2' }} />}
                        onClick={() => handleMenuClick({ key: 'cart' })}
                    />
                </Badge>

                {token ? (
                    <Dropdown
                        menu={{ items: userMenuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                        arrow
                    >
                        <Space className="user-profile-dropdown">
                            <Avatar src={mockUser.avatar} icon={<UserOutlined />} size={40} style={{ backgroundColor: '#1976d2', color: '#fff', border: '2px solid #fff' }} />
                            <div className="user-info">
                                <span className="user-name" style={{ color: '#1976d2', fontWeight: 700 }}>{mockUser.name}</span>
                                <span className="user-email" style={{ color: '#555', fontSize: 12 }}>{mockUser.email}</span>
                            </div>
                        </Space>
                    </Dropdown>
                ) : (
                    <>
                        <Button type="primary" style={{ marginRight: 10 }} onClick={() => setShowLogin(true)}>
                            Đăng nhập
                        </Button>
                        <Button onClick={() => setShowRegister(true)}>
                            Đăng ký
                        </Button>
                    </>
                )}
            </div>
            <LoginModal
                open={showLogin}
                onClose={() => setShowLogin(false)}
                onLoginSuccess={() => {
                    setToken(localStorage.getItem('token'));
                }}
            />
            <RegisterModal
                open={showRegister}
                onClose={() => setShowRegister(false)}
                onRegisterSuccess={() => {
                    setShowLogin(true);
                }}
            />
        </Header>
    );
};

export default AppHeader; 