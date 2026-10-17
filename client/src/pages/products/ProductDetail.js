import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Stack,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useSnackbar } from 'notistack';
import productService from '../../services/productService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        if (data && data.product) {
          setProduct(data.product);
        } else if (data && data.id) {
          setProduct(data);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        setError(err.response?.data?.message || 'Could not load the requested product details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    try {
      const raw = localStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : [];
      const idx = cart.findIndex((i) => i.id === product.id);
      if (idx > -1) {
        cart[idx].quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: parseFloat(product.price),
          format: product.format,
          subject: product.subject,
          grade_level: product.grade_level,
          quantity
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      enqueueSnackbar(`Added ${quantity} × "${product.title}" to cart!`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Could not add item to cart', { variant: 'error' });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const formatPrice = (price) => {
    return `LKR ${parseFloat(price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, textAlign: 'center', py: 8 }}>
        <CircularProgress size={50} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading resource details...
        </Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ mt: 12, mb: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Product not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/products"
        >
          Back to Catalog
        </Button>
      </Container>
    );
  }

  const subtotal = parseFloat(product.price || 0) * quantity;

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 8 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Home
          </Link>
          <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
            Catalog
          </Link>
          <Typography color="text.primary" sx={{ maxWidth: 350 }} noWrap>
            {product.title}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        component={Link}
        to="/products"
        size="small"
        sx={{ mb: 3 }}
      >
        Back to Catalog
      </Button>

      <Grid container spacing={4}>
        {/* Left Column: Details & Overview */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mb: 3 }}>
            {/* Top Badges */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip label={product.subject} color="primary" sx={{ fontWeight: 'bold' }} />
              <Chip label={product.grade_level} variant="outlined" />
              {product.product_type && (
                <Chip
                  label={product.product_type.replace('_', ' ').toUpperCase()}
                  color="info"
                  variant="outlined"
                />
              )}
              {product.format === 'digital' ? (
                <Chip icon={<CloudDownloadIcon />} label="Instant Digital Download" color="success" />
              ) : product.format === 'physical' ? (
                <Chip icon={<LocalShippingIcon />} label="Courier Delivery" color="secondary" />
              ) : (
                <Chip icon={<AssignmentIcon />} label="Digital + Physical Pack" color="success" />
              )}
            </Box>

            {/* Product Title */}
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.3 }}>
              {product.title}
            </Typography>

            {/* Seller & Exam Year */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', my: 2, color: 'text.secondary' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <SchoolIcon fontSize="small" color="primary" />
                <Typography variant="body2">
                  Published by: <strong>{product.seller ? `${product.seller.first_name} ${product.seller.last_name}` : 'Verified Tutor'}</strong>
                  {product.seller?.institution ? ` (${product.seller.institution})` : ''}
                </Typography>
              </Box>
              {product.exam_year && (
                <Typography variant="body2">
                  Target Exam: <strong>{product.exam_year}</strong>
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Detailed Description */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Description & Syllabus Coverage
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'text.secondary', lineHeight: 1.7, mb: 4 }}>
              {product.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Specification Grid */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Material Specifications
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Subject</Typography>
                <Typography variant="body2" fontWeight="bold">{product.subject}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Grade / Standard</Typography>
                <Typography variant="body2" fontWeight="bold">{product.grade_level}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Delivery Format</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{product.format}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Typography variant="body2" fontWeight="bold">{product.category?.name || 'General'}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Examination Year</Typography>
                <Typography variant="body2" fontWeight="bold">{product.exam_year || 'National Curriculum'}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Access</Typography>
                <Typography variant="body2" fontWeight="bold">Lifetime Access</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Quality Guarantee Card */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: '#fbfcfd' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <VerifiedUserIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                EduMart Quality Guarantee
              </Typography>
            </Box>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="body2">Reviewed and aligned with the National Department of Examinations guidelines.</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="body2">Instant downloadable PDF format immediately accessible after order completion.</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="body2">Protected watermarked copies supporting teacher copyright and content integrity.</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column: Pricing & Purchase Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3.5,
              borderRadius: 2,
              position: 'sticky',
              top: 100
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Unit Price
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
              {formatPrice(product.price)}
            </Typography>

            <Box sx={{ my: 2 }}>
              {product.format === 'digital' ? (
                <Chip
                  icon={<CloudDownloadIcon />}
                  label="Instant Digital PDF Delivery"
                  color="success"
                  variant="outlined"
                  size="small"
                  sx={{ width: '100%', py: 1 }}
                />
              ) : (
                <Chip
                  icon={<LocalShippingIcon />}
                  label="Standard Islandwide Delivery"
                  color="secondary"
                  variant="outlined"
                  size="small"
                  sx={{ width: '100%', py: 1 }}
                />
              )}
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {/* Quantity Selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Quantity
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="decrease quantity"
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Paper
                  variant="outlined"
                  sx={{
                    px: 3,
                    py: 0.75,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textAlign: 'center',
                    minWidth: 48
                  }}
                >
                  {quantity}
                </Paper>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                  aria-label="increase quantity"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Subtotal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Total Amount:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {formatPrice(subtotal)}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                sx={{ py: 1.25, fontWeight: 'bold' }}
              >
                Add to Cart
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                startIcon={<FlashOnIcon />}
                onClick={handleBuyNow}
                sx={{ py: 1.25, fontWeight: 'bold' }}
              >
                Buy Now
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              Secure checkout guaranteed with Stripe & verified banking methods.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;