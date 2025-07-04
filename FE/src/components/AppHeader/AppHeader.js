import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserOutlined, ShoppingCartOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { selectUnreadCount } from '../../store/slices/notificationSlice';
import { selectCartItemCount, setCartItems } from '../../store/slices/cartSlice';
import cartService from '../../services/cartService';
import { LoginModal, RegisterModal } from '../common/AuthModals';
import './AppHeader.scss';

const { Header } = Layout;

const AppHeader = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const unreadNotificationCount = useSelector(selectUnreadCount);
    const cartItemCount = useSelector(selectCartItemCount);
    const dispatch = useDispatch();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

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
                // Logout luôn về trang chủ, không redirect sang /login
            }
        }
    ];

    // Real-time: fetch cart when user changes
    React.useEffect(() => {
        const fetchCart = async () => {
            if (user) {
                try {
                    const cart = await cartService.getMyCart();
                    if (cart && Array.isArray(cart.items)) {
                        const items = cart.items.map(item => ({
                            id: item.productId?._id || item.productId,
                            name: item.productId?.basicInformation?.productName || item.productId?.name || '',
                            price: item.productId?.pricingAndInventory?.salePrice || 0,
                            image: item.productId?.media?.mainImage || '',
                            quantity: item.quantity
                        }));
                        dispatch(setCartItems(items));
                    } else {
                        dispatch(setCartItems([]));
                    }
                } catch {
                    dispatch(setCartItems([]));
                }
            } else {
                dispatch(setCartItems([]));
            }
        };
        fetchCart();

        // Lắng nghe realtime cart update qua socket
        let unsubscribe;
        if (user) {
            unsubscribe = cartService.listenCartUpdates(() => {
                fetchCart();
            });
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user, dispatch]);

    return (
        <>
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
                            <Button type="link" onClick={() => setShowLogin(true)}>
                                Đăng nhập
                            </Button>
                            <Button type="primary" onClick={() => setShowRegister(true)}>
                                Đăng ký
                            </Button>
                        </div>
                    )}
                    <Badge count={cartItemCount} offset={[5, 0]} className="cart-badge">
                        <Button
                            type="text"
                            icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />}
                            onClick={() => navigate('/cart')}
                        />
                    </Badge>
                    <Badge count={unreadNotificationCount} offset={[5, 0]} className="notification-badge">
                        <Button
                            type="text"
                            icon={<BellOutlined style={{ fontSize: '20px' }} />}
                        // onClick={...}
                        />
                    </Badge>
                </div>
            </Header>
            <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
            <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
        </>
    );
};

export default AppHeader; 