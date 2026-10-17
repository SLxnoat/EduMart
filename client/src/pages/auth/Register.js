import React, { useState, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Divider,
  Avatar,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  RadioButtonUnchecked,
  Star as StarIcon,
  Edit as EditIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Timer as TimerIcon,
  ShieldOutlined as ShieldOutlinedIcon,
} from '@mui/icons-material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';
import authService from '../../services/authService';

const ROLE_CONFIG = {
  student: {
    title: 'Student Account',
    summary: 'Instant access to A/L & O/L past papers, model answers, revision notes, and digital PDFs.',
    cta: 'Register as Student',
    features: [
      'Download G.C.E. A/L & O/L past papers & marking schemes',
      'Search syllabus-tailored study packs by subject & grade',
      'Track printed study material deliveries to your doorstep',
      'Ask 24/7 AI Assistant for exam guidance & order tracking',
    ],
  },
  tutor: {
    title: 'Tutor / Educator',
    summary: 'Publish study packs, sell your own model papers, and track student downloads and payouts.',
    cta: 'Register as Tutor',
    features: [
      'Upload digital PDFs, video lecture packs & model exams',
      'Set your own prices and offer promotional discount coupons',
      'Automated sales analytics & secure commission payouts',
      'Reach thousands of students across all 9 provinces',
    ],
  },
  institute: {
    title: 'Educational Institute',
    summary: 'Distribute curriculum materials island-wide with verified institutional branding.',
    cta: 'Register as Institute',
    features: [
      'Official verified institutional badge on all publications',
      'Manage multiple instructor listings under one portal',
      'Bulk study material management & inventory controls',
      'Direct courier fulfillment integration for printed packs',
    ],
  },
};

