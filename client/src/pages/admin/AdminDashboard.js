import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Rating,
  Pagination,
  InputAdornment,
  Stack,
  Tooltip,
  Switch
} from '@mui/material';
import {
  People,
  Inventory,
  Receipt,
  Star,
  Campaign,
  HistoryEdu,
  CheckCircle,
  Cancel,
  Delete,
  Search,
  Refresh,
  Warning,
  Security,
  LocalOffer,
  Add,
  ContentCopy,
  Casino,
  Done
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import reviewService from '../../services/reviewService';
import notificationService from '../../services/notificationService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: 'success' });

  // Users Tab State
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Status Dialog State
  const [statusDialog, setStatusDialog] = useState({ open: false, user: null, reason: '' });

  // Products Moderation Tab State
  const [moderationProducts, setModerationProducts] = useState([]);
  const [prodFilter, setProdFilter] = useState('pending');
  const [loadingProds, setLoadingProds] = useState(false);
  const [rejectDialog, setRejectDialog] = useState({ open: false, product: null, feedback: '' });

  // Reviews Moderation Tab State
  const [moderationReviews, setModerationReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Broadcast Announcement State
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
    target_role: 'all'
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Audit Logs Tab State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Coupons Tab State
  const [coupons, setCoupons] = useState([]);
  const [couponSummary, setCouponSummary] = useState({ total_coupons: 0, active_coupons: 0, total_redemptions: 0 });
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 15,
    min_purchase: 0,
    max_discount: '',
    usage_limit: '',
    end_date: '',
    is_active: true,
  });
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const couponPresets = [
    {
      title: '⚡ 10% Flash Sale',
      codePrefix: 'FLASH10-',
      description: '10% Flash discount on all educational resources',
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase: 0,
      max_discount: 100,
      usage_limit: 50,
    },
    {
      title: '🎒 20% Semester Kickoff',
      codePrefix: 'KICKOFF20-',
      description: '20% off for semester kickoff exams',
      discount_type: 'percentage',
      discount_value: 20,
      min_purchase: 50,
      max_discount: 250,
      usage_limit: 100,
    },
    {
      title: '🎁 LKR 500 Welcome Discount',
      codePrefix: 'WELCOME500-',
      description: 'LKR 500 flat discount for registered students',
      discount_type: 'fixed',
      discount_value: 500,
      min_purchase: 2000,
      usage_limit: 200,
    },
    {
      title: '🔥 50% Top Student Voucher',
      codePrefix: 'TOP50-',
      description: '50% exclusive scholar bursary voucher',
      discount_type: 'percentage',
      discount_value: 50,
      min_purchase: 100,
      max_discount: 500,
      usage_limit: 25,
    },
  ];

  // Fetch KPI Metrics
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const data = await adminService.getMetrics();
      setMetrics(data);
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to load system metrics', type: 'error' });
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async (page = 1) => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getUsers({
        page,
        role: userRoleFilter,
        search: userSearch
      });
      setUsers(data.users || []);
      setUserTotalPages(data.totalPages || 1);
      setUserPage(page);
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to retrieve users', type: 'error' });
    } finally {
      setLoadingUsers(false);
    }
  }, [userRoleFilter, userSearch]);

  // Fetch Moderation Products
  const fetchModerationProducts = useCallback(async () => {
    setLoadingProds(true);
    try {
      const data = await adminService.getModerationProducts({ status: prodFilter });
      setModerationProducts(data.products || []);
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to retrieve products queue', type: 'error' });
    } finally {
      setLoadingProds(false);
    }
  }, [prodFilter]);

  // Fetch Moderation Reviews
  const fetchModerationReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const data = await reviewService.getModerationReviews({ status: reviewFilter });
      setModerationReviews(data.reviews || []);
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to retrieve reviews', type: 'error' });
    } finally {
      setLoadingReviews(false);
    }
  }, [reviewFilter]);

  // Fetch Audit Logs
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const data = await adminService.getAdminLogs();
      setLogs(data.logs || []);
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to retrieve audit trail', type: 'error' });
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // Fetch Coupons
  const fetchCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    try {
      const res = await adminService.getAllCoupons();
      setCoupons(res.data || []);
      if (res.summary) {
        setCouponSummary(res.summary);
      }
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to retrieve promotional coupons', type: 'error' });
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (activeTab === 1) fetchUsers(1);
    if (activeTab === 2) fetchModerationProducts();
    if (activeTab === 3) fetchModerationReviews();
    if (activeTab === 5) fetchLogs();
    if (activeTab === 6) fetchCoupons();
  }, [activeTab, fetchUsers, fetchModerationProducts, fetchModerationReviews, fetchLogs, fetchCoupons]);

  // Handle User Status toggle
  const handleConfirmStatusToggle = async () => {
    const { user, reason } = statusDialog;
    if (!user) return;
    try {
      await adminService.updateUserStatus(user.id, {
        is_active: !user.is_active,
        reason
      });
      setFeedbackMsg({
        text: `User ${user.email} status updated to ${!user.is_active ? 'Active' : 'Suspended'}`,
        type: 'success'
      });
      setStatusDialog({ open: false, user: null, reason: '' });
      fetchUsers(userPage);
      fetchMetrics();
    } catch (err) {
      setFeedbackMsg({ text: err.response?.data?.message || 'Failed to update user status', type: 'error' });
    }
  };

  // Handle User Role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, { role: newRole });
      setFeedbackMsg({ text: `User role changed to ${newRole}`, type: 'success' });
      fetchUsers(userPage);
    } catch (err) {
      setFeedbackMsg({ text: err.response?.data?.message || 'Failed to change role', type: 'error' });
    }
  };

  // Handle Product Moderation
  const handleProductDecision = async (productId, isApproved, feedback = '') => {
    try {
      await adminService.moderateProduct(productId, {
        is_approved: isApproved,
        feedback
      });
      setFeedbackMsg({
        text: `Material listing ${isApproved ? 'approved' : 'rejected'} successfully`,
        type: 'success'
      });
      setRejectDialog({ open: false, product: null, feedback: '' });
      fetchModerationProducts();
      fetchMetrics();
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to update product moderation', type: 'error' });
    }
  };

  // Handle Review Moderation
  const handleReviewToggle = async (reviewId, currentStatus) => {
    try {
      await reviewService.moderateReview(reviewId, { is_approved: !currentStatus });
      setFeedbackMsg({ text: `Review ${!currentStatus ? 'approved' : 'hidden'}`, type: 'success' });
      fetchModerationReviews();
      fetchMetrics();
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to moderate review', type: 'error' });
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      setFeedbackMsg({ text: 'Review permanently removed', type: 'success' });
      fetchModerationReviews();
      fetchMetrics();
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to delete review', type: 'error' });
    }
  };

  // Handle Broadcast Submission
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setSendingBroadcast(true);
    try {
      await notificationService.broadcast(broadcastForm);
      setFeedbackMsg({ text: 'System announcement dispatched across all channels!', type: 'success' });
      setBroadcastForm({ title: '', message: '', priority: 'normal', target_role: 'all' });
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to send broadcast announcement', type: 'error' });
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Handle Coupon Actions
  const handleGenerateRandomCode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const randomAlpha = Math.random().toString(36).substring(2, 5).toUpperCase();
    setCouponForm((prev) => ({ ...prev, code: `EDU-${randomAlpha}${randomDigits}` }));
  };

  const handleApplyPreset = (preset) => {
    const randomDigits = Math.floor(100 + Math.random() * 900);
    setCouponForm((prev) => ({
      ...prev,
      code: preset.codePrefix ? `${preset.codePrefix}${randomDigits}` : prev.code,
      description: preset.description,
      discount_type: preset.discount_type,
      discount_value: preset.discount_value,
      min_purchase: preset.min_purchase,
      max_discount: preset.max_discount || '',
      usage_limit: preset.usage_limit || '',
    }));
  };

  const handleCreateCoupon = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!couponForm.code || !couponForm.code.trim()) {
      setFeedbackMsg({ text: 'Please provide or generate a coupon code', type: 'error' });
      return;
    }
    setSubmittingCoupon(true);
    try {
      const payload = {
        ...couponForm,
        code: couponForm.code.trim().toUpperCase(),
        discount_value: parseFloat(couponForm.discount_value),
        min_purchase: parseFloat(couponForm.min_purchase) || 0,
        max_discount: couponForm.max_discount ? parseFloat(couponForm.max_discount) : null,
        usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit, 10) : null,
        end_date: couponForm.end_date ? new Date(couponForm.end_date).toISOString() : null,
      };
      await adminService.createCoupon(payload);
      setFeedbackMsg({ text: `Promotional coupon '${payload.code}' generated successfully!`, type: 'success' });
      setCouponModalOpen(false);
      setCouponForm({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 15,
        min_purchase: 0,
        max_discount: '',
        usage_limit: '',
        end_date: '',
        is_active: true,
      });
      fetchCoupons();
    } catch (err) {
      setFeedbackMsg({ text: err.response?.data?.message || 'Failed to create coupon', type: 'error' });
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleToggleCouponStatus = async (coupon) => {
    try {
      await adminService.updateCoupon(coupon.id, { is_active: !coupon.is_active });
      setFeedbackMsg({
        text: `Coupon '${coupon.code}' is now ${!coupon.is_active ? 'Active' : 'Disabled'}`,
        type: 'success',
      });
      fetchCoupons();
    } catch (err) {
      setFeedbackMsg({ text: err.response?.data?.message || 'Failed to update coupon status', type: 'error' });
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${coupon.code}'?`)) return;
    try {
      await adminService.deleteCoupon(coupon.id);
      setFeedbackMsg({ text: `Coupon '${coupon.code}' deleted successfully`, type: 'success' });
      fetchCoupons();
    } catch (err) {
      setFeedbackMsg({ text: err.response?.data?.message || 'Failed to delete coupon', type: 'error' });
    }
  };

  const handleCopyCode = (code) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Admin Central Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Platform governance, user verification, product moderation & notifications
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            fetchMetrics();
            if (activeTab === 1) fetchUsers(userPage);
            if (activeTab === 2) fetchModerationProducts();
            if (activeTab === 3) fetchModerationReviews();
            if (activeTab === 5) fetchLogs();
            if (activeTab === 6) fetchCoupons();
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {feedbackMsg.text && (
        <Alert
          severity={feedbackMsg.type}
          sx={{ mb: 3 }}
          onClose={() => setFeedbackMsg({ text: '', type: 'success' })}
        >
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<Security />} iconPosition="start" label="Overview & KPIs" />
          <Tab icon={<People />} iconPosition="start" label="User Moderation" />
          <Tab
            icon={<Inventory />}
            iconPosition="start"
            label={`Material Queue ${metrics?.products?.pending ? `(${metrics.products.pending})` : ''}`}
          />
          <Tab icon={<Star />} iconPosition="start" label="Review Moderation" />
          <Tab icon={<Campaign />} iconPosition="start" label="Broadcast Announcement" />
          <Tab icon={<HistoryEdu />} iconPosition="start" label="Audit Trail" />
          <Tab icon={<LocalOffer />} iconPosition="start" label="Promotions & Coupons" />
        </Tabs>
      </Paper>

      {/* Tab 0: Overview & Metrics */}
      {activeTab === 0 && (
        <Box>
          {loadingMetrics ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="overline">Total Platform Users</Typography>
                      <People fontSize="medium" />
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics?.users?.total || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {metrics?.users?.active || 0} active ({metrics?.users?.tutors || 0} tutors/institutes)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText', borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="overline">Educational Materials</Typography>
                      <Inventory fontSize="medium" />
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics?.products?.total || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {metrics?.products?.pending || 0} awaiting approval
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="overline">Total Orders</Typography>
                      <Receipt fontSize="medium" />
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics?.orders?.total || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      LKR {metrics?.orders?.grossRevenue?.toFixed(2) || '0.00'} gross volume
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    bgcolor: (metrics?.products?.lowStock > 0) ? 'warning.light' : 'info.light',
                    color: 'white',
                    borderRadius: 2
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="overline">Stock & Reviews</Typography>
                      <Warning fontSize="medium" />
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics?.products?.lowStock || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Low stock physical items ({metrics?.reviews?.total || 0} reviews)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Action Shortcut Panels */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Urgent Moderation Tasks
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>Curriculum Materials pending review</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setActiveTab(2)}
                      >
                        Inspect ({metrics?.products?.pending || 0})
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>User feedback and ratings moderation</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setActiveTab(3)}
                      >
                        Review Feedback
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Multi-Channel System Announcement
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Instantly broadcast priority alerts, maintenance downtime notifications, or promotional messages to all students, tutors, and partner institutes.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Campaign />}
                    onClick={() => setActiveTab(4)}
                  >
                    Compose Broadcast
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 1: User Moderation */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search user by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }
              }}
              sx={{ minWidth: 260 }}
            />
            <TextField
              select
              size="small"
              label="Role"
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="tutor">Tutor</MenuItem>
              <MenuItem value="institute">Institute</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button
              variant="contained"
              onClick={() => fetchUsers(1)}
            >
              Apply Filter
            </Button>
          </Box>

          {loadingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Joined</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No users match criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.id} hover>
                          <TableCell>{`${u.first_name} ${u.last_name}`}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              sx={{ minWidth: 110 }}
                            >
                              <MenuItem value="student">Student</MenuItem>
                              <MenuItem value="tutor">Tutor</MenuItem>
                              <MenuItem value="institute">Institute</MenuItem>
                              <MenuItem value="admin">Admin</MenuItem>
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.is_active ? 'Active' : 'Suspended'}
                              color={u.is_active ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant={u.is_active ? 'outlined' : 'contained'}
                              color={u.is_active ? 'error' : 'success'}
                              onClick={() => setStatusDialog({ open: true, user: u, reason: '' })}
                            >
                              {u.is_active ? 'Suspend' : 'Reactivate'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={userTotalPages}
                  page={userPage}
                  onChange={(e, val) => fetchUsers(val)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Tab 2: Material / Product Moderation Queue */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Materials Approval Queue
            </Typography>
            <TextField
              select
              size="small"
              value={prodFilter}
              onChange={(e) => setProdFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="pending">Pending Approval</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="all">All Materials</MenuItem>
            </TextField>
          </Box>

          {loadingProds ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : moderationProducts.length === 0 ? (
            <Alert severity="info">No materials waiting in moderation queue.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Material Title</strong></TableCell>
                    <TableCell><strong>Seller / Tutor</strong></TableCell>
                    <TableCell><strong>Subject & Grade</strong></TableCell>
                    <TableCell><strong>Format</strong></TableCell>
                    <TableCell><strong>Price</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Moderation</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moderationProducts.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography fontWeight="bold">{p.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {p.seller ? `${p.seller.first_name} ${p.seller.last_name} (${p.seller.role})` : 'Unknown'}
                      </TableCell>
                      <TableCell>{`${p.subject} - ${p.grade_level}`}</TableCell>
                      <TableCell>
                        <Chip label={p.format?.toUpperCase() || 'DIGITAL'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>LKR {parseFloat(p.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.is_approved ? 'Approved' : 'Pending Review'}
                          color={p.is_approved ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {!p.is_approved ? (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => handleProductDecision(p.id, true)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => setRejectDialog({ open: true, product: p, feedback: '' })}
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleProductDecision(p.id, false, 'Unapproved by admin')}
                            >
                              Revoke
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Tab 3: Reviews Moderation */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Customer Reviews & Ratings Moderation
            </Typography>
            <TextField
              select
              size="small"
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All Reviews</MenuItem>
              <MenuItem value="pending">Pending Approval</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
            </TextField>
          </Box>

          {loadingReviews ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : moderationReviews.length === 0 ? (
            <Alert severity="info">No reviews found.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell><strong>Reviewer</strong></TableCell>
                    <TableCell><strong>Rating</strong></TableCell>
                    <TableCell><strong>Comment</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moderationReviews.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.product?.title || 'Unknown Product'}</TableCell>
                      <TableCell>{r.user ? `${r.user.first_name} ${r.user.last_name}` : 'Anonymous'}</TableCell>
                      <TableCell>
                        <Rating value={Number(r.rating)} size="small" readOnly />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="subtitle2">{r.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{r.comment}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.is_approved ? 'Approved' : 'Hidden'}
                          color={r.is_approved ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleReviewToggle(r.id, r.is_approved)}
                          >
                            {r.is_approved ? 'Hide' : 'Approve'}
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReviewDelete(r.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Tab 4: Multi-Channel Broadcast Announcement */}
      {activeTab === 4 && (
        <Paper sx={{ p: 4, borderRadius: 2, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
            Broadcast System Announcement
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Dispatches immediate notifications across student, tutor, and institutional inboxes on the EduMart platform.
          </Typography>

          <Box component="form" onSubmit={handleSendBroadcast} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Announcement Title"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. Scheduled Platform Upgrade Notice"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Target Audience"
                  value={broadcastForm.target_role}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, target_role: e.target.value })}
                >
                  <MenuItem value="all">Global Broadcast (All Users)</MenuItem>
                  <MenuItem value="student">Students Only</MenuItem>
                  <MenuItem value="tutor">Tutors Only</MenuItem>
                  <MenuItem value="institute">Institutes Only</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Priority Level"
                  value={broadcastForm.priority}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label="Announcement Message"
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Provide comprehensive details about the announcement..."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Campaign />}
                  disabled={sendingBroadcast}
                >
                  {sendingBroadcast ? 'Broadcasting...' : 'Send Broadcast Announcement'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Tab 5: Admin Audit Log */}
      {activeTab === 5 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Administrative Action Audit History
          </Typography>

          {loadingLogs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Alert severity="info">No audit logs recorded yet.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date & Time</strong></TableCell>
                    <TableCell><strong>Admin</strong></TableCell>
                    <TableCell><strong>Action Type</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{new Date(log.performed_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {log.admin ? `${log.admin.first_name} ${log.admin.last_name}` : 'System'}
                      </TableCell>
                      <TableCell>
                        <Chip label={log.action_type} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{log.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Tab 6: Promotions & Coupons */}
      {activeTab === 6 && (
        <Box>
          {/* Top KPI statistics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="overline">Total Coupons</Typography>
                    <LocalOffer fontSize="medium" />
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {couponSummary.total_coupons}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active campaigns & system defaults
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="overline">Active Promotions</Typography>
                    <CheckCircle fontSize="medium" />
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {couponSummary.active_coupons}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Available for checkout redemption
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="overline">Total Redemptions</Typography>
                    <Receipt fontSize="medium" />
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {couponSummary.total_redemptions}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Applied across learner orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Coupon Management Table Paper */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <div>
                <Typography variant="h6" fontWeight="bold">
                  Promotional Coupons & Voucher Codes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create, configure, and manage discount codes for marketing campaigns and student incentives.
                </Typography>
              </div>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchCoupons}
                  disabled={loadingCoupons}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => setCouponModalOpen(true)}
                >
                  Generate New Coupon
                </Button>
              </Stack>
            </Box>

            {loadingCoupons ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : coupons.length === 0 ? (
              <Alert severity="info">No promotional coupons configured yet. Click "Generate New Coupon" to create one.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Coupon Code</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Discount</strong></TableCell>
                      <TableCell><strong>Min Order</strong></TableCell>
                      <TableCell><strong>Usage Limit</strong></TableCell>
                      <TableCell><strong>Redemptions</strong></TableCell>
                      <TableCell><strong>Validity</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coupons.map((coupon) => {
                      const isExpired = coupon.end_date && new Date(coupon.end_date) < new Date();
                      const isLimitReached = coupon.usage_limit && coupon.used_count >= coupon.usage_limit;
                      return (
                        <TableRow key={coupon.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={coupon.code}
                                color={coupon.is_active && !isExpired && !isLimitReached ? 'primary' : 'default'}
                                variant={coupon.is_active ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}
                              />
                              <Tooltip title={copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}>
                                <IconButton size="small" onClick={() => handleCopyCode(coupon.code)}>
                                  {copiedCode === coupon.code ? <Done color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              {coupon.is_builtin && (
                                <Chip label="System Default" size="small" variant="outlined" color="info" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{coupon.description || '-'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              {coupon.discount_type === 'percentage'
                                ? `${coupon.discount_value}% OFF`
                                : `LKR ${parseFloat(coupon.discount_value).toFixed(2)} FLAT`}
                            </Typography>
                            {coupon.max_discount && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Max LKR {parseFloat(coupon.max_discount).toFixed(2)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {coupon.min_purchase > 0 ? `LKR ${parseFloat(coupon.min_purchase).toFixed(2)}` : 'None'}
                          </TableCell>
                          <TableCell>
                            {coupon.usage_limit ? `${coupon.usage_limit} uses` : 'Unlimited'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {coupon.used_count || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {coupon.end_date ? (
                              <Box>
                                <Typography variant="caption" display="block">
                                  Until {new Date(coupon.end_date).toLocaleDateString()}
                                </Typography>
                                {isExpired && <Chip label="Expired" size="small" color="error" variant="outlined" />}
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">No Expiry</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Switch
                                size="small"
                                checked={!!coupon.is_active}
                                onChange={() => handleToggleCouponStatus(coupon)}
                                color="success"
                              />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>
                                {coupon.is_active ? 'Active' : 'Disabled'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Delete Coupon">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteCoupon(coupon)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      )}

      {/* Suspend / Reactivate User Confirmation Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, user: null, reason: '' })}>
        <DialogTitle>
          {statusDialog.user?.is_active ? 'Suspend User Account' : 'Reactivate User Account'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {statusDialog.user?.is_active
              ? `Are you sure you want to suspend ${statusDialog.user?.email}? The user will be immediately blocked from signing in.`
              : `Are you sure you want to reactivate ${statusDialog.user?.email}?`}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Reason / Notes"
            value={statusDialog.reason}
            onChange={(e) => setStatusDialog({ ...statusDialog, reason: e.target.value })}
            placeholder="Administrative remarks..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, user: null, reason: '' })}>Cancel</Button>
          <Button
            onClick={handleConfirmStatusToggle}
            variant="contained"
            color={statusDialog.user?.is_active ? 'error' : 'success'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Product Listing Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, product: null, feedback: '' })}>
        <DialogTitle>Reject Educational Material</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please state the feedback reason for rejecting "{rejectDialog.product?.title}". The seller will receive this notification.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            required
            label="Rejection Reason & Revision Guidelines"
            value={rejectDialog.feedback}
            onChange={(e) => setRejectDialog({ ...rejectDialog, feedback: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, product: null, feedback: '' })}>Cancel</Button>
          <Button
            onClick={() => handleProductDecision(rejectDialog.product.id, false, rejectDialog.feedback)}
            variant="contained"
            color="error"
          >
            Reject Listing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Promotional Coupon Dialog */}
      <Dialog
        open={couponModalOpen}
        onClose={() => !submittingCoupon && setCouponModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOffer color="primary" /> Generate Promotional Coupon
        </DialogTitle>
        <form onSubmit={handleCreateCoupon}>
          <DialogContent dividers>
            {/* Quick Presets */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              ⚡ Quick Promotion Presets:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              {couponPresets.map((preset, idx) => (
                <Chip
                  key={idx}
                  label={preset.title}
                  onClick={() => handleApplyPreset(preset)}
                  clickable
                  color="primary"
                  variant="outlined"
                  sx={{ py: 1 }}
                />
              ))}
            </Stack>

            <Grid container spacing={2}>
              {/* Coupon Code with Random Generator Button */}
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  required
                  label="Coupon Code"
                  placeholder="e.g. EXAM2024 or EDU-FLASH"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Casino />}
                            onClick={handleGenerateRandomCode}
                            sx={{ textTransform: 'none' }}
                          >
                            Generate Random
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                  helperText="Alphanumeric promo code that learners will enter at checkout."
                />
              </Grid>

              {/* Discount Type */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Discount Type"
                  value={couponForm.discount_type}
                  onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed">Fixed Amount (LKR)</MenuItem>
                </TextField>
              </Grid>

              {/* Description */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Campaign Description"
                  placeholder="e.g. 20% discount on Advanced Level study materials"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                />
              </Grid>

              {/* Discount Value */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label={couponForm.discount_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (LKR)'}
                  value={couponForm.discount_value}
                  onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                  slotProps={{
                    htmlInput: { min: 1, max: couponForm.discount_type === 'percentage' ? 100 : 100000, step: 0.1 }
                  }}
                />
              </Grid>

              {/* Maximum Discount Cap (for percentage) */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Discount Cap (LKR)"
                  placeholder="Optional limit (e.g. 250)"
                  disabled={couponForm.discount_type !== 'percentage'}
                  value={couponForm.max_discount}
                  onChange={(e) => setCouponForm({ ...couponForm, max_discount: e.target.value })}
                  helperText={couponForm.discount_type === 'percentage' ? 'Max savings cap per order' : 'N/A for fixed amount'}
                />
              </Grid>

              {/* Minimum Purchase */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Purchase Order (LKR)"
                  value={couponForm.min_purchase}
                  onChange={(e) => setCouponForm({ ...couponForm, min_purchase: e.target.value })}
                  slotProps={{
                    htmlInput: { min: 0 }
                  }}
                  helperText="0 for no minimum"
                />
              </Grid>

              {/* Usage Limit */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Usage Limit"
                  placeholder="Unlimited if empty"
                  value={couponForm.usage_limit}
                  onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                  slotProps={{
                    htmlInput: { min: 1 }
                  }}
                  helperText="Max redemptions overall"
                />
              </Grid>

              {/* Expiry Date */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expiry Date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={couponForm.end_date}
                  onChange={(e) => setCouponForm({ ...couponForm, end_date: e.target.value })}
                  helperText="Leave empty for permanent"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setCouponModalOpen(false)} disabled={submittingCoupon}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submittingCoupon}
              startIcon={submittingCoupon ? <CircularProgress size={20} color="inherit" /> : <Add />}
            >
              {submittingCoupon ? 'Generating Coupon...' : 'Create & Activate Coupon'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;