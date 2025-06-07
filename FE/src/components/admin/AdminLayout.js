import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    LogoutOutlined,
    AppstoreOutlined,
    TagsOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = React.useState(false);

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
            icon: <AppstoreOutlined />,
            label: 'Category Management',
        },
        {
            key: '/admin/tags',
            icon: <TagsOutlined />,
            label: 'Tag Management',
        },
        {
            key: '/admin/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Orders',
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: 'Users',
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    const handleLogout = () => {
        // TODO: Implement logout functionality
        console.log('Logout clicked');
    };

    return (
        <Layout className="admin-layout">
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={250}
            >
                <div className="logo">
                    <h1>{collapsed ? 'C' : 'CoCoo Admin'}</h1>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                />
                <div className="logout-button">
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[]}
                        items={[
                            {
                                key: 'logout',
                                icon: <LogoutOutlined />,
                                label: 'Logout',
                                onClick: handleLogout,
                            },
                        ]}
                    />
                </div>
            </Sider>
            <Layout>
                <Header className="header">
                    <div className="header-content">
                        <h2>
                            {menuItems.find((item) => item.key === location.pathname)?.label ||
                                'Dashboard'}
                        </h2>
                    </div>
                </Header>
                <Content className="content">{children}</Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout; 