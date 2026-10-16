import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setSuccess(true);
      enqueueSnackbar('Password reset instructions dispatched!', { variant: 'info' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to dispatch reset request. Please try again.';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                p: 1.5,
                borderRadius: '50%',
                display: 'flex',
                mb: 1
              }}
            >
              <LockResetIcon />
            </Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Enter your registered email and we'll send you a link to reset your password.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                If that email address is in our database, we have sent a password reset link to it. Please check your inbox.
              </Alert>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                fullWidth
              >
                Back to Sign In
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Registered Email Address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <MuiLink component={Link} to="/login" variant="body2" underline="hover">
                  Remember your password? Sign In
                </MuiLink>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
