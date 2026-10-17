import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Breadcrumbs
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import productService from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

const SUBJECT_OPTIONS = [
  'Combined Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'Science',
  'Information Technology',
  'Economics',
  'Accounting'
];

const GRADE_OPTIONS = [
  'A/L Grade 13',
  'A/L Grade 12-13',
  'A/L Grade 12',
  'O/L Grade 11',
  'O/L Grade 10'
];

const PRODUCT_TYPE_OPTIONS = [
  { value: 'past_paper', label: 'Past Papers & Marking Schemes' },
  { value: 'revision_notes', label: 'Revision Guides & Short Notes' },
  { value: 'model_paper', label: 'Model Examination Papers' },
  { value: 'lecture_pack', label: 'Video Packs & Masterclasses' },
  { value: 'ebook', label: 'Reference & Resource Books' }
];

const ProductCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    subject: 'Combined Mathematics',
    grade_level: 'A/L Grade 13',
    exam_year: '2024',
    product_type: 'past_paper',
    format: 'digital',
    category_id: 1,
    stock_quantity: 50
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories();
        const list = res?.categories || res || [];
        setCategories(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: list[0].id }));
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Please provide a descriptive title for your study material.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide syllabus descriptions and topic coverage details.');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('Please enter a valid price in LKR.');
      return;
    }
    if (!formData.category_id) {
      setError('Please select a curriculum category.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        exam_year: formData.exam_year ? parseInt(formData.exam_year, 10) : null,
        category_id: Number(formData.category_id),
        stock_quantity: parseInt(formData.stock_quantity, 10) || 50
      };

      const res = await productService.createProduct(payload);
      enqueueSnackbar('Educational material published successfully!', { variant: 'success' });
      if (res && res.product && res.product.id) {
        navigate(`/products/${res.product.id}`);
      } else {
        navigate('/products');
      }
    } catch (err) {
      console.error('Failed to publish material', err);
      setError(err.response?.data?.message || 'Could not publish material. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10, mb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Home
          </Link>
          <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
            Catalog
          </Link>
          <Typography color="text.primary">Publish Study Material</Typography>
        </Breadcrumbs>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
            Publish New Educational Material
          </Typography>
          <Button
            component={Link}
            to="/products"
            startIcon={<ArrowBackIcon />}
            size="small"
            variant="text"
          >
            Cancel
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload syllabus-aligned past papers, marking schemes, revision guides, or model exam sets. Available to all registered Sri Lankan students.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Material Title"
                name="title"
                placeholder="e.g. G.C.E. A/L Combined Mathematics 2024 Model Examination Paper with Solutions"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Subject */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="subject-label">Subject</InputLabel>
                <Select
                  labelId="subject-label"
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Grade Level */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="grade-label">Grade / Standard</InputLabel>
                <Select
                  labelId="grade-label"
                  label="Grade / Standard"
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleChange}
                >
                  {GRADE_OPTIONS.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loadingCategories}>
                <InputLabel id="category-label">Curriculum Category</InputLabel>
                <Select
                  labelId="category-label"
                  label="Curriculum Category"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Material Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Material Type</InputLabel>
                <Select
                  labelId="type-label"
                  label="Material Type"
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleChange}
                >
                  {PRODUCT_TYPE_OPTIONS.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Delivery Format */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="format-label">Delivery Format</InputLabel>
                <Select
                  labelId="format-label"
                  label="Delivery Format"
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                >
                  <MenuItem value="digital">Digital PDF Download</MenuItem>
                  <MenuItem value="physical">Physical Printed Copy</MenuItem>
                  <MenuItem value="both">Combo (Digital + Printed)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Exam Year */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Examination Year"
                name="exam_year"
                type="number"
                placeholder="2024"
                value={formData.exam_year}
                onChange={handleChange}
              />
            </Grid>

            {/* Price (LKR) */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (LKR)"
                name="price"
                type="number"
                placeholder="750.00"
                value={formData.price}
                onChange={handleChange}
                required
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            {/* Physical Stock Quantity */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Inventory Stock Quantity"
                name="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={handleChange}
                helperText="Available physical copies for islandwide shipping"
                inputProps={{ min: '0' }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description & Syllabus Coverage"
                name="description"
                placeholder="Detail key chapters covered, marking methodology, solution styles, and teacher tips..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Publisher attribution */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fbfcfd' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Listing will be published under tutor account: <strong>{user?.firstName} {user?.lastName}</strong> ({user?.institution || 'Registered Tutor'})
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button component={Link} to="/products" variant="outlined">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                >
                  {submitting ? 'Publishing...' : 'Publish Material'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProductCreate;
