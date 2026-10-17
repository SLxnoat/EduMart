import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Divider,
  Button,
  IconButton,
  TextField,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  ShoppingCart,
  Delete,
  BookmarkBorder,
  Bookmark,
  Add,
  Remove,
  ShoppingBag,
  ArrowForward,
  LocalOffer,
  LocalShipping,
  CheckCircle,
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    savedForLater,
    cartCount,
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    totalAmount,
    hasPhysicalItems,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleSaveForLater,
    removeFromSavedForLater,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const data = await applyCoupon(couponInput.trim());
      setCouponSuccess(`Applied coupon '${data.code}' (-LKR ${parseFloat(data.discount_amount).toFixed(2)})`);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.response?.data?.message || err.message || 'Invalid promotional coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0 && savedForLater.length === 0) {
    return (
      <Container maxWidth="md" sx={{ my: 6 }}>
        <Paper sx={{ p: { xs: 3, md: 6 }, textAlign: 'center', borderRadius: 2 }} elevation={2}>
          <ShoppingCart sx={{ fontSize: 72, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Your Shopping Cart is Empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Explore our curated catalog of past papers, model answers, revision guides, and teacher lecture packs.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingBag />}
            component={Link}
            to="/products"
          >
            Explore Catalog
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }} gutterBottom>
        <ShoppingCart sx={{ mr: 1, fontSize: 36 }} color="primary" /> Shopping Cart
        <Chip
          label={`${cartCount} item${cartCount === 1 ? '' : 's'}`}
          color="primary"
          size="small"
          sx={{ ml: 2, fontWeight: 'bold' }}
        />
      </Typography>

      <Grid container spacing={4}>
        {/* Main Cart Items List */}
        <Grid size={{ xs: 12, md: 8 }}>
          {cartItems.length > 0 ? (
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }} elevation={2}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell><strong>Educational Resource</strong></TableCell>
                      <TableCell align="center"><strong>Price</strong></TableCell>
                      <TableCell align="center"><strong>Quantity</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => {
                      const itemPrice = parseFloat(item.price) || 0;
                      const itemQty = parseInt(item.quantity, 10) || 1;
                      const itemTotal = (itemPrice * itemQty).toFixed(2);

                      return (
                        <TableRow key={item.product_id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {item.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                label={item.is_digital ? 'Digital E-Material' : 'Physical Printed'}
                                color={item.is_digital ? 'info' : 'default'}
                                variant="outlined"
                              />
                              {item.subject && (
                                <Chip size="small" label={item.subject} variant="outlined" />
                              )}
                              {item.grade_level && (
                                <Chip size="small" label={item.grade_level} variant="outlined" />
                              )}
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            LKR {itemPrice.toFixed(2)}
                          </TableCell>

                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item.product_id, itemQty - 1)}
                                aria-label="decrease quantity"
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography sx={{ mx: 1.5, minWidth: 20, textAlign: 'center', fontWeight: 'bold' }}>
                                {itemQty}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item.product_id, itemQty + 1)}
                                aria-label="increase quantity"
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="subtitle2" fontWeight="bold">
                              LKR {itemTotal}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip title="Save for later">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => toggleSaveForLater(item.product_id)}
                              >
                                <BookmarkBorder fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove item">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => removeFromCart(item.product_id)}
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

              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button color="error" onClick={clearCart} size="small">
                  Clear Cart
                </Button>
                <Button component={Link} to="/products" color="primary">
                  Continue Shopping
                </Button>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', mb: 4, borderRadius: 2 }}>
              <Typography variant="body1" color="text.secondary">
                No active items in cart. Your saved items are listed below.
              </Typography>
            </Paper>
          )}

          {/* Saved for Later Section */}
          {savedForLater.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }} gutterBottom>
                <Bookmark sx={{ mr: 1 }} color="primary" /> Saved for Later ({savedForLater.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {savedForLater.map((saved) => (
                      <TableRow key={saved.product_id}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {saved.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            LKR {parseFloat(saved.price).toFixed(2)} • {saved.subject || 'Resource'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => toggleSaveForLater(saved.product_id)}
                            sx={{ mr: 1 }}
                          >
                            Move to Cart
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="delete saved item"
                            onClick={() => removeFromSavedForLater(saved.product_id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>

        {/* Order Summary & Coupon Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, position: 'sticky', top: 90 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Subtotal ({cartCount} items)</Typography>
                <Typography fontWeight="medium">LKR {subtotal.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShipping fontSize="small" sx={{ mr: 0.5 }} />
                  Estimated Shipping
                </Typography>
                <Typography fontWeight="medium">
                  {shippingCost > 0 ? `LKR ${shippingCost.toFixed(2)}` : 'FREE'}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {hasPhysicalItems ? 'Standard physical parcel shipping applied.' : 'Instant digital material delivery included.'}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Estimated Tax (5%)</Typography>
                <Typography fontWeight="medium">LKR {taxAmount.toFixed(2)}</Typography>
              </Box>

              {appliedCoupon && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalOffer fontSize="small" sx={{ mr: 0.5 }} />
                    Promo ({appliedCoupon.code})
                  </Typography>
                  <Typography color="success.main" fontWeight="bold">
                    -LKR {discountAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Total</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  LKR {totalAmount.toFixed(2)}
                </Typography>
              </Box>

              {/* Coupon Form */}
              <Box component="form" onSubmit={handleApplyCoupon} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalOffer sx={{ mr: 0.5, fontSize: 18 }} /> Apply Promotional Coupon
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="e.g. EDUMART10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                  >
                    Apply
                  </Button>
                </Box>

                {couponSuccess && (
                  <Alert severity="success" sx={{ mt: 1, py: 0.5 }} onClose={() => setCouponSuccess('')}>
                    {couponSuccess}
                  </Alert>
                )}
                {couponError && (
                  <Alert severity="error" sx={{ mt: 1, py: 0.5 }} onClose={() => setCouponError('')}>
                    {couponError}
                  </Alert>
                )}

                {appliedCoupon && (
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                      icon={<CheckCircle color="success" />}
                      label={`${appliedCoupon.code}: ${appliedCoupon.description || 'Discount Applied'}`}
                      color="success"
                      variant="outlined"
                      size="small"
                      onDelete={removeCoupon}
                    />
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                endIcon={<ArrowForward />}
                disabled={cartItems.length === 0}
                onClick={handleProceedToCheckout}
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;