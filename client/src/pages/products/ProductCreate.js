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
  Breadcrumbs,
  InputAdornment,
  IconButton
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
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

  const [materialFile, setMaterialFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMaterialFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Study material file exceeds maximum permitted limit (50 MB).');
        return;
      }
      setMaterialFile(file);
      setError(null);
    }
  };

  const handlePreviewFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError('Sample preview file exceeds maximum permitted limit (20 MB).');
        return;
      }
      setPreviewFile(file);
      setError(null);
    }
  };

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

      let submissionData = payload;
      if (materialFile || previewFile) {
        const data = new FormData();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== null && payload[key] !== undefined) {
            data.append(key, payload[key]);
          }
        });
        if (materialFile) {
          data.append('material_file', materialFile);
        }
        if (previewFile) {
          data.append('preview_file', previewFile);
        }
        submissionData = data;
      }

      const res = await productService.createProduct(submissionData);
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
            {/* Section 1: Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                1. Resource Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Title */}
            <Grid size={{ xs: 12 }}>
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

            {/* Description */}
            <Grid size={{ xs: 12 }}>
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

            {/* Section 2: Curriculum & Classification */}
            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                2. Academic Classification
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Subject */}
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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

            {/* Section 3: Pricing & Inventory */}
            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                3. Pricing & Fulfillment
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Price (LKR) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Price (LKR)"
                name="price"
                type="number"
                placeholder="750.00"
                value={formData.price}
                onChange={handleChange}
                required
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">LKR</InputAdornment>,
                  },
                  htmlInput: { step: '0.01', min: '0' }
                }}
              />
            </Grid>

            {/* Physical Stock Quantity */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Inventory Stock Quantity"
                name="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={handleChange}
                helperText="Available physical copies for islandwide shipping"
                slotProps={{
                  htmlInput: { min: '0' }
                }}
              />
            </Grid>

            {/* Section 4: Study Material File Upload */}
            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                4. Study Material File & Curriculum Preview
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Upload the complete document/resource for students to download upon purchase. Supported: PDF, Word, PPT, ZIP, EPUB (Max 50MB).
              </Typography>
            </Grid>

            {/* Main Study Material File */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  borderStyle: materialFile ? 'solid' : 'dashed',
                  borderWidth: 2,
                  borderColor: materialFile ? 'success.main' : 'primary.light',
                  bgcolor: materialFile ? 'rgba(34, 197, 94, 0.04)' : '#fafbff',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {materialFile ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <PictureAsPdfIcon color="error" sx={{ fontSize: 36 }} />
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                          {materialFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(materialFile.size)} • Ready for upload
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => setMaterialFile(null)} aria-label="remove material file">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon color="primary" sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Upload Primary Study Material
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      Full curriculum paper, notes, or model answer guide
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={<AttachFileIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Browse File
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.epub,.txt,.jpg,.jpeg,.png"
                        onChange={handleMaterialFileChange}
                      />
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Optional Sample Preview File */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  borderStyle: previewFile ? 'solid' : 'dashed',
                  borderWidth: 2,
                  borderColor: previewFile ? 'info.main' : '#cbd5e1',
                  bgcolor: previewFile ? 'rgba(56, 189, 248, 0.04)' : '#f8fafc',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {previewFile ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <DescriptionIcon color="info" sx={{ fontSize: 36 }} />
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                          {previewFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(previewFile.size)} • Sample Preview
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => setPreviewFile(null)} aria-label="remove preview file">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box>
                    <DescriptionIcon color="action" sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Upload Sample Preview (Optional)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      Watermarked sample or first 2–3 pages for students to inspect
                    </Typography>
                    <Button
                      variant="outlined"
                      color="inherit"
                      component="label"
                      size="small"
                      startIcon={<AttachFileIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Browse Preview
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handlePreviewFileChange}
                      />
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Publisher attribution */}
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Listing will be published under verified educator profile: <strong>{user?.firstName} {user?.lastName}</strong> ({user?.institution || 'Registered Educator'})
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button component={Link} to="/products" variant="outlined" sx={{ px: 3, fontWeight: 600 }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                  sx={{ px: 4, py: 1.2, fontWeight: 700, boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
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
