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
  Link as MuiLink,
  InputAdornment,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
    <Box
      sx={{
        minHeight: 'calc(100vh - 160px)',
        py: { xs: 4, sm: 8 },
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.06), transparent 70%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
            bgcolor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {/* Header Accent Bar */}
          <Box
            sx={{
              height: 6,
              background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #f59e0b 100%)',
            }}
          />

          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                  color: 'primary.main',
                  mb: 1.5,
                }}
              >
                <LockResetIcon sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="h5" component="h1" fontWeight={800} color="text.primary">
                Forgot Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 400, mx: 'auto' }}>
                Enter your registered email address and we will dispatch a secure link to recover your account.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success ? (
              <Box sx={{ textAlign: 'center' }}>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  If that email address exists in our database, we have sent a secure password reset link to it. Please check your inbox.
                </Alert>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  sx={{ py: 1.3, fontWeight: 700 }}
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
                  placeholder="e.g. yourname@domain.com"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.4,
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                  <Typography variant="body2" color="text.secondary">
                    Remember your password?{' '}
                    <MuiLink component={Link} to="/login" variant="body2" fontWeight="bold" color="primary.main" underline="hover">
                      Sign In
                    </MuiLink>
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
