import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Chip, Divider, Badge } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount = 0 } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);

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
    <AppBar position="fixed">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          EduMart
        </Typography>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button component={Link} to="/products" color="inherit">
            Catalog
          </Button>

          {/* Cart button always visible for both guest and authenticated users */}
          <Button
            color="inherit"
            aria-label="cart"
            sx={{ ml: 1 }}
            component={Link}
            to="/cart"
          >
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </Button>

          {!user ? (
            <>
              <Button component={Link} to="/login" color="inherit" sx={{ ml: 1 }}>
                Login
              </Button>
              <Button component={Link} to="/register" color="inherit" sx={{ ml: 2 }}>
                Register
              </Button>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <Button
                  component={Link}
                  to="/admin"
                  color="inherit"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{ ml: 1 }}
                >
                  Admin
                </Button>
              )}

              <Button
                color="inherit"
                aria-label="notifications"
                sx={{ ml: 1 }}
                component={Link}
                to="/notifications"
              >
                <NotificationsIcon />
              </Button>

              <Button
                color="inherit"
                aria-label="account of current user"
                sx={{ ml: 1 }}
                endIcon={<PersonIcon />}
                onClick={handleMenuOpen}
              >
                {user?.firstName || 'User'}
              </Button>

              {/* User Menu Dropdown */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled sx={{ opacity: '1 !important', py: 0.5 }}>
                  <Chip
                    label={(user?.role || 'student').toUpperCase()}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                  />
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                  Profile
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
                    Admin Dashboard
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;