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
  Stepper,
  Step,
  StepLabel,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  RadioButtonUnchecked,
  Star as StarIcon,
} from '@mui/icons-material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

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

  const currentRole = ROLE_CONFIG[role] || ROLE_CONFIG.student;

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
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Step 3: Review & Confirm Registration
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3, bgcolor: '#f8fafc' }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Account Role</Typography>
                          <Typography variant="body2" fontWeight={700} color="primary.main">
                            {currentRole.title}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Full Name</Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {firstName} {lastName}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 0.5 }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Email Address</Typography>
                          <Typography variant="body2" fontWeight={600}>{email}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Phone / Institution</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {phone || 'Not provided'} • {institution || 'General'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Box sx={{ p: 2, bgcolor: 'rgba(37,99,235,0.04)', borderRadius: 2.5, border: '1px solid rgba(37,99,235,0.12)', mb: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <VerifiedUserOutlinedIcon sx={{ color: 'primary.main', mt: 0.3 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            GDPR Privacy & Data Protection
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                            By creating your account, you agree to EduMart's Terms of Service and Privacy Policy.
                            You retain full control over your active device sessions and personal study data.
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
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
                          disabled={loading}
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
