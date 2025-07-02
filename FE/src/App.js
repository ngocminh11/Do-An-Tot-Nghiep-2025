import React, { useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import AdminLayout from './layouts/admin/AdminLayout';
import { Layout } from 'antd';
import Loading from './components/common/Loading/Loading';
import CategoryFilter from './components/common/CategoryFilter/CategoryFilter';
import { useAuth } from './contexts/AuthContext';
import PostList from './pages/admin/PostManagement/PostList';
import AddPost from './pages/admin/PostManagement/AddPost';
import EditPost from './pages/admin/PostManagement/EditPost';
import AddProduct from './pages/admin/ProductManagement/AddProduct';
import CategoryManagement from './pages/admin/CategoryManagement/CategoryManagement';
import TagManagement from './pages/admin/TagManagement/TagManagement';
import AddCategory from './pages/admin/CategoryManagement/AddCategory';
import EditCategory from './pages/admin/CategoryManagement/EditCategory';
import AddTag from './pages/admin/TagManagement/AddTag';
import EditTag from './pages/admin/TagManagement/EditTag';
import EditProduct from './pages/admin/ProductManagement/EditProduct';
import AppFooter from './components/common/AppFooter/AppFooter';
import AppHeader from './components/common/AppHeader/AppHeader';
import ChatBot from './components/ChatBot/ChatBot';
import { Modal, Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import OrderManagement from './pages/admin/OrderManagement/OrderManagement';
import PromotionManagement from './pages/admin/PromotionManagement/PromotionManagement';
import CommentManagement from './pages/admin/CommentManagement/CommentManagement';
import { AuthModalProvider, useAuthModal } from './contexts/AuthModalContext';
import { AuthProviderWithNavigate } from './contexts/AuthContext';
import { LoginModal } from './components/common/AuthModals';

// Lazy load user components with preloading hints
const Home = lazy(() => import('./pages/user/Home/Home'));
const AllProducts = lazy(() => import('./pages/user/AllProducts/AllProducts'));
const ProductDetail = lazy(() => import('./pages/user/ProductDetail/ProductDetail'));
const Profile = lazy(() => import('./pages/user/Profile/Profile'));
const About = lazy(() => import('./pages/user/About/About'));
const Contact = lazy(() => import('./pages/user/Contact/Contact'));
const Privacy = lazy(() => import('./pages/user/Privacy/Privacy'));
const TermsOfService = lazy(() => import('./pages/user/Terms/Terms'));
const FAQ = lazy(() => import('./pages/user/FAQ/FAQ'));
const Blog = lazy(() => import('./pages/user/Blog/Blog'));
const BlogDetail = lazy(() => import('./pages/user/Blog/BlogDetail'));

// Import Cart and Checkout directly (frequently used)
import Cart from './pages/user/Cart/Cart';
import Checkout from './pages/user/Checkout/Checkout';

// Lazy load admin components
const Dashboard = lazy(() => import('./pages/admin/Dashboard/Dashboard'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement/ProductManagement'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement/UserManagement'));
const ContentManagement = lazy(() => import('./pages/admin/ContentManagement/ContentManagement'));
const Settings = lazy(() => import('./pages/admin/Settings/Settings'));

const ADMIN_ROLES = [
  'Nhân Viên',
  'Quản Lý Kho',
  'Quản Lý Nhân Sự',
  'Quản Lý Đơn Hàng',
  'Quản Lý Chính'
];

const ProtectedRoute = React.memo(({ children, isAdmin }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (isAdmin) {
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
});

// Memoized Loading component
const LoadingFallback = React.memo(() => <Loading />);

// Import styles
import './App.scss';
import './layouts/admin/AdminLayout.scss';
import './pages/admin/Dashboard/Dashboard.scss';
import './pages/admin/ProductManagement/ProductManagement.scss';
import './pages/admin/OrderManagement/OrderManagement.scss';
import './pages/admin/UserManagement/UserManagement.scss';
import './pages/admin/CategoryManagement/CategoryManagement.scss';
import './pages/admin/TagManagement/TagManagement.scss';
import './pages/user/Cart/Cart.scss';
import './pages/user/Checkout/Checkout.scss';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);
  const { user } = useAuth();
  const { showLogin, setShowLogin } = useAuthModal();

  // Memoized route configurations
  const userRoutes = useMemo(() => [
    { path: '/', element: <Home /> },
    { path: '/products', element: <AllProducts /> },
    { path: '/products/:productId', element: <ProductDetail /> },
    { path: '/cart', element: <Cart /> },
    { path: '/checkout', element: <Checkout /> },
    { path: '/loading', element: <Loading /> },
    { path: '/profile', element: <Profile /> },
    { path: '/about', element: <About /> },
    { path: '/contact', element: <Contact /> },
    { path: '/categories', element: <CategoryFilter /> },
    { path: '/privacy', element: <Privacy /> },
    { path: '/terms', element: <TermsOfService /> },
    { path: '/faq', element: <FAQ /> },
    { path: '/blog', element: <Blog /> },
    { path: '/posts/:id', element: <BlogDetail /> },
  ], []);

  const adminRoutes = useMemo(() => [
    { path: '/admin', element: <AdminLayout><Dashboard /></AdminLayout> },
    { path: '/admin/products', element: <AdminLayout><ProductManagement /></AdminLayout> },
    { path: '/admin/products/add', element: <AdminLayout><AddProduct /></AdminLayout> },
    { path: '/admin/products/:id', element: <AdminLayout><EditProduct /></AdminLayout> },
    { path: '/admin/categories', element: <AdminLayout><CategoryManagement /></AdminLayout> },
    { path: '/admin/categories/add', element: <AdminLayout><AddCategory /></AdminLayout> },
    { path: '/admin/categories/edit/:id', element: <AdminLayout><EditCategory /></AdminLayout> },
    { path: '/admin/tags', element: <AdminLayout><TagManagement /></AdminLayout> },
    { path: '/admin/tags/add', element: <AdminLayout><AddTag /></AdminLayout> },
    { path: '/admin/tags/edit/:id', element: <AdminLayout><EditTag /></AdminLayout> },
    { path: '/admin/users', element: <AdminLayout><UserManagement /></AdminLayout> },
    { path: '/admin/content', element: <AdminLayout><ContentManagement /></AdminLayout> },
    { path: '/admin/settings', element: <AdminLayout><Settings /></AdminLayout> },
    { path: '/admin/posts', element: <AdminLayout><PostList /></AdminLayout> },
    { path: '/admin/posts/add', element: <AdminLayout><AddPost /></AdminLayout> },
    { path: '/admin/posts/edit/:id', element: <AdminLayout><EditPost /></AdminLayout> },
    { path: '/admin/orders', element: <AdminLayout><OrderManagement /></AdminLayout> },
    { path: '/admin/promotion', element: <AdminLayout><PromotionManagement /></AdminLayout> },
    { path: '/admin/comments', element: <AdminLayout><CommentManagement /></AdminLayout> },
  ], []);

  // Memoized conditional rendering
  const shouldShowHeader = useMemo(() => !isAdminRoute, [isAdminRoute]);
  const shouldShowFooter = useMemo(() => !isAdminRoute, [isAdminRoute]);
  const shouldShowChatBot = useMemo(() => !isAdminRoute, [isAdminRoute]);

  return (
    <>
      {shouldShowHeader && <AppHeader />}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* User Routes */}
          {userRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {/* Route riêng cho từng role */}
          <Route path="/user" element={<Home />} />
          <Route path="/staff" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/warehouseManager" element={<AdminLayout><ProductManagement /></AdminLayout>} />
          <Route path="/orderManager" element={<AdminLayout><OrderManagement /></AdminLayout>} />
          <Route path="/humanResourcesManager" element={<AdminLayout><UserManagement /></AdminLayout>} />
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />

          {/* Protected User Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          {adminRoutes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute isAdmin>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}
        </Routes>
      </Suspense>
      {shouldShowFooter && <AppFooter />}
      {/* Show ChatBot for all non-admin routes */}
      {shouldShowChatBot && <ChatBot />}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;