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
    LogoutOutlined,
    AppstoreOutlined,
    TagsOutlined,
    CommentOutlined,
    ShoppingCartOutlined
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
            icon: <DashboardOutlined style={{ fontSize: 22, color: '#1976d2' }} />,
            label: 'Dashboard',
        },
        {
            key: '/admin/products',
            icon: <ShoppingOutlined style={{ fontSize: 22, color: '#1976d2' }} />,
            label: 'Products',
        },
        {
            key: '/admin/categories',
            icon: <AppstoreOutlined style={{ fontSize: 22, color: '#1976d2' }} />,
            label: 'Category',
        },
        {
            key: '/admin/tags',
            icon: <TagsOutlined style={{ fontSize: 22, color: '#1976d2' }} />,
            label: 'Tags',
        },
        {
            key: '/admin/users',
            icon: <UserOutlined style={{ fontSize: 22, color: '#1976d2' }} />,
            label: 'Users',
        },
        {
            key: '/admin/posts',
            icon: <FileTextOutlined style={{ fontSize: 22, color: '#1976d2' }} />,
            label: 'Posts',
        },
        {
            key: '/admin/comments',
            icon: <CommentOutlined style={{ fontSize: 22, color: '#1976d2' }} />,
            label: 'Comments',
        },
        {
            key: '/admin/carts',
            icon: <ShoppingCartOutlined style={{ fontSize: 22, color: '#1976d2' }} />,
            label: 'Carts',
        },
        {
            key: '/admin/settings',
            icon: <SettingOutlined style={{ fontSize: 22, color: '#1976d2' }} />,
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
                    items={menuItems.map(item => ({
                        ...item,
                        style: { borderRadius: 12, margin: '6px 8px', fontSize: 17, padding: '10px 8px', display: 'flex', alignItems: 'center' },
                        icon: (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                background: location.pathname === item.key ? '#e3f2fd' : 'transparent',
                                transition: 'background 0.2s',
                            }}>{item.icon}</span>
                        )
                    }))}
                    onClick={({ key }) => navigate(key)}
                    style={{ background: 'transparent', border: 'none' }}
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
                        margin: '0',
                        padding: 10,
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