import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Cancel,
  LocalShipping,
  Receipt,
  Description,
  Print,
  Replay,
  Lock,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Digital download state
  const [downloadingItemId, setDownloadingItemId] = useState(null);

  // Tax invoice state
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Shipment tracking modal state (Admin / Seller)
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    carrier: 'PromptX Express Courier',
    tracking_number: '',
    estimated_delivery: '',
    status: 'processing',
    milestone_label: '',
    milestone_description: '',
  });

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await orderService.getOrderById(id);
      setOrder(response.data);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setError(err.response?.data?.message || err.message || 'Could not load order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    try {
      await orderService.cancelOrder(order.id, cancelReason);
      setCancelOpen(false);
      setActionSuccess('Order was successfully cancelled.');
      fetchOrderDetail();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setError(err.response?.data?.message || err.message || 'Could not cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadItem = async (item) => {
    try {
      setDownloadingItemId(item.id);
      await orderService.downloadDigitalItem(order.id, item.id, item.product_title);
      setActionSuccess(`Secure digital download completed for "${item.product_title}".`);
    } catch (err) {
      console.error('Failed to download digital material:', err);
      setError(err.response?.data?.message || err.message || 'Download failed. Ensure payment is complete.');
    } finally {
      setDownloadingItemId(null);
    }
  };

  const handleOpenInvoice = async () => {
    setInvoiceOpen(true);
    setInvoiceLoading(true);
    try {
      const res = await orderService.getOrderInvoice(order.id);
      setInvoiceData(res.data);
    } catch (err) {
      console.error('Failed to load tax invoice:', err);
      setError('Could not retrieve tax invoice');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleUpdateTracking = async () => {
    try {
      setTrackingLoading(true);
      await orderService.updateOrderTracking(order.id, trackingForm);
      setActionSuccess('Shipment tracking and delivery milestones updated successfully.');
      setTrackingOpen(false);
      fetchOrderDetail();
    } catch (err) {
      console.error('Failed to update tracking:', err);
      setError(err.response?.data?.message || err.message || 'Could not update shipment tracking');
    } finally {
      setTrackingLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Order not found'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  const isCancellable = ['pending', 'processing'].includes(order.status?.toLowerCase());
  const dateFormatted = new Date(order.created_at).toLocaleString();
  const hasPhysical = order.items?.some((i) => i.is_physical) || !!order.carrier || !!order.tracking_number;

  const trackingSteps = ['Order Placed', 'Packaging & Warehouse', 'Shipped via Courier', 'Delivered'];
  const getActiveTrackingStep = () => {
    switch (order.status?.toLowerCase()) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'paid': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const hasDigital = order.items?.some((i) => i.is_digital);
  const isPaid = order.payment_status === 'paid' || order.status === 'paid';
  const canManageTracking = ['admin', 'seller', 'tutor', 'institute'].includes(user?.role);

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/orders')}>
          Back to All Orders
        </Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {canManageTracking && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<LocalShipping />}
              onClick={() => {
                setTrackingForm({
                  carrier: order.carrier || 'PromptX Express Courier',
                  tracking_number: order.tracking_number || '',
                  estimated_delivery: order.estimated_delivery
                    ? new Date(order.estimated_delivery).toISOString().split('T')[0]
                    : '',
                  status: order.status || 'processing',
                  milestone_label: '',
                  milestone_description: '',
                });
                setTrackingOpen(true);
              }}
            >
              Update Tracking
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Receipt />}
            onClick={handleOpenInvoice}
          >
            View Tax Invoice
          </Button>
          {isCancellable && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setCancelOpen(true)}
            >
              Cancel Order
            </Button>
          )}
        </Box>
      </Box>

      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setActionSuccess('')}>
          {actionSuccess}
        </Alert>
      )}

      {order.status === 'refunded' && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<Replay />}>
          <strong>Order Refunded:</strong> A full refund was credited to your original payment method.
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }} elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
          <div>
            <Typography variant="h5" fontWeight="bold">
              Order #{order.order_number}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Placed on {dateFormatted} {order.invoice_number ? `• Invoice: ${order.invoice_number}` : ''}
            </Typography>
          </div>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: { xs: 1, sm: 0 } }}>
            <Chip
              label={`STATUS: ${order.status?.toUpperCase()}`}
              color={
                order.status === 'paid' || order.status === 'delivered'
                  ? 'success'
                  : order.status === 'refunded'
                  ? 'secondary'
                  : 'primary'
              }
            />
            <Chip
              label={`PAYMENT: ${order.payment_status?.toUpperCase()}`}
              color={order.payment_status === 'paid' ? 'success' : order.payment_status === 'refunded' ? 'secondary' : 'warning'}
            />
          </Box>
        </Box>

        {/* Instant Digital Downloads Hub */}
        {hasDigital && (
          <Card
            variant="outlined"
            sx={{
              my: 3,
              p: 2.5,
              bgcolor: isPaid ? '#f0fdf4' : '#fffbeb',
              borderColor: isPaid ? 'success.light' : 'warning.light',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isPaid ? (
                  <CheckCircle color="success" sx={{ mr: 1, fontSize: 28 }} />
                ) : (
                  <Lock color="warning" sx={{ mr: 1, fontSize: 28 }} />
                )}
                <div>
                  <Typography variant="h6" fontWeight="bold" color={isPaid ? 'success.dark' : 'warning.dark'}>
                    {isPaid ? '⚡ Instant Digital Study Materials (Ready to Download)' : '🔒 Digital Study Materials (Locked - Awaiting Verification)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isPaid
                      ? 'Your purchased educational files are authenticated. Download the PDF files anytime to your device.'
                      : 'Digital downloads unlock automatically as soon as payment or bank deposit is verified.'}
                  </Typography>
                </div>
              </Box>
              <Chip
                label={isPaid ? 'INSTANT ACCESS UNLOCKED' : 'LOCKED (PENDING PAYMENT)'}
                color={isPaid ? 'success' : 'warning'}
                size="small"
              />
            </Box>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {order.items
                ?.filter((i) => i.is_digital)
                .map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.product_title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.product_subject} • {item.product_grade_level} • License ID: EDM-LIC-{order.id.slice(0, 8)}-{item.id.slice(0, 8)}
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={
                        downloadingItemId === item.id ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <Download />
                        )
                      }
                      disabled={!isPaid || downloadingItemId === item.id}
                      onClick={() => handleDownloadItem(item)}
                    >
                      {downloadingItemId === item.id ? 'Downloading...' : 'Download PDF'}
                    </Button>
                  </Paper>
                ))}
            </Stack>
          </Card>
        )}

        {/* Physical Shipment Tracking Card */}
        {hasPhysical && (
          <Card variant="outlined" sx={{ my: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping color="primary" sx={{ mr: 1 }} /> Parcel Delivery Tracking
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {order.carrier && (
                  <Chip label={`Carrier: ${order.carrier}`} size="small" color="primary" variant="outlined" />
                )}
                {order.tracking_number && (
                  <Chip label={`Tracking #: ${order.tracking_number}`} size="small" color="default" />
                )}
                {order.estimated_delivery && (
                  <Chip
                    label={`Est. Delivery: ${new Date(order.estimated_delivery).toLocaleDateString()}`}
                    size="small"
                    color="info"
                  />
                )}
              </Box>
            </Box>
            <Stepper activeStep={getActiveTrackingStep()} alternativeLabel sx={{ pt: 1, pb: 1 }}>
              {trackingSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Card>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Items Section */}
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Description sx={{ mr: 1 }} color="primary" /> Purchased Educational Materials
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><strong>Resource Title</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell align="right"><strong>Unit Price</strong></TableCell>
                <TableCell align="center"><strong>Quantity</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
                <TableCell align="center"><strong>Access / Delivery</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {item.product_title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.product_subject} • {item.product_grade_level}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.is_digital ? 'Digital E-Material' : 'Physical Printed'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{order.currency || 'LKR'} {parseFloat(item.unit_price).toFixed(2)}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {order.currency || 'LKR'} {parseFloat(item.total_price).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    {item.is_digital ? (
                      isPaid ? (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          startIcon={downloadingItemId === item.id ? <CircularProgress size={16} color="inherit" /> : <Download />}
                          disabled={downloadingItemId === item.id}
                          onClick={() => handleDownloadItem(item)}
                        >
                          {downloadingItemId === item.id ? 'Downloading...' : 'Download PDF'}
                        </Button>
                      ) : (
                        <Chip
                          icon={<Lock fontSize="small" />}
                          label="Locked (Awaiting Payment)"
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LocalShipping fontSize="small" sx={{ mr: 0.5 }} /> Parcel Shipping
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Addresses & Financial Summary */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShipping sx={{ mr: 1 }} color="action" /> Delivery & Billing Address
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                {order.shipping_address ? (
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {order.shipping_address.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shipping_address.street}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shipping_address.city}, {order.shipping_address.postalCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shipping_address.country}
                    </Typography>
                    {order.shipping_address.phone && (
                      <Typography variant="body2" color="text.secondary">
                        Phone: {order.shipping_address.phone}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No physical shipping address required (Digital E-Goods).
                  </Typography>
                )}
                {order.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      Notes / Tracking:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {order.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Receipt sx={{ mr: 1 }} color="action" /> Payment Breakdown
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">{order.currency || 'LKR'} {parseFloat(order.subtotal).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2">
                    {parseFloat(order.shipping_cost) > 0 ? `${order.currency || 'LKR'} ${parseFloat(order.shipping_cost).toFixed(2)}` : 'FREE'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Estimated Tax</Typography>
                  <Typography variant="body2">{order.currency || 'LKR'} {parseFloat(order.tax_amount).toFixed(2)}</Typography>
                </Box>
                {parseFloat(order.discount_amount) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="success.main">Promotional Discount</Typography>
                    <Typography variant="body2" color="success.main">
                      -{order.currency || 'LKR'} {parseFloat(order.discount_amount).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total Amount Paid</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {order.currency || 'LKR'} {parseFloat(order.total_amount).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Tax Invoice Dialog */}
      <Dialog open={invoiceOpen} onClose={() => setInvoiceOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Official Tax Invoice & Receipt</span>
          <Button startIcon={<Print />} variant="outlined" size="small" onClick={() => window.print()}>
            Print / Save
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {invoiceLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : invoiceData ? (
            <Box sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <div>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {invoiceData.seller?.company_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tax Registration ID: {invoiceData.seller?.tax_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoiceData.seller?.address}
                  </Typography>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    INVOICE: {invoiceData.invoice_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Order Ref: #{invoiceData.order_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(invoiceData.issue_date).toLocaleDateString()}
                  </Typography>
                </div>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Billed To:
              </Typography>
              <Typography variant="body2">{invoiceData.customer?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{invoiceData.customer?.email}</Typography>
              {invoiceData.customer?.billing_address && (
                <Typography variant="body2" color="text.secondary">
                  {invoiceData.customer.billing_address.street}, {invoiceData.customer.billing_address.city}
                </Typography>
              )}

              <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell>Item Description</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceData.items?.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{it.title} ({it.subject})</TableCell>
                        <TableCell>{it.type}</TableCell>
                        <TableCell align="right">{it.quantity}</TableCell>
                        <TableCell align="right">{invoiceData.currency || 'LKR'} {it.unit_price.toFixed(2)}</TableCell>
                        <TableCell align="right">{invoiceData.currency || 'LKR'} {it.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ maxWidth: 280, ml: 'auto', mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{invoiceData.currency || 'LKR'} {invoiceData.financials?.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">VAT / Tax:</Typography>
                  <Typography variant="body2">{invoiceData.currency || 'LKR'} {invoiceData.financials?.tax_amount.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Shipping:</Typography>
                  <Typography variant="body2">{invoiceData.currency || 'LKR'} {invoiceData.financials?.shipping_cost.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total Paid:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {invoiceData.currency || 'LKR'} {invoiceData.financials?.total_amount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography>Invoice could not be loaded.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Shipment & Tracking Management Dialog (Admin / Seller) */}
      <Dialog open={trackingOpen} onClose={() => setTrackingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Shipment & Delivery Tracking</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update courier carrier, tracking details, and append delivery milestones for Order #{order.order_number}.
          </DialogContentText>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label="Courier / Logistics Partner"
              value={trackingForm.carrier}
              onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
            >
              <MenuItem value="PromptX Express Courier">PromptX Express Courier</MenuItem>
              <MenuItem value="Domex Courier">Domex Courier</MenuItem>
              <MenuItem value="Pronto Lanka Courier">Pronto Lanka Courier</MenuItem>
              <MenuItem value="Sri Lanka Post (Registered)">Sri Lanka Post (Registered)</MenuItem>
              <MenuItem value="DHL Express">DHL Express</MenuItem>
              <MenuItem value="Other Express Courier">Other Express Courier</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Courier Tracking Number"
              placeholder="e.g. PRX-88291-LK"
              value={trackingForm.tracking_number}
              onChange={(e) => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
            />
            <TextField
              type="date"
              fullWidth
              label="Estimated Delivery Date"
              InputLabelProps={{ shrink: true }}
              value={trackingForm.estimated_delivery}
              onChange={(e) => setTrackingForm({ ...trackingForm, estimated_delivery: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Shipment Status"
              value={trackingForm.status}
              onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}
            >
              <MenuItem value="processing">Processing & Packaging</MenuItem>
              <MenuItem value="shipped">Shipped (Dispatched to Courier)</MenuItem>
              <MenuItem value="delivered">Delivered (Handed to Customer)</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="New Milestone Label (Optional)"
              placeholder="e.g. Package arrived at Colombo sorting hub"
              value={trackingForm.milestone_label}
              onChange={(e) => setTrackingForm({ ...trackingForm, milestone_label: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Milestone Description (Optional)"
              placeholder="Provide courier handover or dispatch notes"
              value={trackingForm.milestone_description}
              onChange={(e) => setTrackingForm({ ...trackingForm, milestone_description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackingOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateTracking}
            variant="contained"
            color="primary"
            disabled={trackingLoading}
          >
            {trackingLoading ? 'Updating...' : 'Save & Append Milestone'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle>Cancel Order #{order.order_number}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to cancel this order? If payment was already made, our refund process will be initiated.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>Keep Order</Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained" disabled={cancelLoading}>
            {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetail;
