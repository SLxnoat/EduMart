import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ReceiptLong,
  Visibility,
  ShoppingBag,
  ArrowForward,
} from '@mui/icons-material';
import orderService from '../../services/orderService';

const getStatusChip = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'delivered':
      return <Chip label={status.toUpperCase()} color="success" size="small" />;
    case 'processing':
    case 'shipped':
      return <Chip label={status.toUpperCase()} color="primary" size="small" />;
    case 'cancelled':
    case 'failed':
      return <Chip label={status.toUpperCase()} color="error" size="small" />;
    case 'pending':
    default:
      return <Chip label={status ? status.toUpperCase() : 'PENDING'} color="warning" size="small" />;
  }
};

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await orderService.getMyOrders(page, 10);
      setOrders(response.data || []);
      setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.response?.data?.message || err.message || 'Could not load your orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handlePageChange = (event, value) => {
    fetchOrders(value);
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" component="h1" fontWeight="bold" display="flex" alignItems="center">
            <ReceiptLong sx={{ mr: 1, fontSize: 36 }} color="primary" /> My Purchase History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage all your purchased educational materials, orders, and receipts.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<ShoppingBag />}
          onClick={() => navigate('/products')}
        >
          Browse Catalog
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" fontWeight="medium" gutterBottom>
            No orders found yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            You haven't placed any orders yet. Discover comprehensive study notes, structured past papers, and digital educational resources in our catalog.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/checkout')}>
            Start Fast Checkout Demo
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }} elevation={2}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell><strong>Order Number</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Items</strong></TableCell>
                  <TableCell><strong>Total Amount</strong></TableCell>
                  <TableCell><strong>Payment</strong></TableCell>
                  <TableCell><strong>Order Status</strong></TableCell>
                  <TableCell align="center"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const dateStr = new Date(order.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {order.order_number}
                        </Typography>
                      </TableCell>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell>
                        {order.items?.length || 0} item(s)
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ${parseFloat(order.total_amount).toFixed(2)} {order.currency || 'USD'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(order.payment_status)}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(order.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default OrderList;
