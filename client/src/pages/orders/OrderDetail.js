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
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Cancel,
  CheckCircle,
  LocalShipping,
  Receipt,
  Description,
} from '@mui/icons-material';
import orderService from '../../services/orderService';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

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

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/orders')}>
          Back to All Orders
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

      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setActionSuccess('')}>
          {actionSuccess}
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }} elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
          <div>
            <Typography variant="h5" fontWeight="bold">
              Order #{order.order_number}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Placed on {dateFormatted}
            </Typography>
          </div>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: { xs: 1, sm: 0 } }}>
            <Chip
              label={`STATUS: ${order.status?.toUpperCase()}`}
              color={order.status === 'paid' || order.status === 'delivered' ? 'success' : 'primary'}
            />
            <Chip
              label={`PAYMENT: ${order.payment_status?.toUpperCase()}`}
              color={order.payment_status === 'paid' ? 'success' : 'warning'}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Items Section */}
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
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
                  <TableCell align="right">${parseFloat(item.unit_price).toFixed(2)}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${parseFloat(item.total_price).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    {item.is_digital ? (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        startIcon={<Download />}
                        onClick={() =>
                          alert(`Digital asset access granted! Secure download initialized for: ${item.product_title}`)
                        }
                      >
                        Download PDF
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" justifyContent="center">
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
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom display="flex" alignItems="center">
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

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom display="flex" alignItems="center">
                  <Receipt sx={{ mr: 1 }} color="action" /> Payment Breakdown
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">${parseFloat(order.subtotal).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2">
                    {parseFloat(order.shipping_cost) > 0 ? `$${parseFloat(order.shipping_cost).toFixed(2)}` : 'FREE'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Estimated Tax</Typography>
                  <Typography variant="body2">${parseFloat(order.tax_amount).toFixed(2)}</Typography>
                </Box>
                {parseFloat(order.discount_amount) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="success.main">Promotional Discount</Typography>
                    <Typography variant="body2" color="success.main">
                      -${parseFloat(order.discount_amount).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total Amount Paid</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    ${parseFloat(order.total_amount).toFixed(2)} {order.currency || 'USD'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

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
