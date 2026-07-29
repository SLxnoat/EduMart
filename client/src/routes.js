import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import Profile from './pages/profile/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';

// Children-based private route guard (compatible with direct JSX element passing)
const Guard = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  return user ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

const routes = [
  { path: '/',           element: <Home /> },
  { path: '/about',      element: <About /> },
  { path: '/login',      element: <Login /> },
  { path: '/register',   element: <Register /> },
  { path: '/products',   element: <ProductList /> },
  { path: '/products/:id', element: <ProductDetail /> },
  { path: '/cart',       element: <Cart /> },
  { path: '/checkout',   element: <Checkout /> },
  { path: '/profile',    element: <Guard><Profile /></Guard> },
  { path: '/admin',      element: <Guard><AdminDashboard /></Guard> },
  { path: '*',           element: <NotFound /> }
];

export default routes;