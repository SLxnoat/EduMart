import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  const { user, verifyEmail, resendVerification } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (user?.email) {
      setResendEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('No verification token provided in URL.');
        return;
      }

      try {
        await verifyEmail(token);
        if (isMounted) {
          setStatus('success');
          enqueueSnackbar('Email verified successfully!', { variant: 'success' });
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.response?.data?.message || 'Verification token is invalid or has expired.');
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail, enqueueSnackbar]);

  const handleResend = async () => {
    if (!resendEmail && !user?.email) {
      enqueueSnackbar('Please enter your email address to resend verification.', { variant: 'warning' });
      return;
    }
    try {
      setResending(true);
      const res = await resendVerification(resendEmail || user?.email);
      enqueueSnackbar(res.message || 'Verification email sent!', { variant: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not resend verification email.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Card elevation={3} sx={{ borderRadius: 2, textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          {status === 'verifying' && (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">
                Verifying Your Email...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please wait while we confirm your email credentials.
              </Typography>
            </Box>
          )}

          {status === 'success' && (
            <Box sx={{ py: 2 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Email Verified!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your email address has been successfully verified. You now have full access to study materials, uploads, and purchases.
              </Typography>
              {user ? (
                <Button component={Link} to="/profile" variant="contained" fullWidth size="large">
                  Go to My Profile
                </Button>
              ) : (
                <Button component={Link} to="/login" variant="contained" fullWidth size="large">
                  Sign In to Your Account
                </Button>
              )}
            </Box>
          )}

          {status === 'error' && (
            <Box sx={{ py: 2 }}>
              <ErrorIcon color="error" sx={{ fontSize: 64, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Verification Failed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {errorMessage}
              </Typography>
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
                sx={{ mb: 1.5 }}
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              <Button component={Link} to="/login" variant="contained" fullWidth sx={{ mb: 1 }}>
                Back to Sign In
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default VerifyEmail;
