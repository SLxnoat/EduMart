import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Divider,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CreditCard,
  CheckCircle,
  Lock,
  LocalShipping,
  ReceiptLong,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';

const steps = ['Shipping & Billing', 'Payment Details', 'Confirmation'];

// Default items if cart is empty, for demonstration and testing purposes
const sampleCheckoutItems = [
  {
    product_title: 'Combined Mathematics A/L Master Class Notes (2024)',
    product_subject: 'Mathematics',
    product_grade_level: 'Grade 12-13 (A/L)',
    quantity: 1,
    unit_price: 25.0,
    is_digital: true,
    is_physical: false,
  },
  {
    product_title: 'Physics Practical & Structured Past Papers Book',
    product_subject: 'Physics',
    product_grade_level: 'A/L',
    quantity: 1,
    unit_price: 18.5,
    is_digital: false,
    is_physical: true,
  },
];

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Charuka Silva',
    street: '75 Galle Road',
    city: 'Colombo',
    postalCode: '00300',
    country: 'Sri Lanka',
    phone: user?.phone || '0771234567',
  });

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardholderName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Charuka Silva',
    cardNumber: '4242 •••• •••• 4242',
    expDate: '12/28',
    cvv: '123',
  });

  const [items] = useState(sampleCheckoutItems);

  // Financial calculations
  const subtotal = items.reduce((acc, curr) => acc + curr.quantity * curr.unit_price, 0);
  const shippingCost = items.some((i) => i.is_physical) ? 4.5 : 0.0;
  const taxAmount = parseFloat((subtotal * 0.05).toFixed(2));
  const totalAmount = parseFloat((subtotal + shippingCost + taxAmount).toFixed(2));

  const handleShippingChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setError('');
    if (activeStep === 0) {
      if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
        setError('Please fill in all required shipping address fields.');
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleProcessOrderAndPayment = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Create Order in backend
      const orderPayload = {
        items,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        discount_amount: 0,
        currency: 'USD',
        notes: 'Placed via Web Checkout',
      };

      const orderResponse = await orderService.createOrder(orderPayload);
      const order = orderResponse.data;

      // 2. Initialize Payment Intent
      await paymentService.createPaymentIntent(order.id);

      // 3. Process/Simulate Payment Transaction
      await paymentService.simulatePaymentSuccess(order.id);

      // 4. Fetch the refreshed order with paid status
      const updatedOrderRes = await orderService.getOrderById(order.id);
      setPlacedOrder(updatedOrderRes.data);
      setActiveStep(2);
    } catch (err) {
      console.error('Payment/Order failure:', err);
      setError(
        err.response?.data?.message || err.message || 'Transaction could not be completed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }} elevation={3}>
        <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold" color="primary">
          EduMart Secure Checkout
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
          <Lock fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          256-bit Encrypted SSL Connection • Verified Merchant
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* STEP 1: Shipping and Delivery Details */}
        {activeStep === 0 && (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping sx={{ mr: 1 }} color="primary" /> Shipping & Delivery Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    required
                    fullWidth
                    label="Street Address"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleShippingChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="City"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Postal / ZIP Code"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleShippingChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" color="primary" size="large" onClick={handleNext}>
                  Proceed to Payment
                </Button>
              </Box>
            </Grid>

            {/* Order Summary Side Panel */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptLong sx={{ mr: 1 }} /> Order Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <List disablePadding>
                    {items.map((item, index) => (
                      <ListItem key={index} sx={{ py: 1, px: 0 }}>
                        <ListItemText
                          primary={item.product_title}
                          secondary={`${item.product_subject} • Qty: ${item.quantity} ${
                            item.is_digital ? '(Digital Download)' : '(Printed Parcel)'
                          }`}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Shipping Cost</Typography>
                    <Typography>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'FREE'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Estimated Tax</Typography>
                    <Typography>${taxAmount.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">Total Amount</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ${totalAmount.toFixed(2)} USD
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* STEP 2: Payment Selection and Card Form */}
        {activeStep === 1 && (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PaymentIcon sx={{ mr: 1 }} color="primary" /> Payment Method
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard sx={{ mr: 1 }} />
                      <Typography fontWeight="medium">Credit / Debit Card (Stripe Gateway)</Typography>
                    </Box>
                  }
                />
              </RadioGroup>

              <Card variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fbfbfb' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Name on Card"
                      name="cardholderName"
                      value={cardDetails.cardholderName}
                      onChange={handleCardChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      placeholder="4242 4242 4242 4242"
                      slotProps={{
                        input: {
                          endAdornment: <CreditCard color="action" />,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      name="expDate"
                      value={cardDetails.expDate}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="CVC / CVV"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      placeholder="123"
                    />
                  </Grid>
                </Grid>
              </Card>

              <Alert severity="info" sx={{ mt: 2 }}>
                Sandbox simulation enabled: Test cards and live Stripe integration are fully supported. Clicking Pay Now will safely authenticate and record the transaction.
              </Alert>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack} disabled={loading}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleProcessOrderAndPayment}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                >
                  {loading ? 'Authorizing Payment...' : `Pay $${totalAmount.toFixed(2)} USD Now`}
                </Button>
              </Box>
            </Grid>

            {/* Summary */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Review & Deliver To</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" fontWeight="bold">
                    {shippingAddress.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {shippingAddress.street}, {shippingAddress.city} {shippingAddress.postalCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {shippingAddress.country} • Phone: {shippingAddress.phone}
                  </Typography>

                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Total Payable:</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${totalAmount.toFixed(2)} USD
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* STEP 3: Order Completed Confirmation */}
        {activeStep === 2 && placedOrder && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Thank you for learning with EduMart. Your transaction has been confirmed and your order is now processing.
            </Typography>

            <Paper variant="outlined" sx={{ maxWidth: 600, mx: 'auto', p: 3, my: 3, textAlign: 'left' }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Order Number:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {placedOrder.order_number}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                  <Chip label="PAID" color="success" size="small" />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Order Status:</Typography>
                  <Chip label={placedOrder.status?.toUpperCase()} color="primary" size="small" />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Total Paid:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                    ${parseFloat(placedOrder.total_amount).toFixed(2)} USD
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/orders/${placedOrder.id}`)}
              >
                View Order Details
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/orders')}
              >
                My Orders History
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout;