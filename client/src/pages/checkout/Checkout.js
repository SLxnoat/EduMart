import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Stack,
} from '@mui/material';
import {
  CreditCard,
  CheckCircle,
  Lock,
  LocalShipping,
  ReceiptLong,
  Payment as PaymentIcon,
  AccountBalance,
  AccountBalanceWallet,
  QrCode2,
  LocalAtm,
  Download,
  AccessTime,
  LocalOffer,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
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
  const {
    cartItems,
    clearCart,
    appliedCoupon,
    discountAmount: cartDiscountAmount,
    applyCoupon,
    removeCoupon
  } = useCart();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // In-checkout coupon state
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState({ text: '', type: 'success' });

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
  const [bankDetails, setBankDetails] = useState({
    slipNumber: 'TXN-98234120',
    bankName: 'Commercial Bank of Ceylon',
    depositorName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Charuka Silva',
  });
  const [walletDetails, setWalletDetails] = useState({
    walletType: 'LankaQR',
    mobileNumber: user?.phone || '0771234567',
  });
  const [paypalDetails, setPaypalDetails] = useState({
    paypalEmail: user?.email || 'student@edumart.lk',
  });
  const [gatewayConfig, setGatewayConfig] = useState(null);
  const [downloadingItemId, setDownloadingItemId] = useState(null);
  const [downloadMsg, setDownloadMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        if (paymentService.getPaymentConfig) {
          const res = await paymentService.getPaymentConfig();
          if (isMounted && res?.data) {
            setGatewayConfig(res.data);
          }
        }
      } catch (err) {
        // Fallback silently
      }
    };
    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const items = (cartItems && cartItems.length > 0)
    ? cartItems.map((item) => ({
        product_id: item.product_id || item.id,
        product_title: item.product_title || item.title || 'Educational Resource',
        product_subject: item.product_subject || item.subject || 'General',
        product_grade_level: item.product_grade_level || item.grade_level || 'A/L',
        quantity: item.quantity || 1,
        unit_price: parseFloat(item.unit_price || item.price || 0),
        is_digital: item.is_digital !== undefined ? !!item.is_digital : (item.format === 'digital' || item.format === 'both'),
        is_physical: item.is_physical !== undefined ? !!item.is_physical : (item.format === 'physical' || item.format === 'both'),
      }))
    : sampleCheckoutItems;

  // Financial calculations
  const subtotal = items.reduce((acc, curr) => acc + curr.quantity * curr.unit_price, 0);
  const hasPhysical = items.some((i) => i.is_physical);
  const hasDigital = items.some((i) => i.is_digital);
  const isCodAllowed = hasPhysical && !hasDigital;
  const shippingCost = hasPhysical ? 4.5 : 0.0;
  const taxAmount = parseFloat((subtotal * 0.05).toFixed(2));

  // Compute coupon discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * parseFloat(appliedCoupon.discount_value)) / 100;
      if (appliedCoupon.max_discount && discountAmount > parseFloat(appliedCoupon.max_discount)) {
        discountAmount = parseFloat(appliedCoupon.max_discount);
      }
    } else {
      discountAmount = Math.min(subtotal, parseFloat(appliedCoupon.discount_value) || 0);
    }
    discountAmount = parseFloat(discountAmount.toFixed(2));
  } else if (cartDiscountAmount) {
    discountAmount = parseFloat(cartDiscountAmount) || 0;
  }

  const totalAmount = parseFloat(
    Math.max(0, subtotal + shippingCost + taxAmount - discountAmount).toFixed(2)
  );

  // Reset payment method from COD if cart contains digital items or no physical items
  useEffect(() => {
    if (paymentMethod === 'cod' && !isCodAllowed) {
      setPaymentMethod('card');
    }
  }, [isCodAllowed, paymentMethod]);

  const handleInstantDownload = async (item) => {
    if (!placedOrder) return;
    try {
      setDownloadingItemId(item.id);
      setDownloadMsg('');
      await orderService.downloadDigitalItem(placedOrder.id, item.id, item.product_title);
      setDownloadMsg(`Downloaded "${item.product_title}" successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Download failed');
    } finally {
      setDownloadingItemId(null);
    }
  };

  const handleShippingChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleBankChange = (e) => {
    setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
  };

  const handleWalletChange = (e) => {
    setWalletDetails({ ...walletDetails, [e.target.name]: e.target.value });
  };

  const handlePaypalChange = (e) => {
    setPaypalDetails({ ...paypalDetails, [e.target.name]: e.target.value });
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

  const handleApplyCheckoutCoupon = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!checkoutCouponCode.trim()) return;
    setCouponApplying(true);
    setCouponFeedback({ text: '', type: 'success' });
    try {
      if (applyCoupon) {
        const normalized = checkoutCouponCode.trim().toUpperCase();
        await applyCoupon(normalized);
        setCouponFeedback({ text: `Promotional coupon '${normalized}' applied!`, type: 'success' });
        setCheckoutCouponCode('');
      }
    } catch (err) {
      setCouponFeedback({
        text: err.response?.data?.message || err.message || 'Invalid promotional coupon code',
        type: 'error',
      });
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCheckoutCoupon = () => {
    if (removeCoupon) {
      removeCoupon();
      setCouponFeedback({ text: 'Coupon removed from order', type: 'info' });
    }
  };

  const handleProcessOrderAndPayment = async () => {
    setError('');
    setLoading(true);

    try {
      const normalizedMethod =
        paymentMethod === 'card'
          ? 'credit_card'
          : paymentMethod === 'paypal'
          ? 'paypal'
          : paymentMethod === 'bank_transfer'
          ? 'bank_transfer'
          : paymentMethod === 'digital_wallet'
          ? 'digital_wallet'
          : 'cash_on_delivery';

      const paymentDetails =
        normalizedMethod === 'credit_card'
          ? cardDetails
          : normalizedMethod === 'paypal'
          ? paypalDetails
          : normalizedMethod === 'bank_transfer'
          ? bankDetails
          : normalizedMethod === 'digital_wallet'
          ? walletDetails
          : { method: 'COD', courier: 'PromptX' };

      // 1. Create Order in backend
      const orderPayload = {
        items,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon?.code || undefined,
        currency: 'LKR',
        notes: `Placed via Web Checkout (${normalizedMethod.toUpperCase()})`,
      };

      const orderResponse = await orderService.createOrder(orderPayload);
      const order = orderResponse.data;

      // 2. Initialize Payment Intent
      await paymentService.createPaymentIntent(order.id);

      // 3. Process Payment Transaction (Real Gateway with Sandbox Fallback)
      const payFn = paymentService.processPayment || paymentService.simulatePaymentSuccess;
      const paymentResult = await payFn(order.id, normalizedMethod, paymentDetails);
      if (!paymentResult && paymentService.simulatePaymentSuccess) {
        await paymentService.simulatePaymentSuccess(order.id, normalizedMethod, paymentDetails);
      }

      // 4. Fetch the refreshed order with paid status
      const updatedOrderRes = await orderService.getOrderById(order.id);
      setPlacedOrder(updatedOrderRes.data);
      if (clearCart) {
        clearCart();
      }
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
                          LKR {(item.quantity * item.unit_price).toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography>LKR {subtotal.toFixed(2)}</Typography>
                  </Box>
                  {discountAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="success.main" fontWeight="medium">
                        Promotional Discount ({appliedCoupon?.code || 'COUPON'})
                      </Typography>
                      <Typography color="success.main" fontWeight="bold">
                        -LKR {discountAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Shipping Cost</Typography>
                    <Typography>{shippingCost > 0 ? `LKR ${shippingCost.toFixed(2)}` : 'FREE'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Estimated Tax</Typography>
                    <Typography>LKR {taxAmount.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">Total Amount</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      LKR {totalAmount.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Promo Code Input Box */}
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalOffer fontSize="inherit" sx={{ mr: 0.5 }} /> HAVE A PROMOTIONAL CODE?
                    </Typography>
                    {appliedCoupon ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f0fdf4', p: 1, borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <CheckCircle color="success" fontSize="small" />
                          <div>
                            <Typography variant="body2" fontWeight="bold" color="success.dark">
                              {appliedCoupon.code}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appliedCoupon.description || 'Promotional discount applied'}
                            </Typography>
                          </div>
                        </Box>
                        <Button size="small" color="error" onClick={handleRemoveCheckoutCoupon}>
                          Remove
                        </Button>
                      </Box>
                    ) : (
                      <Box component="form" onSubmit={handleApplyCheckoutCoupon} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="e.g. EDUMART10"
                          value={checkoutCouponCode}
                          onChange={(e) => setCheckoutCouponCode(e.target.value.toUpperCase())}
                        />
                        <Button
                          variant="outlined"
                          type="submit"
                          disabled={couponApplying || !checkoutCouponCode.trim()}
                        >
                          Apply
                        </Button>
                      </Box>
                    )}
                    {couponFeedback.text && (
                      <Alert
                        severity={couponFeedback.type}
                        sx={{ mt: 1, py: 0.2 }}
                        onClose={() => setCouponFeedback({ text: '', type: 'success' })}
                      >
                        {couponFeedback.text}
                      </Alert>
                    )}
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
                <Paper variant="outlined" sx={{ mb: 1.5, p: 1.5, borderRadius: 2, borderColor: paymentMethod === 'card' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="card"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCard sx={{ mr: 1 }} color="primary" />
                        <Typography fontWeight="bold">Credit / Debit Card (Stripe Gateway)</Typography>
                      </Box>
                    }
                  />
                </Paper>

                <Paper variant="outlined" sx={{ mb: 1.5, p: 1.5, borderRadius: 2, borderColor: paymentMethod === 'paypal' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceWallet sx={{ mr: 1 }} color="info" />
                        <Typography fontWeight="bold">PayPal Express Checkout</Typography>
                      </Box>
                    }
                  />
                </Paper>

                <Paper variant="outlined" sx={{ mb: 1.5, p: 1.5, borderRadius: 2, borderColor: paymentMethod === 'bank_transfer' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="bank_transfer"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalance sx={{ mr: 1 }} color="secondary" />
                        <Typography fontWeight="bold">Direct Bank Deposit / Wire Transfer</Typography>
                      </Box>
                    }
                  />
                </Paper>

                <Paper variant="outlined" sx={{ mb: 1.5, p: 1.5, borderRadius: 2, borderColor: paymentMethod === 'digital_wallet' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="digital_wallet"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <QrCode2 sx={{ mr: 1 }} color="success" />
                        <Typography fontWeight="bold">Digital Mobile Wallet & LankaQR (FriMi / eZ Cash)</Typography>
                      </Box>
                    }
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    borderColor: paymentMethod === 'cod' ? 'primary.main' : 'divider',
                    opacity: isCodAllowed ? 1 : 0.6,
                    bgcolor: isCodAllowed ? 'transparent' : 'action.hover',
                  }}
                >
                  <FormControlLabel
                    value="cod"
                    disabled={!isCodAllowed}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalAtm sx={{ mr: 1 }} color="warning" />
                          <Typography fontWeight="bold">Cash on Delivery (COD)</Typography>
                        </Box>
                        {!isCodAllowed && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                            {hasDigital
                              ? 'Unavailable: Cart includes digital materials. Use Card, PayPal, or Digital Wallet for instant download access.'
                              : 'Available for physical book parcel orders only.'}
                          </Typography>
                        )}
                        {isCodAllowed && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                            Pay with cash to the PromptX courier upon package arrival.
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>

              {/* Sub-form: Card */}
              {paymentMethod === 'card' && (
                <Card variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fbfbfb', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                    Card Payment Details
                  </Typography>
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
              )}

              {/* Sub-form: PayPal */}
              {paymentMethod === 'paypal' && (
                <Card variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="info.main">
                    PayPal Account Details
                  </Typography>
                  <TextField
                    fullWidth
                    label="PayPal Account Email"
                    name="paypalEmail"
                    value={paypalDetails.paypalEmail}
                    onChange={handlePaypalChange}
                    sx={{ my: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    You will be securely routed through PayPal sandbox one-touch authorization.
                  </Typography>
                </Card>
              )}

              {/* Sub-form: Bank Transfer */}
              {paymentMethod === 'bank_transfer' && (
                <Card variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fbfbfb', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="secondary.main">
                    Official Beneficiary Bank Details
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#f1f5f9' }}>
                    {gatewayConfig?.bankTransfer?.accounts?.length > 0 ? (
                      gatewayConfig.bankTransfer.accounts.map((acc, idx) => (
                        <Box key={idx} sx={{ mb: idx < gatewayConfig.bankTransfer.accounts.length - 1 ? 1.5 : 0 }}>
                          <Typography variant="body2"><strong>Bank:</strong> {acc.bankName} {acc.branch ? `(${acc.branch})` : ''}</Typography>
                          <Typography variant="body2"><strong>Account Name:</strong> {acc.accountName}</Typography>
                          <Typography variant="body2"><strong>Account Number:</strong> {acc.accountNumber} {acc.swift ? `• SWIFT: ${acc.swift}` : ''}</Typography>
                          {idx < gatewayConfig.bankTransfer.accounts.length - 1 && <Divider sx={{ my: 1 }} />}
                        </Box>
                      ))
                    ) : (
                      <>
                        <Typography variant="body2"><strong>Bank:</strong> Commercial Bank of Ceylon / Bank of Ceylon</Typography>
                        <Typography variant="body2"><strong>Account Name:</strong> EduMart Educational Services (Pvt) Ltd</Typography>
                        <Typography variant="body2"><strong>Account Number:</strong> 8004592019</Typography>
                        <Typography variant="body2"><strong>Branch:</strong> Colombo City Corporate</Typography>
                      </>
                    )}
                  </Paper>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Depositor Full Name"
                        name="depositorName"
                        value={bankDetails.depositorName}
                        onChange={handleBankChange}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Deposit Slip / Transaction Reference"
                        name="slipNumber"
                        value={bankDetails.slipNumber}
                        onChange={handleBankChange}
                        placeholder="TXN-98234120"
                      />
                    </Grid>
                  </Grid>
                </Card>
              )}

              {/* Sub-form: Digital Wallet */}
              {paymentMethod === 'digital_wallet' && (
                <Card variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fbfbfb', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="success.main">
                    Digital Mobile Wallet & LankaQR
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        label="Wallet Provider"
                        name="walletType"
                        value={walletDetails.walletType}
                        onChange={handleWalletChange}
                      >
                        <MenuItem value="LankaQR">LankaQR Instant Pay</MenuItem>
                        <MenuItem value="FriMi">FriMi Mobile Wallet</MenuItem>
                        <MenuItem value="eZCash">eZ Cash / Dialog Pay</MenuItem>
                        <MenuItem value="AppleGooglePay">Apple Pay / Google Pay</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Registered Mobile Number"
                        name="mobileNumber"
                        value={walletDetails.mobileNumber}
                        onChange={handleWalletChange}
                      />
                    </Grid>
                  </Grid>
                </Card>
              )}

              {/* Sub-form: COD */}
              {paymentMethod === 'cod' && (
                <Card variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fffbeb', borderRadius: 2, borderColor: 'warning.light' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="warning.dark">
                    Cash on Delivery Instructions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please prepare the exact sum of <strong>LKR {totalAmount.toFixed(2)}</strong> in cash. The PromptX Courier delivery representative will issue an official printed tax invoice receipt upon parcel handover.
                  </Typography>
                </Card>
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                Sandbox & Live gateway enabled: Transactions are processed securely with SSL encryption and recorded in database audit records.
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
                  {loading ? 'Authorizing Payment...' : `Pay LKR ${totalAmount.toFixed(2)} Now`}
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
                  {discountAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="success.main" variant="body2" fontWeight="medium">
                        Promotional Discount ({appliedCoupon?.code || 'COUPON'}):
                      </Typography>
                      <Typography color="success.main" variant="body2" fontWeight="bold">
                        -LKR {discountAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Total Payable:</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      LKR {totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  {appliedCoupon && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f0fdf4', p: 1, borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <CheckCircle color="success" fontSize="small" />
                        <Typography variant="body2" fontWeight="bold" color="success.dark">
                          Promo '{appliedCoupon.code}' Applied
                        </Typography>
                      </Box>
                      <Button size="small" color="error" onClick={handleRemoveCheckoutCoupon}>
                        Remove
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* STEP 3: Order Completed Confirmation */}
        {activeStep === 2 && placedOrder && (() => {
          const isPaid = placedOrder.payment_status === 'paid' || placedOrder.status === 'paid';
          const isBankPending = paymentMethod === 'bank_transfer' && !isPaid;
          const orderDigitalItems = placedOrder.items?.filter((i) => i.is_digital) || [];
          const orderPhysicalItems = placedOrder.items?.filter((i) => i.is_physical) || [];

          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {isPaid ? (
                <CheckCircle sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
              ) : isBankPending ? (
                <AccessTime sx={{ fontSize: 72, color: 'warning.main', mb: 2 }} />
              ) : (
                <LocalShipping sx={{ fontSize: 72, color: 'primary.main', mb: 2 }} />
              )}

              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {isPaid
                  ? 'Payment Successful & Access Unlocked!'
                  : isBankPending
                  ? 'Order Submitted - Awaiting Bank Verification'
                  : 'Order Confirmed - Cash on Delivery Scheduled'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 650, mx: 'auto' }}>
                {isPaid
                  ? 'Thank you for learning with EduMart! Your transaction has been confirmed and instant digital study materials are ready for download.'
                  : isBankPending
                  ? 'Your bank wire deposit slip has been submitted. Our administration team will verify the payment shortly, after which your digital resources will unlock automatically.'
                  : 'Your physical material parcel has been scheduled for dispatch via PromptX Express Courier. Please prepare the exact cash amount for handover upon delivery.'}
              </Typography>

              <Paper variant="outlined" sx={{ maxWidth: 650, mx: 'auto', p: 3, my: 3, textAlign: 'left' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Order Number:</Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {placedOrder.order_number}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                    <Chip
                      label={isPaid ? 'PAID' : isBankPending ? 'PENDING VERIFICATION' : 'DUE ON DELIVERY'}
                      color={isPaid ? 'success' : isBankPending ? 'warning' : 'info'}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                    <Chip
                      label={
                        paymentMethod === 'card'
                          ? 'Credit / Debit Card'
                          : paymentMethod === 'paypal'
                          ? 'PayPal Express'
                          : paymentMethod === 'bank_transfer'
                          ? 'Bank Wire Transfer'
                          : paymentMethod === 'digital_wallet'
                          ? `${walletDetails.walletType || 'Digital Wallet'}`
                          : 'Cash on Delivery (COD)'
                      }
                      color="secondary"
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Order Status:</Typography>
                    <Chip label={placedOrder.status?.toUpperCase()} color="primary" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 0.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {isPaid ? 'Total Paid:' : 'Total Amount Due:'}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color={isPaid ? 'success.main' : 'primary.main'}>
                        LKR {parseFloat(placedOrder.total_amount).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Instant Digital Downloads Card */}
              {orderDigitalItems.length > 0 && (
                <Card
                  variant="outlined"
                  sx={{
                    maxWidth: 650,
                    mx: 'auto',
                    mb: 3,
                    p: 2.5,
                    bgcolor: isPaid ? '#f0fdf4' : '#fffbeb',
                    borderColor: isPaid ? 'success.light' : 'warning.light',
                    borderRadius: 2,
                    textAlign: 'left',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Download color={isPaid ? 'success' : 'warning'} sx={{ mr: 1, fontSize: 28 }} />
                    <div>
                      <Typography variant="h6" fontWeight="bold" color={isPaid ? 'success.dark' : 'warning.dark'}>
                        {isPaid ? '⚡ Instant Digital Downloads (Ready Now)' : '🔒 Digital Materials (Locked Pending Verification)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isPaid
                          ? 'Your authenticated study materials are unlocked. Click to download the PDFs now:'
                          : 'Downloads will automatically become available once the bank transfer is confirmed.'}
                      </Typography>
                    </div>
                  </Box>

                  {downloadMsg && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setDownloadMsg('')}>
                      {downloadMsg}
                    </Alert>
                  )}

                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    {orderDigitalItems.map((item) => (
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
                            {item.product_subject} • {item.product_grade_level} • License ID: EDM-LIC-{placedOrder.id.slice(0, 8)}
                          </Typography>
                        </div>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={
                            downloadingItemId === item.id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Download />
                            )
                          }
                          disabled={!isPaid || downloadingItemId === item.id}
                          onClick={() => handleInstantDownload(item)}
                        >
                          {downloadingItemId === item.id ? 'Downloading...' : 'Download PDF'}
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Card>
              )}

              {/* Physical Parcel Courier Tracking Card */}
              {orderPhysicalItems.length > 0 && (
                <Card
                  variant="outlined"
                  sx={{
                    maxWidth: 650,
                    mx: 'auto',
                    mb: 3,
                    p: 2.5,
                    bgcolor: '#f8fafc',
                    borderColor: 'primary.light',
                    borderRadius: 2,
                    textAlign: 'left',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalShipping color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                      📦 Parcel Courier Delivery Tracking
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Recipient: <strong>{shippingAddress.fullName}</strong> • Delivery Address:{' '}
                    <strong>{shippingAddress.street}, {shippingAddress.city}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Courier: <strong>PromptX Express Courier</strong> • Estimated dispatch within 24-48 hours. Real-time milestones and tracking updates can be viewed on your Order Details page.
                  </Typography>
                </Card>
              )}

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
          );
        })()}
      </Paper>
    </Container>
  );
};

export default Checkout;