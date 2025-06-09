import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    UserOutlined,
    FileTextOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.scss';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/products',
            icon: <ShoppingOutlined />,
            label: 'Products',
        },
        {
            key: '/admin/categories',
            icon: <ShoppingOutlined />,
            label: 'Category',
        },
        {
            key: '/admin/tags',
            icon: <ShoppingOutlined />,
            label: 'Tags',
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: 'Users',
        },
        {
            key: '/admin/posts',
            icon: <FileTextOutlined />,
            label: 'Posts',
        },
        {
            key: '/admin/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
        },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            localStorage.removeItem('adminToken');
            navigate('/login');
        } else if (key === 'profile') {
            navigate('/admin/profile');
        }
    };

    return (
        <Layout className="admin-layout">
            <Sider trigger={null} collapsible collapsed={collapsed} className="admin-sider">
                <div className="admin-logo">
                    <h2>{collapsed ? 'A' : 'Admin'}</h2>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                    className="admin-header"
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="trigger-button"
                    />
                    <div className="header-right">
                        <Button type="link" onClick={() => navigate('/')}>
                            View Site
                        </Button>
                        <Dropdown
                            menu={{
                                items: userMenuItems,
                                onClick: handleMenuClick,
                            }}
                            placement="bottomRight"
                        >
                            <div className="user-info">
                                <Avatar icon={<UserOutlined />} />
                                <span className="username">Admin</span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        minHeight: 280,
                    }}
                    className="admin-content"
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout; 