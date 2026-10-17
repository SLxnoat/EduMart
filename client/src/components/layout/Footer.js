import React from 'react';
import { Box, Typography, Container, Grid, Link, Stack, Divider, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0f172a',
        color: '#94a3b8',
        pt: 6,
        pb: 4,
        mt: 'auto',
        borderTop: '1px solid #1e293b',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, color: '#ffffff' }}>
              <SchoolIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                EduMart
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 2, color: '#cbd5e1' }}>
              Sri Lanka's dedicated educational marketplace. Empowering students, tutors, and institutes
              with high-quality study materials, exam past papers, and instant digital downloads.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<LockOutlinedIcon sx={{ '&&': { color: '#38bdf8', fontSize: 16 } }} />}
                label="SSL Secure"
                size="small"
                sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 600 }}
              />
              <Chip
                icon={<VerifiedIcon sx={{ '&&': { color: '#34d399', fontSize: 16 } }} />}
                label="Verified Tutors"
                size="small"
                sx={{ bgcolor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', fontWeight: 600 }}
              />
            </Stack>
          </Grid>

          {/* Quick Links: Catalog */}
          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, textTransform: 'uppercase' }}>
              Explore Catalog
            </Typography>
            <Stack spacing={1.2}>
              <Link component="button" onClick={() => navigate('/products?search=Past%20Paper')} sx={{ color: '#94a3b8', textAlign: 'left', '&:hover': { color: '#ffffff' } }}>
                G.C.E. A/L Past Papers
              </Link>
              <Link component="button" onClick={() => navigate('/products?search=Model%20Paper')} sx={{ color: '#94a3b8', textAlign: 'left', '&:hover': { color: '#ffffff' } }}>
                Model Examination Papers
              </Link>
              <Link component="button" onClick={() => navigate('/products?search=Revision')} sx={{ color: '#94a3b8', textAlign: 'left', '&:hover': { color: '#ffffff' } }}>
                Revision Notes & Summaries
              </Link>
              <Link component="button" onClick={() => navigate('/products?format=digital')} sx={{ color: '#94a3b8', textAlign: 'left', '&:hover': { color: '#ffffff' } }}>
                Instant Digital PDFs
              </Link>
              <Link component="button" onClick={() => navigate('/products?format=physical')} sx={{ color: '#94a3b8', textAlign: 'left', '&:hover': { color: '#ffffff' } }}>
                Printed Study Packs
              </Link>
            </Stack>
          </Grid>

          {/* Quick Links: For Users */}
          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, textTransform: 'uppercase' }}>
              Students & Tutors
            </Typography>
            <Stack spacing={1.2}>
              <Link component="button" onClick={() => navigate('/cart')} sx={{ color: '#94a3b8', textAlign: 'left', '&:hover': { color: '#ffffff' } }}>
                Shopping Cart
              </Link>
              <Link component="button" onClick={() => navigate('/orders')} sx={{ color: '#94a3b8', textAlign: 'left', '&:hover': { color: '#ffffff' } }}>
                My Orders & Downloads
              </Link>
              <Link component="button" onClick={() => navigate('/register')} sx={{ color: '#94a3b8', textAlign: 'left', '&:hover': { color: '#ffffff' } }}>
                Join as a Tutor / Institute
              </Link>
              <Link component="button" onClick={() => navigate('/profile')} sx={{ color: '#94a3b8', textAlign: 'left', '&:hover': { color: '#ffffff' } }}>
                Account & Privacy
              </Link>
            </Stack>
          </Grid>

          {/* Support & Assistant */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, textTransform: 'uppercase' }}>
              Need Help?
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 2 }}>
              Have questions about your order, tracking, or downloads? Chat with our 24/7 AI Assistant
              via the blue chat bubble at the bottom right.
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              Accepted Payments: Stripe (Visa, MasterCard, Amex) & Direct Bank Simulation.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#1e293b' }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            &copy; {new Date().getFullYear()} EduMart E-Commerce Platform. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Designed for Sri Lankan Education System • G.C.E. O/L & A/L Curricula
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;