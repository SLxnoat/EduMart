const request = require('supertest');
const app = require('../server');
const { AiInteraction, User, Order, Product, Category } = require('../src/models');

beforeAll(async () => {
  await User.sync({ force: true });
  await Category.sync({ force: true });
  await Product.sync({ force: true });
  await Order.sync({ force: true });
  await AiInteraction.sync({ force: true });
});

afterAll(async () => {
  await AiInteraction.drop();
  await Order.drop();
  await Product.drop();
  await Category.drop();
  await User.drop();
});

beforeEach(async () => {
  await AiInteraction.destroy({ truncate: true, cascade: false });
  await Order.destroy({ truncate: true, cascade: false });
  await Product.destroy({ truncate: true, cascade: false });
});

describe('AI Chatbot Controller', () => {
  describe('POST /api/chatbot/message', () => {
    it('should match FAQ intent for digital downloads inquiry', async () => {
      const res = await request(app)
        .post('/api/chatbot/message')
        .send({
          sessionId: 'test-session-1',
          message: 'How do I download my purchased past papers?'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('reply');
      expect(res.body.data.intent).toBe('faq.digital_download');
      expect(res.body.data.confidence).toBeGreaterThanOrEqual(0.8);
      expect(res.body.data.suggestedQuickReplies.length).toBeGreaterThan(0);

      // Verify row persisted in database
      const interaction = await AiInteraction.findOne({
        where: { session_id: 'test-session-1' }
      });
      expect(interaction).not.toBeNull();
      expect(interaction.intent).toBe('faq.digital_download');
    });

    it('should search Product catalog when user asks for subject materials', async () => {
      const seller = await User.create({
        first_name: 'Tutor',
        last_name: 'Seller',
        email: `seller-${Date.now()}@example.com`,
        password_hash: 'password123',
        role: 'tutor'
      });

      const category = await Category.create({
        name: `Past Papers ${Date.now()}`,
        description: 'GCE A/L and O/L Past Papers'
      });

      await Product.create({
        seller_id: seller.id,
        category_id: category.id,
        title: 'GCE A/L Combined Mathematics 2025 Past Paper Pack',
        description: 'Complete marking scheme and worked solutions',
        price: 12.50,
        subject: 'Mathematics',
        grade_level: 'A/L',
        product_type: 'past_paper',
        format: 'digital',
        is_active: true,
        is_approved: true
      });

      const res = await request(app)
        .post('/api/chatbot/message')
        .send({
          sessionId: 'test-product-search',
          message: 'Find Mathematics past papers'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.intent).toBe('product.search');
      expect(res.body.data.reply).toContain('GCE A/L Combined Mathematics 2025 Past Paper Pack');
    });

    it('should resolve real-time Order status by order number', async () => {
      const buyer = await User.create({
        first_name: 'Buyer',
        last_name: 'Student',
        email: `buyer-${Date.now()}@example.com`,
        password_hash: 'password123',
        role: 'student'
      });

      await Order.create({
        order_number: 'ORD-2026-9999',
        user_id: buyer.id,
        subtotal: 25.00,
        total_amount: 25.00,
        status: 'processing',
        payment_status: 'paid',
        payment_method: 'card',
        shipping_address: 'Colombo 07'
      });

      const res = await request(app)
        .post('/api/chatbot/message')
        .send({
          sessionId: 'test-order-lookup',
          message: 'Can you check order ORD-2026-9999?'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.intent).toBe('order.status');
      expect(res.body.data.reply).toContain('ORD-2026-9999');
      expect(res.body.data.reply).toContain('PROCESSING');
    });

    it('should match newly added quick-reply FAQ intents (Payment Help, Commission Rates, Contact Support)', async () => {
      const paymentRes = await request(app)
        .post('/api/chatbot/message')
        .send({ sessionId: 'qr-1', message: 'Payment Help' });
      expect(paymentRes.body.data.intent).toBe('faq.payment_help');

      const commissionRes = await request(app)
        .post('/api/chatbot/message')
        .send({ sessionId: 'qr-2', message: 'Commission Rates' });
      expect(commissionRes.body.data.intent).toBe('faq.commission_rates');

      const supportRes = await request(app)
        .post('/api/chatbot/message')
        .send({ sessionId: 'qr-3', message: 'Contact Support' });
      expect(supportRes.body.data.intent).toBe('faq.contact_support');
    });

    it('should return fallback response for unknown questions', async () => {
      const res = await request(app)
        .post('/api/chatbot/message')
        .send({
          sessionId: 'test-session-2',
          message: 'What is the weather in Paris today?'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.intent).toBe('fallback.unknown');
      expect(res.body.data.reply).toContain("I'm EduMart's AI Assistant");
    });

    it('should return 400 for empty message', async () => {
      const res = await request(app)
        .post('/api/chatbot/message')
        .send({ sessionId: 'test-session-3' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/chatbot/feedback', () => {
    it('should record helpfulness and star rating', async () => {
      const messageRes = await request(app)
        .post('/api/chatbot/message')
        .send({
          sessionId: 'test-session-4',
          message: 'How to become a tutor?'
        });

      const interactionId = messageRes.body.data.interactionId;
      expect(interactionId).toBeTruthy();

      const feedbackRes = await request(app)
        .post('/api/chatbot/feedback')
        .send({
          interactionId,
          isHelpful: true,
          rating: 5
        });

      expect(feedbackRes.statusCode).toBe(200);
      expect(feedbackRes.body.success).toBe(true);

      const updated = await AiInteraction.findByPk(interactionId);
      expect(updated.is_helpful).toBe(true);
      expect(updated.feedback_rating).toBe(5);
    });
  });

  describe('GET /api/chatbot/history', () => {
    it('should retrieve conversation history for a session', async () => {
      await request(app)
        .post('/api/chatbot/message')
        .send({ sessionId: 'history-session', message: 'Hello EduMart' });

      await request(app)
        .post('/api/chatbot/message')
        .send({ sessionId: 'history-session', message: 'How to download?' });

      const res = await request(app)
        .get('/api/chatbot/history?sessionId=history-session');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('Validation, Rich Products, Support Ticket & Analytics', () => {
    it('should reject messages exceeding maximum length of 1000 characters', async () => {
      const longMessage = 'A'.repeat(1005);
      const res = await request(app)
        .post('/api/chatbot/message')
        .send({ sessionId: 'long-msg-session', message: longMessage });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('1000 characters');
    });

    it('should return rich structured products array on product search query', async () => {
      const res = await request(app)
        .post('/api/chatbot/message')
        .send({ sessionId: 'rich-prod-session', message: 'search Mathematics' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('products');
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should allow submitting an in-chat support ticket via POST /api/chatbot/ticket', async () => {
      const res = await request(app)
        .post('/api/chatbot/ticket')
        .send({
          name: 'Kasun',
          email: 'kasun@edumart.lk',
          subject: 'Need help with AL Physics download',
          message: 'My download link is not opening on my phone.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('ticketId');
      expect(res.body.message).toContain('Support ticket #');
    });

    it('should reject support ticket when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/chatbot/ticket')
        .send({
          email: 'not-an-email',
          message: 'Help please'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('valid email address');
    });

    it('should retrieve AI analytics summary via GET /api/chatbot/analytics', async () => {
      const res = await request(app).get('/api/chatbot/analytics');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalInteractions');
      expect(res.body.data).toHaveProperty('helpfulnessPercentage');
      expect(res.body.data).toHaveProperty('unresolvedQuestions');
    });
  });
});
