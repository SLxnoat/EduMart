import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  Chip,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const Profile = () => {
  const { user, updateProfile, changePassword, resendVerification, refreshProfile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0);

  // Personal Info Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setInstitution(user.institution || '');
    }
  }, [user]);

  const handleResendVerification = async () => {
    if (!resendVerification) return;
    try {
      setResendingEmail(true);
      const res = await resendVerification(user?.email);
      enqueueSnackbar(res.message || 'Verification email sent! Please check your inbox.', { variant: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend verification email.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfile({
        firstName,
        lastName,
        phone,
        institution
      });
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');

    if (!currentPassword || !newPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      setChangingPass(true);
      await changePassword({ currentPassword, newPassword });
      enqueueSnackbar('Password changed successfully!', { variant: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Please check your current password.';
      setPassError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setChangingPass(false);
    }
  };

  const completionScore = user?.profileCompletion || 60;

  const missingTips = [];
  if (!user?.isVerified) missingTips.push('Verify your email (+20%)');
  if (!user?.phone) missingTips.push('Add your phone number (+10%)');
  if (!user?.institution) missingTips.push('Add your school or institution (+10%)');

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Unverified Email Banner with Resend Action */}
      {user && !user.isVerified && (
        <Alert
          severity="warning"
          sx={{ mb: 3, alignItems: 'center' }}
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              disabled={resendingEmail}
              onClick={handleResendVerification}
            >
              {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          }
        >
          Your email address ({user.email}) is not verified yet. Verify your email to unlock full account features and boost your profile score.
        </Alert>
      )}

      {/* Header Profile Card */}
      <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: 32,
                  fontWeight: 'bold'
                }}
              >
                {user?.firstName?.[0] || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                <Typography variant="h5" fontWeight="bold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Chip
                  label={user?.role?.toUpperCase() || 'STUDENT'}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                {user?.isVerified ? (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Verified"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    icon={<WarningAmberIcon />}
                    label="Unverified Email"
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user?.email} {user?.institution ? `• ${user?.institution}` : ''}
              </Typography>

              {/* Profile Completion Meter */}
              <Box sx={{ mt: 2, maxWidth: 440 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Profile Completeness
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color="primary">
                    {completionScore}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionScore}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                {missingTips.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                    Next steps: {missingTips.join(' • ')}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="Personal Details" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Security & Password" />
            <Tab icon={<InfoIcon />} iconPosition="start" label="Account Information" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Tab 0: Personal Details */}
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleUpdateProfile}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Personal Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update your personal contact details and educational affiliation.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="School / University / Institute"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={savingProfile}
                  sx={{ px: 4 }}
                >
                  {savingProfile ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 1: Security & Password */}
          {activeTab === 1 && (
            <Box component="form" onSubmit={handleChangePassword}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ensure your account is using a long, random password to stay secure.
              </Typography>

              {passError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passError}
                </Alert>
              )}

              <Grid container spacing={2} maxWidth="sm">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    type="password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    type="password"
                    label="New Password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    type="password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={changingPass}
                  sx={{ px: 4 }}
                >
                  {changingPass ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 2: Account Information */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account Overview
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Registered Email
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Account Role
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.role?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Account Status
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color={user?.isVerified ? 'success.main' : 'warning.main'}>
                    {user?.isVerified ? 'Email Verified' : 'Pending Verification'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {user?._id || user?.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Joined Date
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Last Login
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Current Session'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;