import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Header = () => {
  const { user, logout } = useAuth();
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

        <div>
          {!user ? (
            <>
              <Button component={Link} to="/login" color="inherit">
                Login
              </Button>
              <Button component={Link} to="/register" color="inherit" sx={{ ml: 2 }}>
                Register
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                aria-label="cart"
                sx={{ ml: 2 }}
                component={Link}
                to="/cart"
              >
                <ShoppingCartIcon />
              </Button>

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
                <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                  Profile
                </MenuItem>
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