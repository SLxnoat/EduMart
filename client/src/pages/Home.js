import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  Stack,
  Skeleton,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import productService from '../services/productService';

const CATEGORIES = [
  { name: 'Past Papers', icon: <MenuBookIcon fontSize="large" color="primary" />, query: 'Past Paper' },
  { name: 'Mathematics', icon: <CalculateIcon fontSize="large" color="primary" />, query: 'Mathematics' },
  { name: 'Science', icon: <ScienceIcon fontSize="large" color="primary" />, query: 'Science' },
  { name: 'Commerce', icon: <BusinessCenterIcon fontSize="large" color="primary" />, query: 'Commerce' },
  { name: 'Revision Notes', icon: <SchoolIcon fontSize="large" color="primary" />, query: 'Revision Notes' },
];

const VALUE_PROPS = [
  {
    icon: <FileDownloadOutlinedIcon sx={{ fontSize: 36, color: '#2563eb' }} />,
    title: 'Instant Download',
    desc: 'Access watermarked PDFs, exam packs & digital notes right after payment.',
  },
  {
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 36, color: '#f59e0b' }} />,
    title: 'Island-Wide Delivery',
    desc: 'Tracked courier delivery for printed books and physical study packs.',
  },
  {
    icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 36, color: '#10b981' }} />,
    title: 'Verified Tutors',
    desc: 'Authentic syllabus-aligned materials prepared by certified educators.',
  },
  {
    icon: <LockOutlinedIcon sx={{ fontSize: 36, color: '#6366f1' }} />,
    title: 'Secure Checkout',
    desc: 'PCI-compliant card processing with instant tax invoices and receipts.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getAllProducts({ limit: 4 });
        const list = res.products || res || [];
        setFeaturedProducts(Array.isArray(list) ? list.slice(0, 4) : []);
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          color: '#ffffff',
          pt: { xs: 8, md: 10 },
          pb: { xs: 10, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8} sx={{ mx: 'auto', textAlign: 'center' }}>
              <Chip
                label="Sri Lanka's Premier Learning Material Marketplace"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  fontWeight: 600,
                  mb: 3,
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' },
                  lineHeight: 1.15,
                  mb: 2,
                }}
              >
                Study Smarter with Island-Wide Materials
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  maxWidth: 700,
                  mx: 'auto',
                  fontSize: { xs: '1rem', md: '1.15rem' },
                }}
              >
                Access verified past papers, model answers, revision notes, and tutor-crafted study packs
                with instant digital download or direct courier delivery.
              </Typography>

              {/* Search Bar */}
              <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{
                  p: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  maxWidth: 640,
                  mx: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search by subject, grade, year, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" sx={{ ml: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ ml: 1, flex: 1 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ px: { xs: 2, sm: 3 }, py: 1.2, fontWeight: 700 }}
                >
                  Search
                </Button>
              </Paper>

              {/* Quick Tags */}
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 3 }}
              >
                <Typography variant="body2" sx={{ opacity: 0.85, alignSelf: 'center', mr: 1 }}>
                  Popular:
                </Typography>
                {['A/L Combined Maths', 'A/L Physics', 'O/L Science', 'Accounting', 'Model Papers'].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onClick={() => navigate(`/products?search=${encodeURIComponent(tag)}`)}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                    }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Value Propositions */}
      <Container maxWidth="lg" sx={{ mt: -5, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {VALUE_PROPS.map((prop, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  bgcolor: '#ffffff',
                }}
              >
                <Box sx={{ mb: 1.5 }}>{prop.icon}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {prop.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {prop.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Popular Categories */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              Explore by Category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find study materials specifically tailored to your syllabus
            </Typography>
          </Box>
          <Button variant="text" color="primary" onClick={() => navigate('/products')} sx={{ fontWeight: 600 }}>
            View All Materials &rarr;
          </Button>
        </Box>

        <Grid container spacing={2}>
          {CATEGORIES.map((cat, idx) => (
            <Grid item xs={6} sm={4} md={2.4} key={idx}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: 2,
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(`/products?search=${encodeURIComponent(cat.query)}`)}>
                  <Box sx={{ py: 1.5 }}>{cat.icon}</Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
                    {cat.name}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Study Materials */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              Featured Study Packs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Handpicked and top-rated by students this week
            </Typography>
          </Box>
          <Button variant="outlined" color="primary" onClick={() => navigate('/products')}>
            Browse Full Catalog
          </Button>
        </Box>

        <Grid container spacing={3}>
          {loading ? (
            [1, 2, 3, 4].map((n) => (
              <Grid item xs={12} sm={6} md={3} key={n}>
                <Card sx={{ p: 2, height: 320 }}>
                  <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 2 }} />
                  <Skeleton width="60%" height={24} />
                  <Skeleton width="90%" height={20} />
                  <Skeleton width="40%" height={28} sx={{ mt: 2 }} />
                </Card>
              </Grid>
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardActionArea onClick={() => navigate(`/products/${product.id}`)}>
                    <Box
                      sx={{
                        height: 140,
                        bgcolor: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        p: 2,
                      }}
                    >
                      <MenuBookIcon sx={{ fontSize: 60, color: '#94a3b8' }} />
                      <Chip
                        label={product.format === 'digital' ? 'Digital PDF' : 'Physical Print'}
                        size="small"
                        color={product.format === 'digital' ? 'primary' : 'secondary'}
                        sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 600 }}
                      />
                    </Box>
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        {product.subject || 'Study Pack'} • {product.grade_level || 'General'}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          mt: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: 48,
                        }}
                      >
                        {product.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                        <Rating value={Number(product.rating_average) || 5} precision={0.5} size="small" readOnly />
                        <Typography variant="caption" color="text.secondary">
                          ({product.rating_count || 1})
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>

                  <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                      ${Number(product.price).toFixed(2)}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      View
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No materials currently listed. Check back soon or visit our catalog!
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/products')}>
                  Browse All
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Tutor / Educator Callout Banner */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          <Box sx={{ maxWidth: 640 }}>
            <Chip
              label="For Tutors & Institutes"
              size="small"
              sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 700, mb: 2 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
              Share Your Knowledge & Earn with EduMart
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Publish your exam model papers, video lecture packs, and revision books. Reach thousands
              of motivated students island-wide with automated payout tracking and digital distribution.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ fontWeight: 700, px: 4, py: 1.5 }}
            >
              Start Selling Today
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;