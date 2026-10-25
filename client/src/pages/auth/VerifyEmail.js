import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField,
  Divider,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import KeyIcon from '@mui/icons-material/Key';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const urlStatus = searchParams.get('status');
  const urlVerified = searchParams.get('verified');
  const urlAlready = searchParams.get('already');
  const urlMessage = searchParams.get('message');

  const { user, verifyEmail, resendVerification } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Initial state based on query params or user state
  const isAlreadyVerified = Boolean(
    user?.isVerified ||
    user?.is_verified ||
    urlStatus === 'success' ||
    urlVerified === 'true' ||
    urlAlready === 'true'
  );

  const [status, setStatus] = useState(
    isAlreadyVerified ? 'success' : token ? 'verifying' : 'input'
  ); // 'verifying', 'success', 'error', 'input'
  const [errorMessage, setErrorMessage] = useState(urlMessage || '');
  const [manualToken, setManualToken] = useState(token || '');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [resendEmail, setResendEmail] = useState(user?.email || '');
  const [resending, setResending] = useState(false);

  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (user?.email && !resendEmail) {
      setResendEmail(user.email);
    }
    if (user?.isVerified || user?.is_verified) {
      setStatus('success');
    }
  }, [user, resendEmail]);

  useEffect(() => {
    // If URL indicates explicit success/already verified
    if (urlStatus === 'success' || urlVerified === 'true' || urlAlready === 'true') {
      setStatus('success');
      return;
    }

    // If URL indicates explicit error
    if (urlStatus === 'error') {
      setStatus('error');
      setErrorMessage(urlMessage || 'Verification token is invalid or has expired.');
      return;
    }

    // Auto-verify if token is provided in URL
    if (token && !hasAttemptedRef.current) {
      hasAttemptedRef.current = true;

      const performAutoVerification = async () => {
        try {
          await verifyEmail(token, emailParam || user?.email);
          setStatus('success');
          enqueueSnackbar('Email verified successfully!', { variant: 'success' });
        } catch (err) {
          // If the backend indicates user is already verified, treat as success
          if (err.response?.data?.alreadyVerified || user?.isVerified) {
            setStatus('success');
            return;
          }
          setStatus('error');
          setErrorMessage(err.response?.data?.message || 'Verification token is invalid or has expired.');
        }
      };

      performAutoVerification();
    } else if (!token && !isAlreadyVerified) {
      setStatus('input');
    }
  }, [token, urlStatus, urlVerified, urlAlready, urlMessage, user, verifyEmail, isAlreadyVerified, enqueueSnackbar]);

  const handleManualVerify = async (e) => {
    if (e) e.preventDefault();
    const cleanToken = manualToken.trim();
    if (!cleanToken) {
      enqueueSnackbar('Please paste or enter your verification code/token.', { variant: 'warning' });
      return;
    }

    try {
      setSubmittingManual(true);
      await verifyEmail(cleanToken, user?.email || resendEmail);
      setStatus('success');
      enqueueSnackbar('Email verified successfully!', { variant: 'success' });
    } catch (err) {
      if (err.response?.data?.alreadyVerified || user?.isVerified) {
        setStatus('success');
        return;
      }
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Verification token is invalid or has expired.');
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleResend = async () => {
    const targetEmail = (resendEmail || user?.email || '').trim();
    if (!targetEmail) {
      enqueueSnackbar('Please enter your email address to resend verification.', { variant: 'warning' });
      return;
    }
    try {
      setResending(true);
      const res = await resendVerification(targetEmail);
      enqueueSnackbar(res.message || 'Verification email sent! Please check your inbox.', { variant: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not resend verification email.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', height: 6 }} />
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* STATE 1: VERIFYING IN PROGRESS */}
          {status === 'verifying' && (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={52} sx={{ mb: 2 }} />
              <Typography variant="h5" fontWeight="bold">
                Verifying Your Email...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please wait while we confirm your email credentials.
              </Typography>
            </Box>
          )}

          {/* STATE 2: SUCCESS */}
          {status === 'success' && (
            <Box sx={{ py: 2 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 68, mb: 1.5 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your email address has been successfully verified. You now have full access to study materials, uploads, and purchases.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {user ? (
                  <Button component={Link} to="/profile" variant="contained" fullWidth size="large">
                    Go to My Profile
                  </Button>
                ) : (
                  <Button component={Link} to="/login" variant="contained" fullWidth size="large">
                    Sign In to Your Account
                  </Button>
                )}
                <Button component={Link} to="/products" variant="outlined" fullWidth size="large">
                  Browse Educational Materials
                </Button>
              </Box>
            </Box>
          )}

          {/* STATE 3: MANUAL INPUT OR ERROR */}
          {(status === 'error' || status === 'input') && (
            <Box sx={{ py: 1 }}>
              {status === 'error' ? (
                <>
                  <ErrorIcon color="error" sx={{ fontSize: 56, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold" color="error.main" gutterBottom>
                    Verification Issue
                  </Typography>
                  <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                    {errorMessage || 'Verification token is invalid or has expired.'}
                  </Alert>
                </>
              ) : (
                <>
                  <MarkEmailReadIcon color="primary" sx={{ fontSize: 56, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Verify Your Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please enter the verification code or token sent to your email address below.
                  </Typography>
                </>
              )}

              {/* Enter token manually form */}
              <Box component="form" onSubmit={handleManualVerify} sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <KeyIcon fontSize="small" color="primary" /> Paste Verification Code / Token:
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Paste token or code here..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  size="small"
                  sx={{ mb: 1.5 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={submittingManual || !manualToken.trim()}
                >
                  {submittingManual ? 'Verifying...' : 'Verify Token'}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  OR RESEND VERIFICATION EMAIL
                </Typography>
              </Divider>

              {/* Resend email section */}
              <Box sx={{ textAlign: 'left', mb: 2 }}>
                {!user?.email && (
                  <TextField
                    size="small"
                    fullWidth
                    type="email"
                    label="Your Email Address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    sx={{ mb: 1.5 }}
                  />
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={resending}
                  onClick={handleResend}
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </Box>

              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                <Button component={Link} to={user ? "/profile" : "/login"} variant="text" size="small">
                  {user ? "Back to My Profile" : "Back to Sign In"}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default VerifyEmail;
