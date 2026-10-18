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
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
  Stack,
  Chip
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login({ email, password, rememberMe });
      enqueueSnackbar('Signed in successfully!', { variant: 'success' });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
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
            {/* Brand Logo & Heading */}
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
                <SchoolIcon sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="h5" component="h1" fontWeight={800} color="text.primary">
                Sign In to EduMart
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Sign in to access your purchased study materials, courses, and downloads
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
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

                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      value="remember"
                      color="primary"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
                />
                <MuiLink component={Link} to="/forgot-password" variant="body2" fontWeight={600} color="primary.main" underline="hover">
                  Forgot password?
                </MuiLink>
              </Box>

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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>

              {/* Quick Demo Accounts Helper */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>
                  Quick Database Demo Credentials:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                  <Chip
                    icon={<AdminPanelSettingsIcon sx={{ fontSize: 16 }} />}
                    label="Admin"
                    size="small"
                    variant="outlined"
                    color="primary"
                    clickable
                    onClick={() => handleQuickFill('admin@edumart.com', 'securePassword123')}
                    sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                  />
                  <Chip
                    icon={<PersonOutlinedIcon sx={{ fontSize: 16 }} />}
                    label="Tutor"
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => handleQuickFill('vidula.tutor@edumart.lk', 'Password123!')}
                    sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                  />
                  <Chip
                    icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                    label="Student"
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => handleQuickFill('student@edumart.com', 'Student123!')}
                    sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                  />
                </Stack>
              </Box>

              {/* Sign Up Link */}
              <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account yet?{' '}
                  <MuiLink component={Link} to="/register" variant="body2" fontWeight="bold" color="primary.main" underline="hover">
                    Create Account
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;