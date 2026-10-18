import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DevicesIcon from '@mui/icons-material/Devices';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const Profile = () => {
  const {
    user,
    updateProfile,
    changePassword,
    resendVerification,
    refreshProfile,
    getUserSessions,
    revokeOtherSessions,
    exportUserData,
    deleteAccount
  } = useAuth();
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
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);

  // Data Privacy & Deactivation State
  const [exportingData, setExportingData] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

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

  const fetchSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const res = await getUserSessions();
      setSessions(res?.sessions || []);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to load active sessions.', { variant: 'error' });
    } finally {
      setLoadingSessions(false);
    }
  }, [enqueueSnackbar, getUserSessions]);

  useEffect(() => {
    if (activeTab === 2) {
      fetchSessions();
    }
  }, [activeTab, fetchSessions]);

  const handleRevokeSessions = async () => {
    try {
      setRevokingSessions(true);
      const res = await revokeOtherSessions();
      enqueueSnackbar(res?.message || 'Logged out from all other devices.', { variant: 'success' });
      await fetchSessions();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to revoke other sessions.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setRevokingSessions(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportingData(true);
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `edumart-my-data-${user?.id || user?._id || 'export'}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      enqueueSnackbar('Personal data downloaded successfully.', { variant: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to export personal data.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      enqueueSnackbar('Please enter your password to confirm.', { variant: 'error' });
      return;
    }
    try {
      setDeletingAccount(true);
      await deleteAccount(deletePassword);
      enqueueSnackbar('Your account has been deactivated.', { variant: 'info' });
      setDeleteDialogOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to deactivate account. Incorrect password?';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setDeletingAccount(false);
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
          Your email address ({user.email}) is not verified yet. Please check your email inbox and click the verification link we sent you.
        </Alert>
      )}

      {/* Header Profile Card */}
      <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid>
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
            <Grid size={{ xs: true }}>
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
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="Personal Details" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Security & Password" />
            <Tab icon={<DevicesIcon />} iconPosition="start" label="Active Sessions" />
            <Tab icon={<PrivacyTipIcon />} iconPosition="start" label="Privacy & GDPR" />
            <Tab icon={<InfoIcon />} iconPosition="start" label="Account Overview" />
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneOutlinedIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="School / University / Institute"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessOutlinedIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
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
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    type={showCurrentPass ? 'text' : 'password'}
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle current password visibility"
                              onClick={() => setShowCurrentPass(!showCurrentPass)}
                              edge="end"
                              size="small"
                            >
                              {showCurrentPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    type={showNewPass ? 'text' : 'password'}
                    label="New Password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle new password visibility"
                              onClick={() => setShowNewPass(!showNewPass)}
                              edge="end"
                              size="small"
                            >
                              {showNewPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    type={showConfirmPass ? 'text' : 'password'}
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm new password visibility"
                              onClick={() => setShowConfirmPass(!showConfirmPass)}
                              edge="end"
                              size="small"
                            >
                              {showConfirmPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
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

          {/* Tab 2: Active Sessions */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Active Login Sessions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review and manage all devices and browsers currently logged into your account.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<DevicesIcon />}
                  disabled={revokingSessions || sessions.length <= 1}
                  onClick={handleRevokeSessions}
                >
                  {revokingSessions ? <CircularProgress size={20} color="inherit" /> : 'Log Out Other Devices'}
                </Button>
              </Box>

              {loadingSessions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Device / Client</strong></TableCell>
                        <TableCell><strong>IP Address</strong></TableCell>
                        <TableCell><strong>Started</strong></TableCell>
                        <TableCell><strong>Expires</strong></TableCell>
                        <TableCell align="right"><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            No active sessions found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sessions.map((sess) => (
                          <TableRow key={sess.id} sx={{ bgcolor: sess.is_current ? 'action.hover' : 'inherit' }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={sess.is_current ? 'bold' : 'normal'}>
                                {sess.device_info || 'Web Browser'}
                              </Typography>
                            </TableCell>
                            <TableCell>{sess.ip_address || '127.0.0.1'}</TableCell>
                            <TableCell>{sess.created_at ? new Date(sess.created_at).toLocaleString() : 'N/A'}</TableCell>
                            <TableCell>{sess.expires_at ? new Date(sess.expires_at).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell align="right">
                              {sess.is_current ? (
                                <Chip label="Current Session" color="success" size="small" />
                              ) : (
                                <Chip label="Active" color="default" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Tab 3: Privacy & GDPR */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Data Privacy & GDPR Rights
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                EduMart adheres to international data protection principles. You retain full control over your personal data and account lifecycle.
              </Typography>

              {/* Data Portability */}
              <Card variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ maxWidth: 500 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Right to Data Portability (GDPR Art. 20)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Download a complete copy of your personal data, including your profile information, order history, active sessions, and notifications in standard JSON format.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportData}
                    disabled={exportingData}
                  >
                    {exportingData ? <CircularProgress size={20} color="inherit" /> : 'Download My Data (JSON)'}
                  </Button>
                </Box>
              </Card>

              {/* Account Deactivation */}
              <Card variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: 'error.light' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ maxWidth: 500 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                      Deactivate Account (Right to Erasure)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Deactivating your account will instantly log you out, revoke all active sessions, and disable your profile. You may contact support if you ever wish to reactivate.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Deactivate Account
                  </Button>
                </Box>
              </Card>

              {/* Confirmation Dialog for Deactivation */}
              <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
              >
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  Deactivate Your Account?
                </DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{ mb: 2 }}>
                    This action will immediately terminate all active sessions and disable your access to EduMart. To confirm this security action, please enter your current account password.
                  </DialogContentText>
                  <TextField
                    autoFocus
                    fullWidth
                    type="password"
                    label="Account Password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    margin="dense"
                  />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                  <Button onClick={() => setDeleteDialogOpen(false)} disabled={deletingAccount}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    color="error"
                    variant="contained"
                    disabled={deletingAccount || !deletePassword}
                  >
                    {deletingAccount ? <CircularProgress size={20} color="inherit" /> : 'Confirm Deactivation'}
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}

          {/* Tab 4: Account Overview */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account Overview
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Registered Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user?.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Account Role
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user?.role?.toUpperCase()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Account Status
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color={user?.isVerified ? 'success.main' : 'warning.main'}>
                      {user?.isVerified ? 'Email Verified' : 'Pending Verification'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {user?._id || user?.id}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Joined Date
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Last Login
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Current Session'}
                    </Typography>
                  </Box>
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