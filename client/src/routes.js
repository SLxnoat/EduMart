import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import Profile from './pages/profile/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';

// Children-based private & role-based route guard (compatible with direct JSX element passing)
export const Guard = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace state={{ unauthorized: true, from: location }} />;
  }

  return <>{children}</>;
};

const routes = [
  { path: '/',                element: <Home /> },
  { path: '/about',           element: <About /> },
  { path: '/login',           element: <Login /> },
  { path: '/register',        element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password',  element: <ResetPassword /> },
  { path: '/verify-email',    element: <VerifyEmail /> },
  { path: '/products',        element: <ProductList /> },
  { path: '/products/:id',    element: <ProductDetail /> },
  { path: '/cart',            element: <Cart /> },
  { path: '/checkout',        element: <Guard><Checkout /></Guard> },
  { path: '/orders',          element: <Guard><OrderList /></Guard> },
  { path: '/orders/:id',      element: <Guard><OrderDetail /></Guard> },
  { path: '/profile',         element: <Guard><Profile /></Guard> },
  { path: '/admin',           element: <Guard roles={['admin']}><AdminDashboard /></Guard> },
  { path: '*',                element: <NotFound /> }
];

export default routes;