import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Chip,
  Divider,
  Badge,
  Box,
  Container,
  IconButton,
  Avatar,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import notificationService from '../../services/notificationService';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount = 0 } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const data = await notificationService.getNotifications({ limit: 1 });
        if (isMounted) {
          setUnreadNotifications(data.unreadCount || 0);
        }
      } catch (e) {
        // Safe ignore
      }
    };
    fetchUnread();
    return () => { isMounted = false; };
  }, [user]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        color: 'text.primary',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        borderBottom: '1px solid #e2e8f0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 70 } }}>
          {/* Logo & Brand */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.primary',
              mr: 3,
            }}
          >
            <SchoolIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'text.primary',
                fontSize: { xs: '1.2rem', md: '1.4rem' },
              }}
            >
              EduMart
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Button
              component={Link}
              to="/products"
              color="inherit"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
              }}
            >
              Catalog
            </Button>
          </Box>

          {/* Right Action Icons & Auth Controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Cart Button */}
            <IconButton
              component={Link}
              to="/cart"
              color="inherit"
              aria-label="cart"
              sx={{
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
            >
              <Badge badgeContent={cartCount} color="primary">
                <ShoppingCartIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            {!user ? (
              <Stack direction="row" spacing={1}>
                <Button component={Link} to="/login" variant="text" color="inherit">
                  Login
                </Button>
                <Button component={Link} to="/register" variant="contained" color="primary">
                  Register
                </Button>
              </Stack>
            ) : (
              <>
                {user.role === 'admin' && (
                  <Button
                    component={Link}
                    to="/admin"
                    color="primary"
                    variant="outlined"
                    size="small"
                    startIcon={<AdminPanelSettingsIcon />}
                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    Admin
                  </Button>
                )}

                {(user.role === 'tutor' || user.role === 'institute' || user.role === 'admin') && (
                  <Button
                    component={Link}
                    to="/seller/dashboard"
                    color="secondary"
                    variant="outlined"
                    size="small"
                    startIcon={<StorefrontIcon />}
                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    Seller Hub
                  </Button>
                )}

                {/* Notifications Button */}
                <IconButton
                  component={Link}
                  to="/notifications"
                  color="inherit"
                  aria-label="notifications"
                  sx={{
                    border: '1px solid #e2e8f0',
                    bgcolor: '#f8fafc',
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                >
                  <Badge badgeContent={unreadNotifications} color="error">
                    <NotificationsIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>

                {/* User Profile Button */}
                <Button
                  color="inherit"
                  aria-label="account of current user"
                  onClick={handleMenuOpen}
                  startIcon={
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: 'primary.main',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {(user?.firstName || 'U')[0].toUpperCase()}
                    </Avatar>
                  }
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    border: '1px solid #e2e8f0',
                    borderRadius: 2,
                    px: 1.5,
                  }}
                >
                  {user?.firstName || 'User'}
                </Button>

                {/* User Menu Dropdown */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      minWidth: 200,
                      borderRadius: 3,
                      mt: 1.5,
                      border: '1px solid #e2e8f0',
                    },
                  }}
                >
                  <MenuItem disabled sx={{ opacity: '1 !important', py: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {user?.firstName} {user?.lastName}
                      </Typography>
                      <Chip
                        label={(user?.role || 'student').toUpperCase()}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 'bold', fontSize: '0.65rem', mt: 0.5 }}
                      />
                    </Box>
                  </MenuItem>
                  <Divider />
                  <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                    Profile Settings
                  </MenuItem>
                  <MenuItem component={Link} to="/orders" onClick={handleMenuClose}>
                    My Orders & Downloads
                  </MenuItem>
                  <MenuItem component={Link} to="/checkout" onClick={handleMenuClose}>
                    Checkout
                  </MenuItem>
                  {(user.role === 'tutor' || user.role === 'institute' || user.role === 'admin') && (
                    <MenuItem component={Link} to="/seller/dashboard" onClick={handleMenuClose}>
                      Seller Hub
                    </MenuItem>
                  )}
                  {user.role === 'admin' && (
                    <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;