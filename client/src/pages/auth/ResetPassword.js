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
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import KeyIcon from '@mui/icons-material/Key';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing or invalid reset token in URL.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, newPassword);
      setSuccess(true);
      enqueueSnackbar('Password reset successful! You can now log in.', { variant: 'success' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. The link may have expired.';
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
                <KeyIcon sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="h5" component="h1" fontWeight={800} color="text.primary">
                Set New Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Choose a strong password with at least 8 characters to secure your account
              </Typography>
            </Box>

            {!token && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                No reset token detected in the link. Please check your verification or reset email link.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success ? (
              <Box sx={{ textAlign: 'center' }}>
                <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ mb: 3, borderRadius: 2 }}>
                  Password reset successfully! Redirecting you to Sign In...
                </Alert>
                <Button component={Link} to="/login" variant="contained" fullWidth size="large" sx={{ py: 1.3, fontWeight: 700 }}>
                  Go to Sign In
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    required
                    fullWidth
                    name="newPassword"
                    label="New Password (min 8 characters)"
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Stack>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !token}
                  sx={{
                    mt: 3.5,
                    mb: 2,
                    py: 1.4,
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Update & Reset Password'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPassword;
