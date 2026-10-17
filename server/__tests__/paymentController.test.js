const request = require('supertest');
const app = require('../server');
const { User, Order, OrderItem, Payment, Session, Category, Product } = require('../src/models');

describe('Payment Controller', () => {
  let userToken;
  let testUser;
  let testOrder;
  let testDigitalProduct;

  beforeAll(async () => {
    await User.sync({ force: true });
    await Session.sync({ force: true });
    await Category.sync({ force: true });
    await Product.sync({ force: true });
    await Order.sync({ force: true });
    await OrderItem.sync({ force: true });
    await Payment.sync({ force: true });

    // Register test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Payment',
        lastName: 'Tester',
        email: 'payment.tester@example.com',
        password: 'password123',
        role: 'student',
      });
    userToken = res.body.token;
    testUser = await User.findOne({ where: { email: 'payment.tester@example.com' } });

    const testCategory = await Category.create({
      name: 'Digital Testing Category',
      slug: 'digital-testing-category',
    });
    testDigitalProduct = await Product.create({
      title: 'Digital Calculus Notes',
      description: 'Calculus notes',
      price: 25.0,
      category_id: testCategory.id,
      seller_id: testUser.id,
      subject: 'Mathematics',
      grade_level: 'A/L',
      product_type: 'revision_notes',
      format: 'digital',
      stock_quantity: 999,
      is_digital: true,
      is_physical: false,
    });

    // Create an order for testing
    testOrder = await Order.create({
      user_id: testUser.id,
      order_number: 'EDM-TEST-123456',
      status: 'pending',
      subtotal: 45.0,
      tax_amount: 0,
      shipping_cost: 0,
      discount_amount: 0,
      total_amount: 45.0,
      currency: 'LKR',
      payment_status: 'pending',
    });
  });

  afterAll(async () => {
    await Payment.drop();
    await OrderItem.drop();
    await Order.drop();
    await Product.drop();
    await Category.drop();
    await Session.drop();
    await User.drop();
  });

  describe('POST /api/payments/create', () => {
    it('should create payment intent details for an existing order', async () => {
      const res = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ orderId: testOrder.id });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('clientSecret');
      expect(res.body).toHaveProperty('paymentIntentId');
      expect(res.body.orderId).toBe(testOrder.id);
    });

    it('should return 404 if order does not exist', async () => {
      const res = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ orderId: '00000000-0000-0000-0000-000000000000' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('Order not found');
    });

    it('should return 400 if orderId is missing', async () => {
      const res = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/payments/simulate-success', () => {
    it('should simulate successful payment in sandbox mode and update order and payment records', async () => {
      const res = await request(app)
        .post('/api/payments/simulate-success')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ orderId: testOrder.id });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('completed');

      // Verify order was updated in DB
      const updatedOrder = await Order.findByPk(testOrder.id);
      expect(updatedOrder.status).toBe('paid');
      expect(updatedOrder.payment_status).toBe('paid');

      // Verify payment was recorded with user_id
      const paymentRecord = await Payment.findOne({ where: { order_id: testOrder.id } });
      expect(paymentRecord).not.toBeNull();
      expect(paymentRecord.user_id).toBe(testUser.id);
      expect(paymentRecord.status).toBe('completed');
    });
  });

  describe('GET /api/payments/status/:id', () => {
    it('should return payment status details by order_id or payment_id', async () => {
      const res = await request(app)
        .get(`/api/payments/status/${testOrder.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order_id).toBe(testOrder.id);
      expect(res.body.data.status).toBe('completed');
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should handle payment_intent.succeeded webhook and resolve user_id correctly', async () => {
      // Create a fresh pending order
      const webhookOrder = await Order.create({
        user_id: testUser.id,
        order_number: 'EDM-TEST-WEBHOOK-1',
        status: 'pending',
        subtotal: 30.0,
        total_amount: 30.0,
        currency: 'LKR',
        payment_status: 'pending',
      });

      const mockStripeEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_webhook_success_99',
            amount: 3000,
            currency: 'lkr',
            metadata: {
              order_id: webhookOrder.id,
            },
          },
        },
      };

      const res = await request(app)
        .post('/api/payments/webhook')
        .send(mockStripeEvent);

      expect(res.statusCode).toBe(200);
      expect(res.body.received).toBe(true);

      const refreshedOrder = await Order.findByPk(webhookOrder.id);
      expect(refreshedOrder.status).toBe('paid');
      expect(refreshedOrder.payment_status).toBe('paid');

      const payment = await Payment.findOne({
        where: { provider_payment_id: 'pi_test_webhook_success_99' },
      });
      expect(payment).not.toBeNull();
      expect(payment.user_id).toBe(testUser.id);
      expect(payment.status).toBe('completed');
    });

    it('should handle payment_intent.payment_failed webhook correctly', async () => {
      const failOrder = await Order.create({
        user_id: testUser.id,
        order_number: 'EDM-TEST-WEBHOOK-FAIL',
        status: 'pending',
        subtotal: 25.0,
        total_amount: 25.0,
        currency: 'LKR',
        payment_status: 'pending',
      });

      const mockStripeFailEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_webhook_failed_88',
            amount: 2500,
            currency: 'lkr',
            metadata: {
              order_id: failOrder.id,
            },
          },
        },
      };

      const res = await request(app)
        .post('/api/payments/webhook')
        .send(mockStripeFailEvent);

      expect(res.statusCode).toBe(200);
      expect(res.body.received).toBe(true);

      const refreshedOrder = await Order.findByPk(failOrder.id);
      expect(refreshedOrder.status).toBe('failed');
      expect(refreshedOrder.payment_status).toBe('failed');
    });
  });

  describe('GET /api/payments/config', () => {
    it('should return client-safe gateway configuration without leaking secret keys', async () => {
      const res = await request(app).get('/api/payments/config');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('stripe');
      expect(res.body.data).toHaveProperty('paypal');
      expect(res.body.data).toHaveProperty('bankTransfer');
      expect(res.body.data).toHaveProperty('digitalWallet');
      expect(res.body.data).toHaveProperty('cod');
      expect(res.body.data.stripe).not.toHaveProperty('secretKey');
    });
  });

  describe('POST /api/payments/process & PayPal Endpoints', () => {
    it('should process payment across different payment methods', async () => {
      const order2 = await Order.create({
        user_id: testUser.id,
        order_number: 'EDM-TEST-MULTI-PAY',
        status: 'pending',
        subtotal: 75.0,
        total_amount: 75.0,
        currency: 'LKR',
        payment_status: 'pending',
      });

      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: order2.id,
          paymentMethod: 'bank_transfer',
          paymentDetails: {
            slipNumber: 'TXN-BANK-12345',
            bankName: 'Commercial Bank',
            depositorName: 'Charuka Silva',
          },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.paymentMethod).toBe('bank_transfer');

      const refreshed = await Order.findByPk(order2.id);
      expect(refreshed).not.toBeNull();
    });

    it('should reject Cash on Delivery (COD) if order contains digital items', async () => {
      const digitalOrder = await Order.create({
        user_id: testUser.id,
        order_number: 'EDM-TEST-COD-DIGITAL',
        status: 'pending',
        subtotal: 25.0,
        total_amount: 25.0,
        currency: 'LKR',
        payment_status: 'pending',
      });
      await OrderItem.create({
        order_id: digitalOrder.id,
        product_id: testDigitalProduct.id,
        product_title: 'Digital Calculus Notes',
        product_subject: 'Mathematics',
        product_grade_level: 'A/L',
        quantity: 1,
        unit_price: 25.0,
        total_price: 25.0,
        is_digital: true,
        is_physical: false,
      });

      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: digitalOrder.id,
          paymentMethod: 'cash_on_delivery',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Cash on Delivery (COD) is only permitted for 100% physical goods');
    });

    it('should create a PayPal order via /api/payments/paypal/create-order', async () => {
      const payPalOrder = await Order.create({
        user_id: testUser.id,
        order_number: 'EDM-TEST-PAYPAL-1',
        status: 'pending',
        subtotal: 60.0,
        total_amount: 60.0,
        currency: 'LKR',
        payment_status: 'pending',
      });

      const res = await request(app)
        .post('/api/payments/paypal/create-order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ orderId: payPalOrder.id });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('paypalOrderId');
      expect(res.body).toHaveProperty('approvalUrl');
    });
  });
});

