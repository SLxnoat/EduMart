const request = require('supertest');
const app = require('../server');
const { User, Category, Product, Order, OrderItem, Payment, Session } = require('../src/models');

describe('Order Controller', () => {
  let studentToken;
  let adminToken;
  let studentUser;
  let adminUser;
  let testProduct;

  beforeAll(async () => {
    await User.sync({ force: true });
    await Session.sync({ force: true });
    await Category.sync({ force: true });
    await Product.sync({ force: true });
    await Order.sync({ force: true });
    await OrderItem.sync({ force: true });
    await Payment.sync({ force: true });

    // Register a student
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Order',
        lastName: 'Buyer',
        email: 'order.buyer@example.com',
        password: 'password123',
        role: 'student',
      });
    studentToken = studentRes.body.token;
    studentUser = await User.findOne({ where: { email: 'order.buyer@example.com' } });

    // Register an admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin.orders@example.com',
        password: 'password123',
        role: 'admin',
      });
    adminToken = adminRes.body.token;
    adminUser = await User.findOne({ where: { email: 'admin.orders@example.com' } });

    // Create a Category and Product
    const category = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
    });

    testProduct = await Product.create({
      title: 'Mathematics Past Papers 2024',
      description: 'Comprehensive past papers collection',
      price: 15.0,
      category_id: category.id,
      seller_id: adminUser.id,
      subject: 'Mathematics',
      grade_level: 'A/L',
      product_type: 'past_paper',
      format: 'digital',
      is_active: true,
      is_approved: true,
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

  describe('POST /api/orders', () => {
    it('should create an order with multiple order items and calculate totals correctly', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          items: [
            {
              product_id: testProduct.id,
              product_title: 'Mathematics Past Papers 2024',
              unit_price: 15.0,
              quantity: 2,
              product_subject: 'Mathematics',
              product_grade_level: 'A/L',
              is_digital: true,
              is_physical: false,
            },
            {
              product_id: testProduct.id,
              product_title: 'Physics Revision Guide',
              unit_price: 20.0,
              quantity: 1,
              product_subject: 'Physics',
              product_grade_level: 'A/L',
              is_digital: false,
              is_physical: true,
            },
          ],
          shipping_cost: 5.0,
          tax_amount: 2.5,
          discount_amount: 0,
          shipping_address: {
            fullName: 'Order Buyer',
            street: '123 Main Street',
            city: 'Colombo',
            postalCode: '00100',
            country: 'Sri Lanka',
          },
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('order_number');
      expect(res.body.data.order_number).toMatch(/^EDM-/);
      expect(Number(res.body.data.subtotal)).toBe(50.0); // 15*2 + 20*1 = 50
      expect(Number(res.body.data.shipping_cost)).toBe(5.0);
      expect(Number(res.body.data.tax_amount)).toBe(2.5);
      expect(Number(res.body.data.total_amount)).toBe(57.5); // 50 + 5 + 2.5 = 57.5
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.payment_status).toBe('pending');
      expect(res.body.data.items).toHaveLength(2);
    });

    it('should reject order creation if no items are provided', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          items: [],
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('at least one item');
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [{ product_title: 'Item', unit_price: 10, quantity: 1 }],
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/orders', () => {
    it('should retrieve list of orders for the logged-in user', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('items');
      expect(res.body.pagination).toHaveProperty('total');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should fetch single order by ID or order_number', async () => {
      const listRes = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${studentToken}`);
      const order = listRes.body.data[0];

      const res = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(order.id);
      expect(res.body.data.order_number).toBe(order.order_number);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('should forbid other non-admin users from accessing an order they do not own', async () => {
      // Create another student
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Other',
          lastName: 'Student',
          email: 'other.student@example.com',
          password: 'password123',
          role: 'student',
        });
      const otherToken = otherRes.body.token;

      const listRes = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${studentToken}`);
      const order = listRes.body.data[0];

      const res = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to access any order', async () => {
      const listRes = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${studentToken}`);
      const order = listRes.body.data[0];

      const res = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(order.id);
    });
  });

  describe('PUT /api/orders/:id/status & POST /api/orders/:id/cancel', () => {
    it('should allow admin to update order status to processing or shipped', async () => {
      const listRes = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${studentToken}`);
      const order = listRes.body.data[0];

      const res = await request(app)
        .put(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing', notes: 'Dispatched to preparation' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('processing');
    });

    it('should allow customer to cancel pending/processing order', async () => {
      const listRes = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${studentToken}`);
      const order = listRes.body.data[0];

      const res = await request(app)
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ reason: 'Changed my mind' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });
  });
});
