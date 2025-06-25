import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserOutlined, ShoppingCartOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { selectUnreadCount } from '../../store/slices/notificationSlice';
import './AppHeader.scss';

const { Header } = Layout;

const AppHeader = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const unreadNotificationCount = useSelector(selectUnreadCount);

    const menuItems = [
        {
            key: '/',
            label: <Link to="/">Trang chủ</Link>
        },
        {
            key: '/products',
            label: <Link to="/products">Sản phẩm</Link>
        },
        {
            key: '/blog',
            label: <Link to="/blog">Blog</Link>
        },
        {
            key: '/about',
            label: <Link to="/about">Giới thiệu</Link>
        },
        {
            key: '/contact',
            label: <Link to="/contact">Liên hệ</Link>
        }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to="/profile">Thông tin cá nhân</Link>,
            icon: <UserOutlined />
        },
        {
            key: 'orders',
            label: <Link to="/orders">Đơn hàng của tôi</Link>,
            icon: <ShoppingCartOutlined />
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            onClick: () => {
                logout();
                navigate('/login');
            }
        }
    ];

    return (
        <Header className="app-header">
            <div className="logo">
                <Link to="/">Beauty Store</Link>
            </div>
            <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={menuItems}
                className="main-menu"
            />
            <div className="header-right">
                {user ? (
                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <Avatar icon={<UserOutlined />} />
                    </Dropdown>
                ) : (
                    <div className="auth-buttons">
                        <Button type="link" onClick={() => navigate('/login')}>
                            Đăng nhập
                        </Button>
                        <Button type="primary" onClick={() => navigate('/register')}>
                            Đăng ký
                        </Button>
                    </div>
                )}
                <Badge count={unreadNotificationCount} offset={[5, 0]} className="notification-badge">
                    <Button
                        type="text"
                        icon={<BellOutlined style={{ fontSize: '20px' }} />}
                    // onClick={...}
                    />
                </Badge>
            </div>
        </Header>
    );
};

export default AppHeader; 