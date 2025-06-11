import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { startTokenRefresh } from './components/common/TokenService';
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

// Lazy load user components
const Home = lazy(() => import('./pages/user/Home/Home'));
const AllProducts = lazy(() => import('./pages/user/AllProducts/AllProducts'));
const ProductDetail = lazy(() => import('./pages/user/ProductDetail/ProductDetail'));
const Profile = lazy(() => import('./pages/user/Profile/Profile'));
const About = lazy(() => import('./pages/user/About/About'));
const Contact = lazy(() => import('./pages/user/Contact/Contact'));
const Privacy = lazy(() => import('./pages/user/Privacy/Privacy'));
const TermsOfService = lazy(() => import('./pages/user/Terms/Terms'));
const FAQ = lazy(() => import('./pages/user/FAQ/FAQ'));
const Login = lazy(() => import('./pages/user/Login/Login'));

// Import Cart and Checkout directly
import Cart from './pages/user/Cart/Cart';
import Checkout from './pages/user/Checkout/Checkout';

// Lazy load admin components
const Dashboard = lazy(() => import('./pages/admin/Dashboard/Dashboard'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement/ProductManagement'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement/UserManagement'));
const ContentManagement = lazy(() => import('./pages/admin/ContentManagement/ContentManagement'));
const Settings = lazy(() => import('./pages/admin/Settings/Settings'));

// Protected Route component
const ProtectedRoute = ({ children, isAdmin }) => {
  const { isAuthenticated } = useAuth();

  // Remove authentication check for admin routes
  if (isAdmin) {
    return children;
  }

  // Keep authentication check for user routes
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

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

const App = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const token = Cookies.get('token');
  if (token) {
    startTokenRefresh();
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

// New component to handle conditional header rendering
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const userRoutes = [
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
    { path: '/login', element: <Login /> },
  ];

  const adminRoutes = [
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
  ];

  return (
    <>
      {!isAdminRoute && <AppHeader />}
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* User Routes */}
          {userRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

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
      {!isAdminRoute && <AppFooter />}
    </>
  );
};

export default App;