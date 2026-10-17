import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  Slider,
  Paper,
  InputAdornment,
  Divider,
  Stack,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SchoolIcon from '@mui/icons-material/School';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useSnackbar } from 'notistack';
import productService from '../../services/productService';

const SUBJECT_OPTIONS = [
  'All Subjects',
  'Combined Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'Science'
];

const GRADE_OPTIONS = [
  'All Grades',
  'A/L Grade 13',
  'A/L Grade 12-13',
  'A/L Grade 12',
  'O/L Grade 11'
];

const PRODUCT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'past_paper', label: 'Past Papers & Marking Schemes' },
  { value: 'revision_notes', label: 'Revision Guides & Short Notes' },
  { value: 'model_paper', label: 'Model Examination Papers' },
  { value: 'lecture_pack', label: 'Video Packs & Masterclasses' },
  { value: 'ebook', label: 'Reference & Resource Books' }
];

const FORMAT_OPTIONS = [
  { value: 'all', label: 'All Formats' },
  { value: 'digital', label: 'Digital PDF Download' },
  { value: 'physical', label: 'Physical Printed Copy' },
  { value: 'both', label: 'Combo (Digital + Printed)' }
];

const ProductList = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [subject, setSubject] = useState('All Subjects');
  const [gradeLevel, setGradeLevel] = useState('All Grades');
  const [productType, setProductType] = useState('all');
  const [format, setFormat] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('newest');

  // Pagination & Data States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories();
        if (res && res.categories) {
          setCategories(res.categories);
        } else if (Array.isArray(res)) {
          setCategories(res);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 9,
        sort: sortBy
      };

      if (keyword.trim()) params.keyword = keyword.trim();
      if (subject !== 'All Subjects') params.subject = subject;
      if (gradeLevel !== 'All Grades') params.grade_level = gradeLevel;
      if (productType !== 'all') params.product_type = productType;
      if (format !== 'all') params.format = format;
      if (selectedCategory !== 'all') params.category_id = selectedCategory;
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 3000) params.maxPrice = priceRange[1];

      const data = await productService.getAllProducts(params);

      if (data && data.products) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || data.products.length);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
        setTotalItems(data.length);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Failed to load products', err);
      setError('Unable to load educational materials at this moment. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, keyword, subject, gradeLevel, productType, format, selectedCategory, priceRange]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleResetFilters = () => {
    setKeyword('');
    setSubject('All Subjects');
    setGradeLevel('All Grades');
    setProductType('all');
    setFormat('all');
    setSelectedCategory('all');
    setPriceRange([0, 3000]);
    setSortBy('newest');
    setPage(1);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = localStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : [];
      const idx = cart.findIndex((i) => i.id === product.id);
      if (idx > -1) {
        cart[idx].quantity += 1;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: parseFloat(product.price),
          format: product.format,
          subject: product.subject,
          grade_level: product.grade_level,
          quantity: 1
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      enqueueSnackbar(`"${product.title}" added to cart!`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Could not add item to cart', { variant: 'error' });
    }
  };

  const formatPrice = (price) => {
    return `LKR ${parseFloat(price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderFormatChip = (fmt) => {
    if (fmt === 'digital') {
      return <Chip size="small" icon={<CloudDownloadIcon fontSize="small" />} label="Digital PDF" color="primary" variant="outlined" />;
    }
    if (fmt === 'physical') {
      return <Chip size="small" icon={<LocalShippingIcon fontSize="small" />} label="Printed Copy" color="secondary" variant="outlined" />;
    }
    return <Chip size="small" icon={<MenuBookIcon fontSize="small" />} label="Digital + Print" color="success" variant="outlined" />;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 10, mb: 6 }}>
      {/* Page Title & Hero */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="primary">
          Educational Materials Catalog
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Explore Sri Lanka's leading verified collection of G.C.E. A/L and O/L past papers, model marking schemes, syllabus revision guides, and teacher masterclasses.
        </Typography>

        {/* Quick Subject Chips */}
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 2, gap: 1 }}>
          {['Combined Mathematics', 'Physics', 'Chemistry', 'Biology', 'Mathematics'].map((subj) => (
            <Chip
              key={subj}
              label={subj}
              clickable
              color={subject === subj ? 'primary' : 'default'}
              onClick={() => {
                setSubject(subject === subj ? 'All Subjects' : subj);
                setPage(1);
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Main Grid: Filters Sidebar + Products Content */}
      <Grid container spacing={3}>
        {/* Sidebar Filters */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterAltIcon color="primary" /> Filters
              </Typography>
              <Button
                size="small"
                variant="text"
                color="secondary"
                startIcon={<FilterAltOffIcon />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* Keyword Search */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Search Catalog
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search topic, title, paper..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: keyword && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setKeyword('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Subject Filter */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="subject-select-label">Subject</InputLabel>
                <Select
                  labelId="subject-select-label"
                  value={subject}
                  label="Subject"
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setPage(1);
                  }}
                >
                  {SUBJECT_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Grade Level Filter */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="grade-select-label">Grade / Level</InputLabel>
                <Select
                  labelId="grade-select-label"
                  value={gradeLevel}
                  label="Grade / Level"
                  onChange={(e) => {
                    setGradeLevel(e.target.value);
                    setPage(1);
                  }}
                >
                  {GRADE_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Category Filter */}
            {categories.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Material Type */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-select-label">Material Type</InputLabel>
                <Select
                  labelId="type-select-label"
                  value={productType}
                  label="Material Type"
                  onChange={(e) => {
                    setProductType(e.target.value);
                    setPage(1);
                  }}
                >
                  {PRODUCT_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Format Filter */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="format-select-label">Delivery Format</InputLabel>
                <Select
                  labelId="format-select-label"
                  value={format}
                  label="Delivery Format"
                  onChange={(e) => {
                    setFormat(e.target.value);
                    setPage(1);
                  }}
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Price Range Slider */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Price Range (LKR): {priceRange[0]} - {priceRange[1]}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(e, newVal) => setPriceRange(newVal)}
                onChangeCommitted={() => setPage(1)}
                valueLabelDisplay="auto"
                min={0}
                max={3000}
                step={50}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary', fontSize: '0.8rem' }}>
                <span>LKR 0</span>
                <span>LKR 3,000+</span>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Product Cards and Controls */}
        <Grid item xs={12} md={9}>
          {/* Top Control Bar: Total Count & Sort By */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Showing <strong>{products.length}</strong> of <strong>{totalItems}</strong> educational items
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Sort by:
              </Typography>
              <Select
                size="small"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="price_desc">Price: High to Low</MenuItem>
                <MenuItem value="title_asc">Title: A to Z</MenuItem>
              </Select>
            </Box>
          </Paper>

          {/* Error Feedback */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={loadProducts}>Retry</Button>}>
              {error}
            </Alert>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
              <CircularProgress size={48} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading educational materials...
              </Typography>
            </Box>
          ) : products.length === 0 ? (
            /* Empty State */
            <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
              <MenuBookIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No educational materials found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We couldn't find any resources matching your search and filter criteria. Try adjusting your keywords or clearing the active filters.
              </Typography>
              <Button variant="outlined" color="primary" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </Paper>
          ) : (
            /* Product Cards Grid */
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} lg={4} key={product.id}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      {/* Top Chips: Grade & Subject & Format */}
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                        <Chip
                          size="small"
                          label={product.subject}
                          color="primary"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Chip
                          size="small"
                          label={product.grade_level}
                          variant="outlined"
                        />
                        {renderFormatChip(product.format)}
                      </Box>

                      {/* Product Title */}
                      <Typography
                        variant="subtitle1"
                        component={Link}
                        to={`/products/${product.id}`}
                        sx={{
                          fontWeight: 'bold',
                          color: 'text.primary',
                          textDecoration: 'none',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.3,
                          mb: 1,
                          '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                        }}
                      >
                        {product.title}
                      </Typography>

                      {/* Short Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                          fontSize: '0.85rem'
                        }}
                      >
                        {product.description}
                      </Typography>

                      {/* Seller & Exam Year Attribution */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', fontSize: '0.8rem', mt: 'auto' }}>
                        <SchoolIcon fontSize="inherit" color="action" />
                        <Typography variant="caption" noWrap>
                          {product.seller ? `${product.seller.first_name} ${product.seller.last_name}` : 'Verified Tutor'}
                          {product.seller?.institution ? ` • ${product.seller.institution}` : ''}
                        </Typography>
                      </Box>
                      {product.exam_year && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Examination Year: {product.exam_year}
                        </Typography>
                      )}
                    </CardContent>

                    <Divider />

                    {/* Bottom Price & Action Buttons */}
                    <CardActions sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Price
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {formatPrice(product.price)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          component={Link}
                          to={`/products/${product.id}`}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<ShoppingCartIcon />}
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          Cart
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => {
                  setPage(val);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductList;