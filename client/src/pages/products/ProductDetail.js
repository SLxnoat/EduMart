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
  CardActions,
  IconButton,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  TextField,
  Avatar
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { useSnackbar } from 'notistack';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Digital Preview Modal States
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Related Products State
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Reviews & Ratings State
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0, breakdown: {} });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
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
          return;
        }

        // Fetch related products
        try {
          const relRes = await productService.getRelatedProducts(id);
          if (relRes && relRes.products) {
            setRelatedProducts(relRes.products);
          }
        } catch {
          // ignore related failure
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        setError(err.response?.data?.message || 'Could not load the requested product details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const revData = await reviewService.getProductReviews(id);
        setReviews(revData.reviews || []);
        if (revData.summary) {
          setReviewSummary(revData.summary);
        }
      } catch (err) {
        // Safe ignore
      } finally {
        setLoadingReviews(false);
      }
    };

    if (id) {
      fetchProductAndRelated();
      fetchReviews();
    }
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!reviewForm.comment.trim()) {
      enqueueSnackbar('Please enter a review comment', { variant: 'warning' });
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.createReview(id, reviewForm);
      enqueueSnackbar('Your review has been submitted successfully!', { variant: 'success' });
      setReviewForm({ rating: 5, title: '', comment: '' });
      const revData = await reviewService.getProductReviews(id);
      setReviews(revData.reviews || []);
      if (revData.summary) {
        setReviewSummary(revData.summary);
      }
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to submit review', { variant: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVoteReview = async (reviewId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await reviewService.voteReview(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpful_votes: res.helpful_votes } : r))
      );
      enqueueSnackbar('Thank you for your feedback!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Could not record vote', { variant: 'error' });
    }
  };

  const handleOpenPreview = async () => {
    setPreviewOpen(true);
    if (!previewData) {
      setLoadingPreview(true);
      try {
        const res = await productService.getProductPreview(id);
        if (res && res.preview) {
          setPreviewData(res.preview);
        }
      } catch (err) {
        console.error('Failed to load preview', err);
      } finally {
        setLoadingPreview(false);
      }
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = async (customProduct = null) => {
    const isEvent = customProduct && (customProduct.nativeEvent || customProduct.preventDefault);
    const candidate = isEvent ? null : customProduct;
    const item = candidate || product || previewData;
    if (!item) return;
    try {
      const itemToCart = {
        id: item.id || item.productId || item.product_id,
        product_id: item.id || item.productId || item.product_id,
        title: item.title,
        price: parseFloat(item.price !== undefined ? item.price : product?.price || 0),
        format: item.format || product?.format || 'digital',
        is_digital: item.is_digital !== undefined ? item.is_digital : (item.format !== 'physical'),
        is_physical: item.is_physical !== undefined ? item.is_physical : (item.format === 'physical' || item.format === 'both'),
        subject: item.subject || product?.subject || 'General Education',
        grade_level: item.grade_level || product?.grade_level || 'All Grades',
      };

      try {
        const raw = localStorage.getItem('cart');
        const cart = raw ? JSON.parse(raw) : [];
        const idx = cart.findIndex((i) => i.id === itemToCart.id);
        if (idx > -1) {
          cart[idx].quantity += quantity;
        } else {
          cart.push({
            id: itemToCart.id,
            title: itemToCart.title,
            price: itemToCart.price,
            format: itemToCart.format,
            subject: itemToCart.subject,
            grade_level: itemToCart.grade_level,
            quantity
          });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
      } catch (_) {}

      addToCart(itemToCart, quantity);

      enqueueSnackbar(`Added ${quantity} × "${itemToCart.title}" to cart!`, { variant: 'success' });
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
        <Grid size={{ xs: 12, md: 8 }}>
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

            {/* Star Rating & Reviews */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Rating
                value={Number(product.rating_average) || 4.8}
                precision={0.5}
                readOnly
              />
              <Typography variant="body2" color="text.secondary">
                <strong>{Number(product.rating_average || 4.8).toFixed(1)}</strong> ({product.rating_count || 15} verified reviews)
              </Typography>
            </Box>

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

            {/* Sample Preview Button Banner */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f4f9fd', borderColor: '#cfe6f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MenuBookIcon color="primary" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                    Curriculum Sample Preview Available
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Review table of contents, sample model solutions & syllabus coverage before purchasing.
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={handleOpenPreview}
              >
                Sample Preview
              </Button>
            </Paper>

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
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Subject</Typography>
                <Typography variant="body2" fontWeight="bold">{product.subject}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Grade / Standard</Typography>
                <Typography variant="body2" fontWeight="bold">{product.grade_level}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Delivery Format</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{product.format}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Typography variant="body2" fontWeight="bold">{product.category?.name || 'General'}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Examination Year</Typography>
                <Typography variant="body2" fontWeight="bold">{product.exam_year || 'National Curriculum'}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Access</Typography>
                <Typography variant="body2" fontWeight="bold">Lifetime Access</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Included Digital Resources & Downloads */}
          {product.digitalAssets && product.digitalAssets.length > 0 && (
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e7ff', bgcolor: '#f8faff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <CloudDownloadIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Included Study Resources & Files
                </Typography>
              </Box>
              <Stack spacing={1.5}>
                {product.digitalAssets.map((asset) => (
                  <Paper
                    key={asset.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2,
                      bgcolor: '#ffffff'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {asset.file_name?.toLowerCase().endsWith('.pdf') ? (
                        <PictureAsPdfIcon color="error" sx={{ fontSize: 32 }} />
                      ) : (
                        <DescriptionIcon color="primary" sx={{ fontSize: 32 }} />
                      )}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {asset.file_name}
                          </Typography>
                          <Chip
                            size="small"
                            label={asset.is_preview ? 'Curriculum Sample' : 'Full Study Resource'}
                            color={asset.is_preview ? 'default' : 'primary'}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {asset.file_size ? `${(asset.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Digital Resource'} •{' '}
                          {asset.is_preview
                            ? 'Publicly accessible sample excerpt'
                            : 'Immediate download upon order completion'}
                        </Typography>
                      </Box>
                    </Box>

                    {asset.is_preview && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<CloudDownloadIcon />}
                        href={productService.getPreviewFileUrl(product.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download Sample
                      </Button>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Paper>
          )}

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
        <Grid size={{ xs: 12, md: 4 }}>
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
                  label={`Islandwide Shipping • ${product.stock_quantity || 50} in stock`}
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

            <Typography variant="caption" color="text.secondary" display="block" align="center">
              Secure checkout guaranteed with Stripe & verified banking methods.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Related Educational Materials Section */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Related Study Materials
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Recommended resources frequently studied alongside this syllabus unit.
          </Typography>

          <Grid container spacing={3}>
            {relatedProducts.map((rel) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={rel.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip size="small" label={rel.subject} color="primary" sx={{ mb: 1 }} />
                    <Typography
                      variant="subtitle2"
                      component={Link}
                      to={`/products/${rel.id}`}
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        textDecoration: 'none',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                        '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                      }}
                    >
                      {rel.title}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {formatPrice(rel.price)}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 1.5, pt: 0 }}>
                    <Button
                      size="small"
                      variant="text"
                      component={Link}
                      to={`/products/${rel.id}`}
                      fullWidth
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Student Reviews & Ratings Section */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Student Reviews & Ratings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verified feedback from students and educators who studied this material.
        </Typography>

        <Grid container spacing={4}>
          {/* Summary Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {reviewSummary.average ? reviewSummary.average.toFixed(1) : Number(product.rating_average || 0).toFixed(1)}
              </Typography>
              <Rating
                value={reviewSummary.average || Number(product.rating_average || 0)}
                precision={0.1}
                readOnly
                sx={{ my: 1 }}
              />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Based on {reviewSummary.count || product.rating_count || 0} student review{(reviewSummary.count || product.rating_count) !== 1 ? 's' : ''}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Rating Bars */}
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewSummary.breakdown?.[stars] || 0;
                const total = reviewSummary.count || 1;
                const percentage = reviewSummary.count > 0 ? (count / total) * 100 : 0;

                return (
                  <Box key={stars} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
                    <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>
                      {stars} star
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ minWidth: 25, textAlign: 'left', color: 'text.secondary' }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Paper>
          </Grid>

          {/* Reviews List & Write Review Form Column */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Write a Review Box */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Share Your Academic Feedback
              </Typography>
              {user ? (
                <Box component="form" onSubmit={handleSubmitReview} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold">Your Rating:</Typography>
                    <Rating
                      value={reviewForm.rating}
                      onChange={(e, val) => setReviewForm({ ...reviewForm, rating: val || 5 })}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    label="Review Headline (optional)"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="e.g. Excellent past paper explanations"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={3}
                    label="Your Detailed Review"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="How did this material assist your study preparation?"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Please log in to your student or educator account to submit a review.
                  </Typography>
                  <Button variant="outlined" size="small" component={Link} to="/login">
                    Sign In
                  </Button>
                </Box>
              )}
            </Paper>

            {/* List of Reviews */}
            {loadingReviews ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : reviews.length === 0 ? (
              <Alert severity="info">
                No reviews yet for this material. Be the first to share your learning experience!
              </Alert>
            ) : (
              <Stack spacing={2}>
                {reviews.map((rev) => (
                  <Paper key={rev.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                          {rev.user?.first_name ? rev.user.first_name[0] : 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {rev.user ? `${rev.user.first_name} ${rev.user.last_name}` : 'Student'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {rev.is_verified_purchase && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important' }} />}
                            label="Verified Purchase"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                      <Rating value={Number(rev.rating)} size="small" readOnly />
                    </Box>

                    {rev.title && (
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1, mb: 0.5 }}>
                        {rev.title}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                      {rev.comment}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ThumbUpIcon fontSize="small" />}
                        color="inherit"
                        onClick={() => handleVoteReview(rev.id)}
                        sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                      >
                        Helpful ({rev.helpful_votes || 0})
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Digital Material Sample Preview Modal Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBookIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Material Sample Preview
            </Typography>
          </Box>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingPreview ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : previewData ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                🔒 This watermarked sample preview allows students to review syllabus coverage before purchasing.
              </Alert>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {previewData.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Subject: {previewData.subject} • Target: {previewData.exam_year || 'National Syllabus'} • Standard: {previewData.grade_level}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Table of Contents & Curriculum Structure:
              </Typography>
              <List dense>
                {previewData.tableOfContents?.map((item, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} primaryTypographyProps={{ fontSize: '0.9rem' }} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Sample Question & Model Derivation Excerpt:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fcfcfc', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                {previewData.sampleExcerpt}
              </Paper>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Preview currently unavailable for this study item.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            {(previewData?.has_custom_preview || product?.digitalAssets?.some((a) => a.is_preview)) && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CloudDownloadIcon />}
                href={productService.getPreviewFileUrl(product.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Sample PDF
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartIcon />}
              onClick={async () => {
                await handleAddToCart(product || previewData);
                setPreviewOpen(false);
              }}
            >
              Add to Cart
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetail;