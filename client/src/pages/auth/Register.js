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
  Tabs,
  Tab,
  Grid,
  LinearProgress,
  Link as MuiLink,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const ROLE_DESCRIPTIONS = {
  student: {
    badge: 'Student Account',
    summary: 'Instant access to A/L & O/L past papers, model answers, revision notes, and digital PDFs.',
    cta: 'Register as Student',
  },
  tutor: {
    badge: 'Tutor / Educator',
    summary: 'Publish study packs, sell your own model papers, and track student downloads and payouts.',
    cta: 'Register as Tutor',
  },
  institute: {
    badge: 'Educational Institute',
    summary: 'Distribute curriculum materials island-wide with verified institutional branding.',
    cta: 'Register as Institute',
  },
};

const Register = () => {
  const [role, setRole] = useState('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Password strength calculation & criteria
  const getPasswordCriteria = (pwd) => {
    return {
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[^A-Za-z0-9]/.test(pwd),
    };
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'error' };
    const criteria = getPasswordCriteria(pwd);
    let score = 0;
    if (criteria.hasLength) score += 25;
    if (criteria.hasUpper) score += 25;
    if (criteria.hasNumber) score += 25;
    if (criteria.hasSpecial) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'error' };
    if (score <= 50) return { score, label: 'Fair', color: 'warning' };
    if (score <= 75) return { score, label: 'Good', color: 'info' };
    return { score, label: 'Strong', color: 'success' };
  };

  const pwdStrength = getPasswordStrength(password);
  const criteria = getPasswordCriteria(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({
        firstName,
        lastName,
        email,
        password,
        phone,
        institution,
        role,
      });
      enqueueSnackbar('Registration successful! Please check your email to verify.', { variant: 'success' });
      navigate('/profile');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Registration failed.';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const currentRole = ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS.student;

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 70px)',
        bgcolor: 'background.default',
        py: { xs: 4, sm: 6 },
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at top, rgba(37,99,235,0.06), transparent 70%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
            overflow: 'hidden',
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              p: 3,
              pb: 2,
              textAlign: 'center',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: 'primary.light',
                color: 'primary.main',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                boxShadow: '0 4px 10px rgba(37,99,235,0.15)',
              }}
            >
              <SchoolIcon fontSize="medium" />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Join EduMart
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create your account to start buying and selling learning materials
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 4 }, pt: 3 }}>
            {/* Role Selection Tabs */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                Select Your Role
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  p: 0.5,
                  bgcolor: '#f8fafc',
                  borderColor: '#e2e8f0',
                }}
              >
                <Tabs
                  value={role}
                  onChange={(e, val) => setRole(val)}
                  variant="fullWidth"
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    minHeight: 44,
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: 1.5,
                    },
                    '& .MuiTab-root': {
                      minHeight: 44,
                      fontWeight: 600,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      textTransform: 'none',
                      py: 1,
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        fontWeight: 700,
                      },
                    },
                  }}
                >
                  <Tab
                    icon={<SchoolIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label="Student"
                    value="student"
                  />
                  <Tab
                    icon={<MenuBookIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label="Tutor / Seller"
                    value="tutor"
                  />
                  <Tab
                    icon={<AccountBalanceIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label="Institute"
                    value="institute"
                  />
                </Tabs>
              </Paper>
            </Box>

            {/* Role Info Helper Card */}
            <Box
              sx={{
                mb: 3,
                p: 1.5,
                borderRadius: 2,
                bgcolor: role === 'tutor' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(37, 99, 235, 0.05)',
                border: '1px solid',
                borderColor: role === 'tutor' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(37, 99, 235, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Chip
                label={currentRole.badge}
                size="small"
                color={role === 'tutor' ? 'secondary' : 'primary'}
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ flex: 1, lineHeight: 1.4 }}>
                {currentRole.summary}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="institution"
                    label="School / University / Institute"
                    placeholder="e.g. Royal College"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password (min 8 characters)"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
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
                    }}
                  />
                  {password && (
                    <Box sx={{ mt: 1.5, px: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Password Strength:
                        </Typography>
                        <Typography variant="caption" color={`${pwdStrength.color}.main`} fontWeight="bold">
                          {pwdStrength.label}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pwdStrength.score}
                        color={pwdStrength.color}
                        sx={{ height: 6, borderRadius: 3 }}
                      />

                      {/* Criteria Checklist */}
                      <Stack direction="row" spacing={1.5} sx={{ mt: 1 }} flexWrap="wrap">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {criteria.hasLength ? (
                            <CheckCircle sx={{ fontSize: 13, color: 'success.main' }} />
                          ) : (
                            <RadioButtonUnchecked sx={{ fontSize: 13, color: 'text.disabled' }} />
                          )}
                          <Typography variant="caption" sx={{ color: criteria.hasLength ? 'success.main' : 'text.secondary' }}>
                            8+ chars
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {criteria.hasUpper ? (
                            <CheckCircle sx={{ fontSize: 13, color: 'success.main' }} />
                          ) : (
                            <RadioButtonUnchecked sx={{ fontSize: 13, color: 'text.disabled' }} />
                          )}
                          <Typography variant="caption" sx={{ color: criteria.hasUpper ? 'success.main' : 'text.secondary' }}>
                            Uppercase
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {criteria.hasNumber || criteria.hasSpecial ? (
                            <CheckCircle sx={{ fontSize: 13, color: 'success.main' }} />
                          ) : (
                            <RadioButtonUnchecked sx={{ fontSize: 13, color: 'text.disabled' }} />
                          )}
                          <Typography variant="caption" sx={{ color: criteria.hasNumber || criteria.hasSpecial ? 'success.main' : 'text.secondary' }}>
                            Number or symbol
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputProps={{
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
                    }}
                  />
                </Grid>
              </Grid>

              {/* Submit CTA */}
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
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : currentRole.cta}
              </Button>

              {/* Privacy & Trust Guarantee */}
              <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Your data is protected under EduMart GDPR Privacy Standards
                </Typography>
              </Stack>

              {/* Sign In Link */}
              <Box sx={{ textAlign: 'center', pt: 1, borderTop: '1px solid #f1f5f9' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <MuiLink component={Link} to="/login" variant="body2" fontWeight="bold" color="primary.main" underline="hover">
                    Sign In
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

export default Register;