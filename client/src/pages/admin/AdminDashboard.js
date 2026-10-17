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
  Tooltip
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
  Security
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

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (activeTab === 1) fetchUsers(1);
    if (activeTab === 2) fetchModerationProducts();
    if (activeTab === 3) fetchModerationReviews();
    if (activeTab === 5) fetchLogs();
  }, [activeTab, fetchUsers, fetchModerationProducts, fetchModerationReviews, fetchLogs]);

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
              <Grid item xs={12} sm={6} md={3}>
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

              <Grid item xs={12} sm={6} md={3}>
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

              <Grid item xs={12} sm={6} md={3}>
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
                      ${metrics?.orders?.grossRevenue?.toFixed(2) || '0.00'} gross volume
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
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
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
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
                      <TableCell>${parseFloat(p.price).toFixed(2)}</TableCell>
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Announcement Title"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. Scheduled Platform Upgrade Notice"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12}>
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

              <Grid item xs={12}>
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
    </Container>
  );
};

export default AdminDashboard;