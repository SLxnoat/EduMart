const request = require('supertest');
const app = require('../server');
const { User, Cart, Coupon, Session } = require('../src/models');

describe('Shopping Cart & Coupon Controller (Bhanuka)', () => {
  let userToken;
  let testUser;

  beforeAll(async () => {
    await User.sync({ force: true });
    await Session.sync({ force: true });
    await Cart.sync({ force: true });
    await Coupon.sync({ force: true });

    // Register a student user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Bhanuka',
        lastName: 'Shopper',
        email: 'bhanuka.cart@example.com',
        password: 'password123',
        role: 'student',
      });
    userToken = res.body.token;
    testUser = await User.findOne({ where: { email: 'bhanuka.cart@example.com' } });
  });

  afterAll(async () => {
    await Coupon.drop();
    await Cart.drop();
    await Session.drop();
    await User.drop();
  });

  describe('GET /api/cart', () => {
    it('should return empty cart on initial load', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.subtotal).toBe(0);
      expect(res.body.data.total).toBe(0);
    });

    it('should reject unauthenticated access', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/cart/items & PUT /api/cart/items/:id', () => {
    it('should add item to cart and calculate subtotal and shipping correctly', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: 'prod-uuid-1',
          title: 'Advanced Level Biology Notes',
          price: 20.0,
          quantity: 2,
          is_digital: true,
          is_physical: false,
          subject: 'Biology',
          grade_level: 'Grade 12-13',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].title).toBe('Advanced Level Biology Notes');
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.subtotal).toBe(40.0); // 20 * 2 = 40
      expect(res.body.data.estimatedShipping).toBe(0.0); // Digital item
      expect(res.body.data.total).toBe(42.0); // 40 + 5% tax (2) = 42
    });

    it('should increment quantity when same item is added again', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: 'prod-uuid-1',
          title: 'Advanced Level Biology Notes',
          price: 20.0,
          quantity: 1,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(3); // 2 + 1 = 3
      expect(res.body.data.subtotal).toBe(60.0);
    });

    it('should add physical item and calculate estimated shipping cost', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: 'prod-uuid-2',
          title: 'Chemistry Past Paper Book Printed',
          price: 15.0,
          quantity: 1,
          is_digital: false,
          is_physical: true,
          subject: 'Chemistry',
          grade_level: 'A/L',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.subtotal).toBe(75.0); // 60 + 15 = 75
      expect(res.body.data.estimatedShipping).toBe(4.5); // Physical item present
    });

    it('should update item quantity', async () => {
      const res = await request(app)
        .put('/api/cart/items/prod-uuid-1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(res.statusCode).toBe(200);
      const item = res.body.data.items.find((i) => i.product_id === 'prod-uuid-1');
      expect(item.quantity).toBe(1);
      expect(res.body.data.subtotal).toBe(35.0); // 20*1 + 15*1 = 35
    });
  });

  describe('POST /api/cart/save-for-later/:id & DELETE /api/cart/items/:id', () => {
    it('should move item from cart to saved for later and back', async () => {
      // Move to saved for later
      const saveRes = await request(app)
        .post('/api/cart/save-for-later/prod-uuid-2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(saveRes.statusCode).toBe(200);
      expect(saveRes.body.data.items).toHaveLength(1);
      expect(saveRes.body.data.saved_for_later).toHaveLength(1);
      expect(saveRes.body.data.saved_for_later[0].product_id).toBe('prod-uuid-2');

      // Move back to cart
      const moveBackRes = await request(app)
        .post('/api/cart/save-for-later/prod-uuid-2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(moveBackRes.statusCode).toBe(200);
      expect(moveBackRes.body.data.items).toHaveLength(2);
      expect(moveBackRes.body.data.saved_for_later).toHaveLength(0);
    });

    it('should remove an item from cart', async () => {
      const res = await request(app)
        .delete('/api/cart/items/prod-uuid-2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].product_id).toBe('prod-uuid-1');
    });

    it('should clear all items from cart', async () => {
      const res = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.subtotal).toBe(0);
    });
  });

  describe('Coupon Validation & Discount Engine', () => {
    it('should validate percentage discount coupon (EDUMART10)', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'EDUMART10',
          subtotal: 50.0,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.data.discount_amount).toBe(5.0); // 10% of 50 = 5
      expect(res.body.data.subtotal_after).toBe(45.0);
    });

    it('should validate fixed discount coupon (WELCOME20) when min_purchase is met', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'WELCOME20',
          subtotal: 60.0,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.data.discount_amount).toBe(20.0);
      expect(res.body.data.subtotal_after).toBe(40.0);
    });

    it('should reject fixed discount coupon when min_purchase is not met', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'WELCOME20',
          subtotal: 30.0, // min_purchase is 50
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('minimum purchase');
    });

    it('should reject non-existent or invalid coupon code', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'INVALIDCODE99',
          subtotal: 50.0,
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('Invalid');
    });

    it('should list available coupons via GET /api/coupons', async () => {
      const res = await request(app).get('/api/coupons');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.some((c) => c.code === 'EDUMART10')).toBe(true);
    });
  });
});