const STEPS = ['Account & Profile', 'Security & Credentials', 'Review & Confirm'];

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
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
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [resendingVerification, setResendingVerification] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Automatic redirect countdown once registration succeeds
  useEffect(() => {
    if (!registeredUser) return;
    if (countdown <= 0) {
      const destination =
        registeredUser.role === 'tutor' || registeredUser.role === 'institute'
          ? '/seller/dashboard'
          : '/profile';
      navigate(destination);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [registeredUser, countdown, navigate]);

  const handleImmediateRedirect = (target) => {
    if (target) {
      navigate(target);
    } else {
      const destination =
        registeredUser?.role === 'tutor' || registeredUser?.role === 'institute'
          ? '/seller/dashboard'
          : '/profile';
      navigate(destination);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredUser?.email) return;
    try {
      setResendingVerification(true);
      await authService.resendVerification(registeredUser.email);
      enqueueSnackbar('Verification link resent to your email address!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Could not resend verification email.', { variant: 'error' });
    } finally {
      setResendingVerification(false);
    }
  };

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
    const crit = getPasswordCriteria(pwd);
    let score = 0;
    if (crit.hasLength) score += 25;
    if (crit.hasUpper) score += 25;
    if (crit.hasNumber) score += 25;
    if (crit.hasSpecial) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'error' };
    if (score <= 50) return { score, label: 'Fair', color: 'warning' };
    if (score <= 75) return { score, label: 'Good', color: 'info' };
    return { score, label: 'Strong', color: 'success' };
  };

  const pwdStrength = getPasswordStrength(password);
  const criteria = getPasswordCriteria(password);

  // Step 1 Validation
  const validateStep1 = () => {
    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return false;
    }
    if (!lastName.trim()) {
      setError('Please enter your last name.');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!password) {
      setError('Please enter a password.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!validateStep1()) return;
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (!validateStep2()) return;
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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

    if (!agreedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        firstName,
        lastName,
        email,
        password,
        phone,
        institution,
        role,
      });
      enqueueSnackbar('Registration successful! Please check your email to verify.', { variant: 'success' });
      setRegisteredUser({
        firstName,
        lastName,
        email,
        phone,
        institution,
        role,
        ...(res || {})
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Registration failed.';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const currentRole = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  // Render Registration Success & Onboarding Redirect Hub
  if (registeredUser) {
    const isTutorOrInstitute =
      registeredUser.role === 'tutor' || registeredUser.role === 'institute';
    const destinationLabel = isTutorOrInstitute ? 'Seller Hub' : 'Student Portal';
    const destinationPath = isTutorOrInstitute ? '/seller/dashboard' : '/profile';

    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 70px)',
          bgcolor: '#f8fafc',
          py: { xs: 4, md: 8 },
          display: 'flex',
          alignItems: 'center',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.08), transparent 75%)',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3.5, sm: 5 },
              borderRadius: 4,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            }}
          >
            {/* Top decorative accent */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: 'linear-gradient(90deg, #2563eb, #10b981)',
              }}
            />

            {/* Pulsing Success Badge */}
            <Box
              sx={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                color: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                border: '2px solid rgba(16, 185, 129, 0.25)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
              }}
            >
              <CheckCircle sx={{ fontSize: 44 }} />
            </Box>

            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#0f172a', fontSize: { xs: '1.5rem', sm: '1.9rem' } }}>
              Welcome to EduMart! 🎉
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Your <strong>{ROLE_CONFIG[registeredUser.role]?.title || 'EduMart'}</strong> account for{' '}
              <strong>{registeredUser.firstName} {registeredUser.lastName}</strong> has been registered.
            </Typography>

            {/* Email Verification Banner */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#f0fdf4',
                borderColor: '#bbf7d0',
                textAlign: 'left',
                mb: 3,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <MarkEmailReadIcon color="success" sx={{ fontSize: 26, mt: 0.2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                    Verification Link Dispatched
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: '#166534', wordBreak: 'break-all' }}>
                    We've emailed an activation link to <strong>{registeredUser.email}</strong>.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    Please check your inbox (and spam/promotions) to activate your account and access full publishing or download features.
                  </Typography>

                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      disabled={resendingVerification}
                      onClick={handleResendVerification}
                      sx={{ textTransform: 'none', fontWeight: 600, p: 0, minWidth: 'auto' }}
                    >
                      {resendingVerification ? 'Resending verification email...' : "Didn't receive email? Resend link"}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Paper>

            {/* Live Auto-Redirect Countdown Bar */}
            <Box sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <TimerIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Redirecting to your <strong>{destinationLabel}</strong> in{' '}
                  <strong style={{ color: '#2563eb' }}>{countdown}</strong> seconds...
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={((5 - countdown) / 5) * 100}
                sx={{ height: 4, borderRadius: 2, mt: 1.5 }}
              />
            </Box>

            {/* Action Navigation Buttons */}
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleImmediateRedirect(destinationPath)}
                sx={{ py: 1.3, fontWeight: 700, borderRadius: 2 }}
              >
                Go to {destinationLabel} Now
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                fullWidth
                onClick={() => handleImmediateRedirect('/products')}
                sx={{ py: 1.2, fontWeight: 600, borderRadius: 2 }}
              >
                Explore Educational Materials
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 70px)',
        bgcolor: '#f8fafc',
        py: { xs: 3, md: 6 },
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.07), transparent 75%)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ alignItems: 'stretch', justifyContent: 'center' }}>
          {/* Left Column: Visual Brand & Value Props (Desktop Width Enhancement) */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Paper
              elevation={0}
              sx={{
                p: 4.5,
                width: '100%',
                borderRadius: 4,
                background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: 'primary.main',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                    }}
                  >
                    <SchoolIcon />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                    EduMart
                  </Typography>
                </Stack>

                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.25, mb: 2 }}>
                  Empowering Sri Lanka's Education Journey
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.75)', mb: 4, lineHeight: 1.6 }}>
                  Whether you are an A/L student tackling mechanics and past papers, or an experienced tutor
                  reaching thousands of learners, EduMart provides the platform you need.
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', mb: 2 }}>
                  What You Get with {currentRole.title}:
                </Typography>
                <Stack spacing={2} sx={{ mb: 4 }}>
                  {currentRole.features.map((feat, idx) => (
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" key={idx}>
                      <CheckCircle sx={{ color: '#34d399', fontSize: 20, mt: 0.3 }} />
                      <Typography variant="body2" sx={{ color: '#e2e8f0', lineHeight: 1.5 }}>
                        {feat}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              {/* Student Review Testimonial */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} sx={{ fontSize: 16, color: '#f59e0b' }} />
                  ))}
                </Stack>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontStyle: 'italic', display: 'block', mb: 1.5 }}>
                  "EduMart made finding A/L Physics past papers and verified answers effortless. Instant download
                  right after paying with my card!"
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6', fontSize: '0.8rem', fontWeight: 700 }}>
                    K
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 700, display: 'block' }}>
                      Kavindu Perera
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      A/L Physical Science Candidate
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Multi-Step Registration Form Card (Section-Wise UI) */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                bgcolor: '#ffffff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Card Header & Stepper */}
              <Box
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  pb: 2,
                  borderBottom: '1px solid #f1f5f9',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      Join EduMart
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Section {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}
                    </Typography>
                  </Box>
                  <Chip
                    label={currentRole.title}
                    color={role === 'tutor' ? 'secondary' : 'primary'}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                {/* Section-Wise Stepper UI */}
                <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 1 }}>
                  {STEPS.map((label, index) => (
                    <Step key={label} completed={activeStep > index}>
                      <StepLabel
                        onClick={() => {
                          if (index < activeStep) setActiveStep(index);
                        }}
                        sx={{
                          cursor: index < activeStep ? 'pointer' : 'default',
                          '& .MuiStepLabel-label': {
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            fontWeight: activeStep === index ? 700 : 500,
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <CardContent sx={{ p: { xs: 2.5, sm: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ flexGrow: 1 }}>
                  {/* =========================================================================
                      SECTION 1: Role Selection & Personal Information
                  ========================================================================= */}
                  <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Step 1: Choose Your Learning Path
                    </Typography>

                    {/* Role Selection Tabs */}
                    <Paper
                      variant="outlined"
                      sx={{
                        borderRadius: 2.5,
                        p: 0.5,
                        bgcolor: '#f8fafc',
                        borderColor: '#e2e8f0',
                        mb: 2.5,
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
                          '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5 },
                          '& .MuiTab-root': {
                            minHeight: 44,
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            textTransform: 'none',
                            py: 1,
                            '&.Mui-selected': { color: 'primary.main', fontWeight: 700 },
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

                    {/* Personal Details Fields */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          required
                          fullWidth
                          id="firstName"
                          label="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonOutlinedIcon fontSize="small" color="action" />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          required
                          fullWidth
                          id="lastName"
                          label="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          required
                          fullWidth
                          id="email"
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          id="phone"
                          label="Phone Number"
                          placeholder="+94 77 123 4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneOutlinedIcon fontSize="small" color="action" />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          id="institution"
                          label="School / University / Institute"
                          placeholder="e.g. Ananda College"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AccountBalanceIcon fontSize="small" color="action" />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* =========================================================================
                      SECTION 2: Security & Password Setup
                  ========================================================================= */}
                  <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Step 2: Secure Your Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      Choose a strong password to protect your study materials and purchase records.
                    </Typography>

                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          required
                          fullWidth
                          name="password"
                          label="Password (min 8 characters)"
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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

                        {/* Interactive Password Strength Bar & Checklist */}
                        {password && (
                          <Box sx={{ mt: 1.5, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Password Strength:
                              </Typography>
                              <Typography variant="caption" color={`${pwdStrength.color}.main`} fontWeight={700}>
                                {pwdStrength.label}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={pwdStrength.score}
                              color={pwdStrength.color}
                              sx={{ height: 6, borderRadius: 3, mb: 1.5 }}
                            />

                            <Stack spacing={0.8}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {criteria.hasLength ? (
                                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                                ) : (
                                  <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.disabled' }} />
                                )}
                                <Typography variant="caption" sx={{ color: criteria.hasLength ? 'success.main' : 'text.secondary' }}>
                                  Minimum 8 characters
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {criteria.hasUpper ? (
                                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                                ) : (
                                  <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.disabled' }} />
                                )}
                                <Typography variant="caption" sx={{ color: criteria.hasUpper ? 'success.main' : 'text.secondary' }}>
                                  Contains at least one uppercase letter (A-Z)
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {criteria.hasNumber || criteria.hasSpecial ? (
                                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                                ) : (
                                  <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.disabled' }} />
                                )}
                                <Typography variant="caption" sx={{ color: criteria.hasNumber || criteria.hasSpecial ? 'success.main' : 'text.secondary' }}>
                                  Contains a number (0-9) or special symbol
                                </Typography>
                              </Stack>
                            </Stack>
                          </Box>
                        )}
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          required
                          fullWidth
                          name="confirmPassword"
                          label="Confirm Password"
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
                      </Grid>
                    </Grid>
                  </Box>

                  {/* =========================================================================
                      SECTION 3: Review Details & GDPR Confirmation
                  ========================================================================= */}
                  <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Step 3: Review & Confirm Registration
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Verify your account details below. Click 'Edit' on any card to make quick changes before confirming.
                      </Typography>
                    </Box>

                    <Stack spacing={2} sx={{ mb: 3 }}>
                      {/* Card 1: Account Role & Permissions */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#eff6ff', color: 'primary.main' }}>
                              {role === 'tutor' ? <MenuBookIcon fontSize="small" /> : role === 'institute' ? <AccountBalanceIcon fontSize="small" /> : <SchoolIcon fontSize="small" />}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700}>
                                Account Type & Permissions
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Determines catalog purchasing & publishing capabilities
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                            onClick={() => setActiveStep(0)}
                            sx={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'none' }}
                          >
                            Edit
                          </Button>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={currentRole.title}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {currentRole.summary}
                          </Typography>
                        </Box>
                      </Paper>

                      {/* Card 2: Personal Profile & Affiliation */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>
                              {firstName ? firstName[0].toUpperCase() : 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700}>
                                Personal & Academic Profile
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Profile details shown on orders and publications
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                            onClick={() => setActiveStep(0)}
                            sx={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'none' }}
                          >
                            Edit
                          </Button>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary">Full Name</Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {firstName} {lastName}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary">Email Address</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                                {email}
                              </Typography>
                              <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary">Phone Contact</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {phone ? phone : 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary">School / Educational Institute</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {institution ? institution : 'General / Independent Student'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Card 3: Security & Credentials */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#ecfdf5', color: '#059669' }}>
                              <ShieldOutlinedIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700}>
                                Account Security & Password
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Password integrity and encryption protection
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                            onClick={() => setActiveStep(1)}
                            sx={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'none' }}
                          >
                            Edit
                          </Button>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary">Password Status</Typography>
                            <Typography variant="body2" fontWeight={700}>
                              •••••••••••• (Encrypted)
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary">Password Strength</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                              <Chip
                                label={`${pwdStrength.label} (${pwdStrength.score}%)`}
                                color={pwdStrength.color}
                                size="small"
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700 }}
                              />
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary">Security Standard</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Protected with Bcrypt 12-round salted hashing & active session management
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Card 4: Terms, Privacy & GDPR Consent */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: 'rgba(37,99,235,0.03)',
                          borderColor: 'rgba(37,99,235,0.18)',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={agreedTerms}
                              onChange={(e) => setAgreedTerms(e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b' }}>
                              I accept EduMart's Terms of Service and acknowledge the GDPR Data Protection & Privacy Policy.
                            </Typography>
                          }
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 4, lineHeight: 1.5 }}>
                          You retain full ownership of your personal data and study purchases. Device sessions can be inspected and revoked at any time from your security profile.
                        </Typography>
                      </Paper>
                    </Stack>
                  </Box>

                  {/* Section-Wise Navigation Controls (Next / Back / Submit) */}
                  <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                      {activeStep > 0 ? (
                        <Button
                          variant="outlined"
                          onClick={handleBack}
                          startIcon={<ArrowBackIcon />}
                          sx={{ fontWeight: 600, px: 2.5 }}
                        >
                          Back
                        </Button>
                      ) : (
                        <Box />
                      )}

                      {activeStep < STEPS.length - 1 ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleNext}
                          endIcon={<ArrowForwardIcon />}
                          sx={{ fontWeight: 700, px: 3.5, py: 1.2 }}
                        >
                          {activeStep === 0 ? 'Next: Security & Password' : 'Next: Review & Confirm'}
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading || !agreedTerms}
                          sx={{
                            fontWeight: 700,
                            px: 4,
                            py: 1.3,
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                          }}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : currentRole.cta}
                        </Button>
                      )}
                    </Stack>
                  </Box>

                  {/* Sign In Link */}
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
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
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Register;
