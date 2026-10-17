import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Rating,
  Pagination,
  Divider
} from '@mui/material';
import {
  Storefront,
  AddBox,
  Inventory2,
  AttachMoney,
  Star,
  Warning,
  Refresh,
  Save
} from '@mui/icons-material';
import sellerService from '../../services/sellerService';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [stockEdits, setStockEdits] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: 'success' });

  const fetchDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const data = await sellerService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to load seller dashboard metrics', type: 'error' });
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  const fetchInventory = useCallback(async (targetPage = 1) => {
    setLoadingInventory(true);
    try {
      const data = await sellerService.getInventory({ page: targetPage, limit: 15 });
      setInventory(data.products || []);
      setTotalPages(data.totalPages || 1);
      setPage(targetPage);
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to load inventory', type: 'error' });
    } finally {
      setLoadingInventory(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchInventory(1);
    }
  }, [activeTab, fetchInventory]);

  const handleStockChange = (productId, value) => {
    setStockEdits((prev) => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleSaveStock = async (productId) => {
    const newQty = stockEdits[productId];
    if (newQty === undefined || isNaN(newQty) || Number(newQty) < 0) {
      setFeedbackMsg({ text: 'Please enter a valid non-negative quantity', type: 'error' });
      return;
    }

    try {
      await sellerService.updateStock(productId, Number(newQty));
      setFeedbackMsg({ text: 'Stock level updated successfully', type: 'success' });
      setInventory((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, stock_quantity: Number(newQty) } : item
        )
      );
      setStockEdits((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
      fetchDashboard();
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to update stock', type: 'error' });
    }
  };

  const metrics = dashboardData?.metrics || {};
  const recentReviews = dashboardData?.recentReviews || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Tutor & Seller Hub
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your educational publications, monitor sales earnings, and track stock
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddBox />}
            component={Link}
            to="/products/new"
          >
            Publish New Material
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchDashboard();
              if (activeTab === 1) fetchInventory(page);
            }}
          >
            Refresh
          </Button>
        </Box>
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

      {/* KPI Cards */}
      {loadingDashboard ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="overline">Published Materials</Typography>
                  <Inventory2 fontSize="medium" />
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {metrics.totalProducts || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {metrics.approvedProducts || 0} active ({metrics.pendingProducts || 0} pending)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="overline">Net Earnings</Typography>
                  <AttachMoney fontSize="medium" />
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  ${metrics.netEarnings?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Gross sales: ${metrics.grossSales?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="overline">Student Orders Sold</Typography>
                  <Storefront fontSize="medium" />
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {metrics.totalSalesCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Fulfilled orders across your materials
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                bgcolor: (metrics.lowStockCount > 0) ? 'warning.main' : 'info.main',
                color: 'white',
                borderRadius: 2
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="overline">Inventory Alerts</Typography>
                  <Warning fontSize="medium" />
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {metrics.lowStockCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Physical items with low stock (&le; 5 units)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<Storefront />} iconPosition="start" label="Overview & Student Feedback" />
          <Tab
            icon={<Inventory2 />}
            iconPosition="start"
            label={`Inventory Management (${metrics.totalProducts || 0})`}
          />
        </Tabs>
      </Paper>

      {/* Tab 0: Overview & Recent Student Feedback */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Student Reviews & Feedback
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Real-time verified ratings and comments left by students who purchased your materials.
          </Typography>

          {recentReviews.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No student reviews recorded yet. Reviews will automatically show here as students rate your materials.
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {recentReviews.map((rev) => (
                <Grid size={{ xs: 12, md: 6 }} key={rev.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {rev.product?.title || 'Material'}
                        </Typography>
                        <Rating value={Number(rev.rating)} size="small" readOnly />
                      </Box>
                      {rev.title && (
                        <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
                          {rev.title}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {rev.comment}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          By: {rev.user ? `${rev.user.first_name} ${rev.user.last_name}` : 'Student'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Tab 1: Inventory Management */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <div>
              <Typography variant="h6" fontWeight="bold">
                My Educational Publications & Stock
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update stock levels for physical items and inspect publishing approval status
              </Typography>
            </div>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddBox />}
              component={Link}
              to="/products/new"
            >
              Add Material
            </Button>
          </Box>

          {loadingInventory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : inventory.length === 0 ? (
            <Alert severity="info">
              You have not created any materials yet.{' '}
              <Link to="/products/new">Publish your first educational material now!</Link>
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Title & Curriculum</strong></TableCell>
                      <TableCell><strong>Format</strong></TableCell>
                      <TableCell><strong>Price</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Rating</strong></TableCell>
                      <TableCell><strong>Stock Quantity</strong></TableCell>
                      <TableCell align="right"><strong>Update Stock</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map((item) => {
                      const isPhysical = item.format === 'physical' || item.format === 'both';
                      const currentVal =
                        stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.stock_quantity;
                      const hasChanged =
                        stockEdits[item.id] !== undefined && Number(stockEdits[item.id]) !== item.stock_quantity;

                      return (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Typography fontWeight="bold">{item.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {`${item.subject} | ${item.grade_level}`}
                            </Typography>
                            {item.digitalAssets && item.digitalAssets.length > 0 && (
                              <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {item.digitalAssets.map((asset) => (
                                  <Chip
                                    key={asset.id}
                                    size="small"
                                    variant="outlined"
                                    color={asset.is_preview ? 'default' : 'primary'}
                                    label={`${asset.is_preview ? 'Preview' : 'Material'}: ${asset.file_name} (${(asset.file_size / (1024 * 1024)).toFixed(1)} MB)`}
                                    sx={{ fontSize: '0.68rem', height: 20 }}
                                  />
                                ))}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.format?.toUpperCase() || 'DIGITAL'}
                              size="small"
                              variant="outlined"
                              color={isPhysical ? 'warning' : 'primary'}
                            />
                          </TableCell>
                          <TableCell>${parseFloat(item.price).toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.is_approved ? 'Live Marketplace' : 'Pending Review'}
                              color={item.is_approved ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Star fontSize="small" sx={{ color: '#faaf00' }} />
                              <Typography variant="body2">{Number(item.rating_average || 0).toFixed(1)}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({item.rating_count || 0})
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {isPhysical ? (
                              <TextField
                                size="small"
                                type="number"
                                value={currentVal}
                                onChange={(e) => handleStockChange(item.id, e.target.value)}
                                slotProps={{ htmlInput: { min: 0 } }}
                                sx={{ width: 100 }}
                                error={Number(currentVal) <= 5}
                                helperText={Number(currentVal) <= 5 ? 'Low stock!' : ''}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Unlimited (Digital)
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {isPhysical && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Save />}
                                disabled={!hasChanged}
                                onClick={() => handleSaveStock(item.id)}
                              >
                                Save
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, val) => fetchInventory(val)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default SellerDashboard;
