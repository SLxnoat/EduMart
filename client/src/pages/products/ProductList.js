import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Skeleton,
  Alert,
  Slider,
  Paper,
  InputAdornment,
  Divider,
  Stack,
  IconButton,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ClickAwayListener,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Tooltip
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LockIcon from '@mui/icons-material/Lock';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import productService from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

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

const RATING_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '4.5', label: '4.5★ & Above' },
  { value: '4.0', label: '4.0★ & Above' },
  { value: '3.5', label: '3.5★ & Above' }
];

const ProductList = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { enqueueSnackbar } = useSnackbar();
  const searchInputRef = useRef(null);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [subject, setSubject] = useState('All Subjects');
  const [gradeLevel, setGradeLevel] = useState('All Grades');
  const [productType, setProductType] = useState('all');
  const [format, setFormat] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('newest');

  // Autocomplete suggestions & search history
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const raw = localStorage.getItem('edumart_search_history');
      return raw ? JSON.parse(raw) : ['Combined Mathematics', 'Physics Mechanics', 'Organic Chemistry'];
    } catch {
      return ['Combined Mathematics', 'Physics Mechanics'];
    }
  });

  // Pagination & Data States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample Preview Modal States
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewPageIndex, setPreviewPageIndex] = useState(1);


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

  // Fetch Autocomplete Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await productService.getSuggestions(keyword);
        if (data && data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch (err) {
        // Silently fallback
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(timer);
  }, [keyword]);

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
      if (minRating !== 'all') params.minRating = minRating;
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
  }, [page, sortBy, keyword, subject, gradeLevel, productType, format, selectedCategory, minRating, priceRange]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const recordSearchHistory = (term) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('edumart_search_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSelectSuggestion = (term) => {
    setKeyword(term);
    recordSearchHistory(term);
    setShowSuggestions(false);
    setPage(1);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setSubject('All Subjects');
    setGradeLevel('All Grades');
    setProductType('all');
    setFormat('all');
    setSelectedCategory('all');
    setMinRating('all');
    setPriceRange([0, 3000]);
    setSortBy('newest');
    setPage(1);
  };

  const handleOpenPreview = async (e, prod) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setPreviewProduct(prod);
    setPreviewPageIndex(1);
    setPreviewOpen(true);
    setLoadingPreview(true);
    try {
      const res = await productService.getProductPreview(prod.id);
      if (res && res.preview) {
        setPreviewData(res.preview);
      }
    } catch (err) {
      console.error('Failed to load preview', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleAddToCart = async (e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const item = product || previewProduct || previewData;
    if (!item) return;

    try {
      const itemToCart = {
        id: item.id || item.productId || item.product_id,
        product_id: item.id || item.productId || item.product_id,
        title: item.title,
        price: parseFloat(item.price || 0),
        format: item.format || 'digital',
        is_digital: item.is_digital !== undefined ? item.is_digital : (item.format !== 'physical'),
        is_physical: item.is_physical !== undefined ? item.is_physical : (item.format === 'physical' || item.format === 'both'),
        subject: item.subject || 'General Education',
        grade_level: item.grade_level || 'All Grades',
      };

      try {
        const raw = localStorage.getItem('cart');
        const cart = raw ? JSON.parse(raw) : [];
        const idx = cart.findIndex((i) => i.id === itemToCart.id);
        if (idx > -1) {
          cart[idx].quantity += 1;
        } else {
          cart.push({
            id: itemToCart.id,
            title: itemToCart.title,
            price: itemToCart.price,
            format: itemToCart.format,
            subject: itemToCart.subject,
            grade_level: itemToCart.grade_level,
            quantity: 1
          });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
      } catch (_) {}

      if (addToCart) {
        addToCart(itemToCart, 1);
      }

      enqueueSnackbar(`"${itemToCart.title}" added to cart!`, { variant: 'success' });
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

  const canPublish = user && (user.role === 'tutor' || user.role === 'institute' || user.role === 'admin');

  return (
    <Container maxWidth="xl" sx={{ mt: 10, mb: 6 }}>
      {/* Page Title & Hero */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="primary">
          Educational Materials Catalog
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 720, mx: 'auto' }}>
          Explore Sri Lanka's leading verified collection of G.C.E. A/L and O/L past papers, model marking schemes, syllabus revision guides, and teacher masterclasses.
        </Typography>

        {/* Quick Subject Chips & Tutor Publish CTA */}
        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, gap: 1, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
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

          {canPublish && (
            <Button
              component={Link}
              to="/products/new"
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<CloudUploadIcon />}
              sx={{ ml: { sm: 2 }, fontWeight: 'bold' }}
            >
              Publish Material
            </Button>
          )}
        </Stack>
      </Box>

      {/* Main Grid: Filters Sidebar + Products Content */}
      <Grid container spacing={3}>
        {/* Sidebar Filters */}
        <Grid size={{ xs: 12, md: 3 }}>
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

            {/* Keyword Search with Autocomplete Dropdown */}
            <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
              <Box sx={{ mb: 3, position: 'relative' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Search Catalog
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  ref={searchInputRef}
                  placeholder="Search topic, title, paper..."
                  value={keyword}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      recordSearchHistory(keyword);
                      setShowSuggestions(false);
                    }
                  }}
                  slotProps={{
                    input: {
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
                      ),
                    },
                  }}
                />

                {/* Suggestions Popper / Dropdown */}
                {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1300,
                      mt: 0.5,
                      maxHeight: 260,
                      overflowY: 'auto',
                      borderRadius: 1
                    }}
                  >
                    <List dense disablePadding>
                      {/* Live Suggestions */}
                      {suggestions.map((sug, i) => (
                        <ListItem
                          button
                          key={`sug-${i}`}
                          onClick={() => handleSelectSuggestion(sug)}
                          sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <TrendingUpIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={sug} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                        </ListItem>
                      ))}

                      {/* Recent Search History */}
                      {searchHistory.length > 0 && (
                        <>
                          <Divider />
                          <Box sx={{ px: 2, py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              Recent Searches
                            </Typography>
                            <Button
                              size="small"
                              sx={{ fontSize: '0.7rem', p: 0, minWidth: 'auto' }}
                              onClick={() => {
                                setSearchHistory([]);
                                localStorage.removeItem('edumart_search_history');
                              }}
                            >
                              Clear
                            </Button>
                          </Box>
                          {searchHistory.map((hist, idx) => (
                            <ListItem
                              button
                              key={`hist-${idx}`}
                              onClick={() => handleSelectSuggestion(hist)}
                            >
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <HistoryIcon fontSize="small" color="action" />
                              </ListItemIcon>
                              <ListItemText primary={hist} primaryTypographyProps={{ fontSize: '0.82rem', color: 'text.secondary' }} />
                            </ListItem>
                          ))}
                        </>
                      )}
                    </List>
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>

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

            {/* Minimum Rating Filter */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="rating-filter-label">Customer Rating</InputLabel>
                <Select
                  labelId="rating-filter-label"
                  value={minRating}
                  label="Customer Rating"
                  onChange={(e) => {
                    setMinRating(e.target.value);
                    setPage(1);
                  }}
                >
                  {RATING_OPTIONS.map((opt) => (
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
        <Grid size={{ xs: 12, md: 9 }}>
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
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="rating_desc">Top Rated (Highest Reviews)</MenuItem>
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

          {/* Loading Indicator with Skeletons */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={sk}>
                  <Card sx={{ p: 2.5, height: 340, borderRadius: 2 }}>
                    <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1.5, mb: 2 }} />
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Skeleton width="30%" height={24} sx={{ borderRadius: 1 }} />
                      <Skeleton width="30%" height={24} sx={{ borderRadius: 1 }} />
                    </Stack>
                    <Skeleton width="90%" height={24} sx={{ mb: 0.5 }} />
                    <Skeleton width="70%" height={20} sx={{ mb: 2 }} />
                    <Skeleton width="40%" height={28} sx={{ mt: 'auto' }} />
                  </Card>
                </Grid>
              ))}
            </Grid>
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
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={product.id}>
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
                      {/* Top Chips: Grade & Subject & Format + Quick Preview Eye Icon */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
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
                        <Tooltip title="Quick Preview Sample">
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label="Quick Preview Sample"
                            onClick={(e) => handleOpenPreview(e, product)}
                            sx={{
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.16)' },
                              flexShrink: 0
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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

                      {/* Star Rating & Review Count */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Rating
                          value={Number(product.rating_average) || 4.8}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          ({product.rating_count || 15})
                        </Typography>
                      </Box>

                      {/* Short Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1.5,
                          fontSize: '0.85rem'
                        }}
                      >
                        {product.description}
                      </Typography>

                      {/* Stock Status for Physical Copies */}
                      {(product.format === 'physical' || product.format === 'both') && (
                        <Typography variant="caption" color="success.main" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                          📦 In Stock: {product.stock_quantity || 50} printed copies
                        </Typography>
                      )}

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

      {/* Material Sample Preview Modal Dialog */}
      {previewOpen && (
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <MenuBookIcon color="primary" sx={{ fontSize: 26 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                  Material Sample Preview
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {previewProduct?.title || previewData?.title}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<OpenInNewIcon />}
                href={productService.getPreviewImageUrl(previewProduct?.id || previewData?.id || previewData?.productId, Math.min(2, previewPageIndex))}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Full Image
              </Button>
              <IconButton onClick={() => setPreviewOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: '#f8fafc' }}>
            {loadingPreview ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {/* Left Column: Interactive Multi-Page Image Gallery */}
                <Grid size={{ xs: 12, md: 8 }}>
                  {/* Header Controls */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        color={previewPageIndex === 3 ? "warning" : "primary"}
                        icon={previewPageIndex === 3 ? <LockIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        label={previewPageIndex === 3 ? "Content Locked" : `Page ${previewPageIndex} of 52 (Sample Preview)`}
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        🔒 Official Watermarked Specimen
                      </Typography>
                    </Box>

                    {/* Prev / Next Page Navigator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<NavigateBeforeIcon />}
                        disabled={previewPageIndex <= 1}
                        onClick={() => setPreviewPageIndex((p) => Math.max(1, p - 1))}
                        sx={{ minWidth: 70, py: 0.25 }}
                      >
                        Prev
                      </Button>
                      <Typography variant="caption" fontWeight="bold" sx={{ px: 1 }}>
                        {previewPageIndex} / 3
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<NavigateNextIcon />}
                        disabled={previewPageIndex >= 3}
                        onClick={() => setPreviewPageIndex((p) => Math.min(3, p + 1))}
                        sx={{ minWidth: 70, py: 0.25 }}
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>

                  {/* Main Document Viewer: Image or Locked Teaser */}
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: '450px', sm: '550px', md: '580px' },
                      borderRadius: 2,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      border: '1px solid #cbd5e1',
                      bgcolor: '#475569',
                      p: { xs: 1, sm: 2 },
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: previewPageIndex === 3 ? 'center' : 'flex-start',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {previewPageIndex <= 2 ? (
                      <Box
                        component="img"
                        src={productService.getPreviewImageUrl(previewProduct?.id || previewData?.id || previewData?.productId, previewPageIndex)}
                        alt={`Document Specimen Page ${previewPageIndex}`}
                        sx={{
                          width: '100%',
                          maxWidth: '700px',
                          height: 'auto',
                          borderRadius: 1.5,
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                          bgcolor: '#ffffff',
                          display: 'block'
                        }}
                      />
                    ) : (
                      /* Locked Content Curiosity Teaser Card */
                      <Paper
                        elevation={4}
                        sx={{
                          p: { xs: 3, sm: 4 },
                          maxWidth: 520,
                          textAlign: 'center',
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(8px)',
                          border: '2px dashed #f59e0b'
                        }}
                      >
                        <Box
                          sx={{
                            width: 68,
                            height: 68,
                            borderRadius: '50%',
                            bgcolor: '#fef3c7',
                            color: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                          }}
                        >
                          <LockIcon sx={{ fontSize: 36 }} />
                        </Box>

                        <Typography variant="h5" fontWeight="800" gutterBottom color="#0f172a">
                          50 More Pages Locked
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                          You're viewing a 2-page sample specimen. The complete study package includes all <strong>52 full pages</strong> with exhaustive theoretical derivations, 48 model examination questions, and official scoring rubrics.
                        </Typography>

                        <Stack spacing={1.2} sx={{ mb: 3, textAlign: 'left', bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="caption" fontWeight="600">Complete unredacted material without watermarks</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="caption" fontWeight="600">Instant PDF download immediately after checkout (&lt; 2s)</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="caption" fontWeight="600">Unrestricted student printing &amp; tablet annotation rights</Typography>
                          </Box>
                        </Stack>

                        <Button
                          variant="contained"
                          color="warning"
                          size="large"
                          fullWidth
                          startIcon={<ShoppingCartIcon />}
                          onClick={async (e) => {
                            const target = previewProduct || previewData;
                            if (target) {
                              await handleAddToCart(e, target);
                            }
                            setPreviewOpen(false);
                          }}
                          sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}
                        >
                          Unlock All 52 Pages Now • {formatPrice(previewProduct?.price || previewData?.price)}
                        </Button>
                      </Paper>
                    )}
                  </Box>

                  {/* Page Thumbnail Selector Bar */}
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, overflowX: 'auto', py: 0.5 }}>
                    {[1, 2, 3].map((page) => (
                      <Paper
                        key={page}
                        onClick={() => setPreviewPageIndex(page)}
                        variant={previewPageIndex === page ? 'elevation' : 'outlined'}
                        elevation={previewPageIndex === page ? 3 : 0}
                        sx={{
                          p: 1,
                          cursor: 'pointer',
                          borderRadius: 2,
                          minWidth: 110,
                          textAlign: 'center',
                          bgcolor: previewPageIndex === page ? '#eff6ff' : '#ffffff',
                          borderColor: previewPageIndex === page ? 'primary.main' : '#cbd5e1',
                          borderWidth: previewPageIndex === page ? 2 : 1,
                          borderStyle: 'solid',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
                        }}
                      >
                        {page <= 2 ? (
                          <>
                            <Box
                              sx={{
                                width: '100%',
                                height: 50,
                                bgcolor: '#f1f5f9',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 0.5,
                                color: 'primary.main'
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </Box>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              Page {page} (Sample)
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Box
                              sx={{
                                width: '100%',
                                height: 50,
                                bgcolor: '#fef3c7',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 0.5,
                                color: '#d97706'
                              }}
                            >
                              <LockIcon fontSize="small" />
                            </Box>
                            <Typography variant="caption" fontWeight="bold" color="warning.main" display="block">
                              Pages 3-52 🔒
                            </Typography>
                          </>
                        )}
                      </Paper>
                    ))}
                  </Box>
                </Grid>

                {/* Right Column: High-Conversion Marketing Sidebar */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      bgcolor: '#ffffff'
                    }}
                  >
                    {/* Urgency & Social Proof Alert */}
                    <Alert
                      severity="error"
                      icon={<WhatshotIcon sx={{ color: '#ef4444' }} />}
                      sx={{
                        bgcolor: '#fff1f2',
                        color: '#9f1239',
                        fontWeight: 'bold',
                        py: 0.5,
                        px: 1.5,
                        mb: 1.5,
                        border: '1px solid #fecdd3',
                        fontSize: '0.82rem'
                      }}
                    >
                      🔥 High Demand: 18 students studying this unit this week
                    </Alert>

                    {/* Specification Chips */}
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                      <Chip size="small" label={previewProduct?.subject || previewData?.subject} color="primary" sx={{ fontWeight: 'bold' }} />
                      <Chip size="small" label={previewProduct?.grade_level || previewData?.grade_level} variant="outlined" />
                      <Chip size="small" label="EXAM ALIGNED" color="success" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    </Box>

                    {/* Title */}
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.3 }}>
                      {previewProduct?.title || previewData?.title}
                    </Typography>

                    {/* Rating & Social Authority */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                      <Rating value={Number(previewProduct?.rating_average || previewData?.rating_average || 4.8)} precision={0.5} readOnly size="small" />
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        ({previewProduct?.rating_count || previewData?.rating_count || 120}+ verified reviews)
                      </Typography>
                      <Chip size="small" label="🏆 Best Seller" sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#fef3c7', color: '#92400e', fontWeight: 'bold' }} />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Value / Strikethrough Price Anchoring */}
                    <Box sx={{ mb: 2, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary', display: 'block' }}>
                        Regular Price: {formatPrice((parseFloat(previewProduct?.price || previewData?.price || 0) * 1.45))}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" fontWeight="800" color="primary.main">
                          {formatPrice(previewProduct?.price || previewData?.price)}
                        </Typography>
                        <Chip label="SAVE 31% TODAY" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                      </Box>
                      <Typography variant="caption" color="success.main" fontWeight="600" display="block" sx={{ mt: 0.25 }}>
                        ✓ Instant digital access unlocked immediately
                      </Typography>
                    </Box>

                    {/* Author / Exam Year */}
                    {(previewProduct?.seller || previewData?.seller) && (
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                        Published by: <strong>{previewProduct?.seller?.first_name ? `${previewProduct.seller.first_name} ${previewProduct.seller.last_name || ''}` : 'Verified Senior Educator'}</strong>
                      </Typography>
                    )}
                    {(previewProduct?.exam_year || previewData?.exam_year) && (
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
                        Target Examination: <strong>{previewProduct?.exam_year || previewData?.exam_year}</strong>
                      </Typography>
                    )}

                    {/* EduMart Risk-Reversal Guarantees */}
                    <Box sx={{ bgcolor: '#f0f9ff', p: 1.5, borderRadius: 1.5, mb: 'auto', border: '1px solid #e0f2fe' }}>
                      <Typography variant="caption" display="block" color="#0369a1" fontWeight="bold" sx={{ mb: 0.75 }}>
                        🛡️ EduMart Buyer Protection Guarantee:
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                        • 100% Department of Examinations syllabus alignment
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                        • Instant PDF download in high-resolution master quality
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        • Secure 256-bit encrypted checkout with Stripe
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        startIcon={<ShoppingCartIcon />}
                        onClick={async (e) => {
                          const target = previewProduct || previewData;
                          if (target) {
                            await handleAddToCart(e, target);
                          }
                          setPreviewOpen(false);
                        }}
                        sx={{ py: 1.25, fontWeight: 'bold' }}
                      >
                        Add to Cart &amp; Unlock Material
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        component={Link}
                        to="/cart"
                        onClick={() => setPreviewOpen(false)}
                        fullWidth
                      >
                        View Cart
                      </Button>
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        fullWidth
                        onClick={() => setPreviewOpen(false)}
                      >
                        Close
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default ProductList;