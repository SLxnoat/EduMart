const request = require('supertest');
const app = require('../server');
const {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Review,
  Notification,
  AdminAction,
  SellerEarning,
  Session
} = require('../src/models');

describe('Malki Modules - Admin, Reviews, Notifications & Seller Dashboard', () => {
  let adminToken, tutorToken, studentToken;
  let adminUser, tutorUser, studentUser;
  let testProduct;

  beforeAll(async () => {
    await User.sync({ force: true });
    await Session.sync({ force: true });
    await Category.sync({ force: true });
    await Product.sync({ force: true });
    await Order.sync({ force: true });
    await OrderItem.sync({ force: true });
    await Review.sync({ force: true });
    await Notification.sync({ force: true });
    await AdminAction.sync({ force: true });
    await SellerEarning.sync({ force: true });

    // Register Admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Admin',
        lastName: 'Malki',
        email: 'admin.malki@edumart.com',
        password: 'password123',
        role: 'admin'
      });
    adminToken = adminRes.body.token;
    adminUser = await User.findOne({ where: { email: 'admin.malki@edumart.com' } });

    // Register Tutor
    const tutorRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Tutor',
        lastName: 'Perera',
        email: 'tutor.perera@edumart.com',
        password: 'password123',
        role: 'tutor'
      });
    tutorToken = tutorRes.body.token;
    tutorUser = await User.findOne({ where: { email: 'tutor.perera@edumart.com' } });

    // Register Student
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Student',
        lastName: 'Silva',
        email: 'student.silva@edumart.com',
        password: 'password123',
        role: 'student'
      });
    studentToken = studentRes.body.token;
    studentUser = await User.findOne({ where: { email: 'student.silva@edumart.com' } });

    const category = await Category.create({
      name: 'Combined Mathematics',
      slug: 'combined-maths'
    });

    // Create test product authored by tutor
    testProduct = await Product.create({
      title: 'Advanced Calculus Handbook 2026',
      description: 'Complete guide for A/L combined maths students',
      price: 25.0,
      category_id: category.id,
      seller_id: tutorUser.id,
      subject: 'Mathematics',
      grade_level: 'Grade 12-13',
      product_type: 'past_paper',
      format: 'physical',
      stock_quantity: 4, // low stock (< 5)
      is_approved: false
    });
  });

  describe('Admin Dashboard Controller (/api/admin)', () => {
    it('should reject unauthenticated or non-admin requests to /api/admin/metrics', async () => {
      const resUnauth = await request(app).get('/api/admin/metrics');
      expect(resUnauth.status).toBe(401);

      const resStudent = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(resStudent.status).toBe(403);
    });

    it('should retrieve platform KPI metrics for admin', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users.total).toBeGreaterThanOrEqual(3);
      expect(res.body.products.total).toBeGreaterThanOrEqual(1);
      expect(res.body.products.pending).toBeGreaterThanOrEqual(1);
      expect(res.body.products.lowStock).toBeGreaterThanOrEqual(1);
    });

    it('should list paginated users and allow filtering by role', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users.length).toBeGreaterThanOrEqual(1);
      expect(res.body.users[0].role).toBe('student');
    });

    it('should allow admin to update user status and log the action', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${studentUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: false, reason: 'Temporary suspension for policy review' });

      expect(res.status).toBe(200);
      expect(res.body.user.is_active).toBe(false);

      // Verify suspended user cannot access protected endpoints
      const checkRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(checkRes.status).toBe(403);

      // Reactivate user
      const reactivateRes = await request(app)
        .put(`/api/admin/users/${studentUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: true });
      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.user.is_active).toBe(true);
    });

    it('should allow admin to moderate (approve) a product listing', async () => {
      const res = await request(app)
        .put(`/api/admin/products/${testProduct.id}/moderate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_approved: true, feedback: 'Approved after curriculum review' });

      expect(res.status).toBe(200);
      expect(res.body.product.is_approved).toBe(true);
    });

    it('should retrieve admin action audit logs', async () => {
      const res = await request(app)
        .get('/api/admin/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Reviews and Ratings Controller (/api/reviews)', () => {
    let reviewId;

    it('should allow a student to submit a rating and review for a product', async () => {
      const res = await request(app)
        .post(`/api/reviews/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          rating: 5,
          title: 'Outstanding Reference Book',
          comment: 'Very thorough explanations and well structured past paper examples!'
        });

      expect(res.status).toBe(201);
      expect(res.body.review).toBeDefined();
      expect(res.body.review.rating).toBe(5);
      reviewId = res.body.review.id;

      // Product rating average should now be updated
      const updatedProduct = await Product.findByPk(testProduct.id);
      expect(Number(updatedProduct.rating_average)).toBe(5);
      expect(updatedProduct.rating_count).toBe(1);
    });

    it('should fetch public reviews and breakdown statistics for a product', async () => {
      const res = await request(app).get(`/api/reviews/product/${testProduct.id}`);

      expect(res.status).toBe(200);
      expect(res.body.reviews.length).toBe(1);
      expect(res.body.summary.average).toBe(5);
      expect(res.body.summary.breakdown['5']).toBe(1);
    });

    it('should allow upvoting a helpful review', async () => {
      const res = await request(app)
        .post(`/api/reviews/${reviewId}/vote`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.helpful_votes).toBe(1);
    });

    it('should reject review submission if rating is missing or out of bounds', async () => {
      const res = await request(app)
        .post(`/api/reviews/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          rating: 6,
          comment: 'Too high'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Notifications Controller (/api/notifications)', () => {
    let notificationId;

    it('should retrieve notifications for the tutor (including review alert)', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${tutorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
      notificationId = res.body.notifications[0].id;
    });

    it('should mark a notification as read', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${tutorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.notification.is_read).toBe(true);
    });

    it('should allow admin to broadcast announcement to all users', async () => {
      const res = await request(app)
        .post('/api/notifications/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'EduMart System Maintenance',
          message: 'Planned maintenance scheduled for Sunday at 02:00 AM UTC.',
          priority: 'high'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('dispatched successfully');
    });

    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Seller/Tutor Dashboard Controller (/api/seller)', () => {
    it('should reject student access to /api/seller/dashboard', async () => {
      const res = await request(app)
        .get('/api/seller/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should retrieve dashboard analytics for the tutor', async () => {
      const res = await request(app)
        .get('/api/seller/dashboard')
        .set('Authorization', `Bearer ${tutorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.metrics.totalProducts).toBe(1);
      expect(res.body.metrics.approvedProducts).toBe(1);
      expect(res.body.metrics.lowStockCount).toBe(1);
      expect(res.body.recentReviews.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve seller inventory and allow updating stock quantity', async () => {
      const invRes = await request(app)
        .get('/api/seller/inventory')
        .set('Authorization', `Bearer ${tutorToken}`);

      expect(invRes.status).toBe(200);
      expect(invRes.body.products.length).toBe(1);

      // Update stock
      const stockRes = await request(app)
        .put(`/api/seller/inventory/${testProduct.id}/stock`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({ stock_quantity: 25 });

      expect(stockRes.status).toBe(200);
      expect(stockRes.body.product.stock_quantity).toBe(25);
    });
  });
});
