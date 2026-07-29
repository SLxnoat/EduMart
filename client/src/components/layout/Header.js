import React from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PersonIcon from '@mui/icons-person';
import ShoppingCartIcon from '@mui/icons-shopping-cart';
import NotificationsIcon from '@mui/icons-notifications';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none' }}>
          EduMart
        </Typography>
        <div>
          <Button component={Link} to="/login" color="inherit">
            Login
          </Button>
          <Button component={Link} to="/register" color="inherit" sx={{ ml: 2 }}>
            Register
          </Button>
          {user ? (
            <>
              <Button
                color="inherit"
                aria-label="cart"
                sx={{ position: 'relative', ml: 3 }}
                component={Link}
                to="/cart"
              >
                <ShoppingCartIcon />
              </Button>
              <Button
                color="inherit"
                aria-label="notifications"
                sx={{ position: 'relative', ml: 2 }}
                component={Link}
                to="/notifications"
              >
                <NotificationsIcon />
              </Button>
              <Button
                color="inherit"
                aria-label="account of current user"
                sx={{ position: 'relative', ml: 2 }}
                endIcon={<PersonIcon />}
                onClick handleClick
              >
                {user.firstName}
              </Button>
            </>
          } : null}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;