const request = require('supertest');
const app = require('../server');
const { User, Session, Notification } = require('../src/models');
const { resetRateLimits } = require('../src/middleware/rateLimiter');

// jest.setup.js already mocks config/database with a SQLite in-memory Sequelize instance
// and sets JWT_SECRET / JWT_EXPIRES_IN env vars.

beforeAll(async () => {
  // Sync (create) all tables in the in-memory SQLite DB
  await User.sync({ force: true });
  await Session.sync({ force: true });
  await Notification.sync({ force: true });
});

afterAll(async () => {
  // Drop all tables
  await Notification.drop();
  await Session.drop();
  await User.drop();
});

beforeEach(async () => {
  // Wipe sessions, notifications, and users between each test for isolation
  resetRateLimits();
  await Notification.destroy({ truncate: true, cascade: false });
  await Session.destroy({ truncate: true, cascade: false });
  await User.destroy({ truncate: true, cascade: false });
});

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'student',
          institution: 'University of Colombo'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('john.doe@example.com');
      expect(res.body.institution).toBe('University of Colombo');
    });

    it('should sanitize XSS input fields during registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: '<script>alert(1)</script>John',
          lastName: 'Doe',
          email: 'xss.user@example.com',
          password: 'password123',
          institution: '<b>Royal Institute</b>'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.firstName).not.toContain('<script>');
      expect(res.body.institution).not.toContain('<b>');
    });

    it('should not register user with existing email', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'student'
        });

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password456',
          phone: '0987654321',
          role: 'tutor'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'bad@example.com' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login & POST /api/auth/logout', () => {
    it('should login user with correct credentials and create a session', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'student'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('john.doe@example.com');
      expect(res.body).toHaveProperty('profileCompletion');

      const sessionRecord = await Session.findOne({ where: { token: res.body.token } });
      expect(sessionRecord).not.toBeNull();
    });

    it('should revoke session token on logout and reject subsequent requests with that token', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Logout',
          lastName: 'Tester',
          email: 'logout@example.com',
          password: 'password123'
        });

      const token = regRes.body.token;

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutRes.statusCode).toEqual(200);

      // Subsequent request with the same revoked token should return 401
      const profileRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profileRes.statusCode).toEqual(401);
    });

    it('should not login user with incorrect password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'student'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should enforce 429 rate limiting when exceeding max auth attempts', async () => {
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post('/api/auth/login')
          .set('x-test-rate-limit', 'true')
          .send({ email: 'ratelimit@example.com', password: 'password123' });
      }

      const blockedRes = await request(app)
        .post('/api/auth/login')
        .set('x-test-rate-limit', 'true')
        .send({ email: 'ratelimit@example.com', password: 'password123' });

      expect(blockedRes.statusCode).toEqual(429);
    });
  });

  describe('Email Verification, Resend Verification & Password Reset', () => {
    it('should verify email with valid token', async () => {
      const user = await User.create({
        first_name: 'Verify',
        last_name: 'Tester',
        email: 'verify@example.com',
        password_hash: 'password123',
        verification_token: 'validtoken1234567890abcdef12345678'
      });

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'validtoken1234567890abcdef12345678' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Email verified successfully');

      const updated = await User.findByPk(user.id);
      expect(updated.is_verified).toBe(true);
    });

    it('should resend verification email for unverified user', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Resend',
          lastName: 'User',
          email: 'resend@example.com',
          password: 'password123'
        });

      const resendRes = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'resend@example.com' });

      expect(resendRes.statusCode).toEqual(200);
      expect(resendRes.body).toHaveProperty('verificationToken');

      // Verify using the newly issued verificationToken
      const verifyRes = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: resendRes.body.verificationToken });

      expect(verifyRes.statusCode).toEqual(200);
    });

    it('should handle forgot-password and reset-password flow', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Reset',
          lastName: 'User',
          email: 'resetme@example.com',
          password: 'OldPassword123!'
        });

      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'resetme@example.com' });

      expect(forgotRes.statusCode).toEqual(200);
      expect(forgotRes.body).toHaveProperty('resetToken');

      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: forgotRes.body.resetToken,
          newPassword: 'BrandNewPassword123!'
        });

      expect(resetRes.statusCode).toEqual(200);

      // Verify login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'resetme@example.com',
          password: 'BrandNewPassword123!'
        });

      expect(loginRes.statusCode).toEqual(200);
    });
  });

  describe('Profile, Change Password & GET /api/users/:id RBAC', () => {
    it('should get and update profile, and change password', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Profile',
          lastName: 'Tester',
          email: 'profile@example.com',
          password: 'ProfilePassword123!',
          phone: '1234567890'
        });

      const token = regRes.body.token;

      // Get Profile
      const getProfileRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(getProfileRes.statusCode).toEqual(200);
      expect(getProfileRes.body.firstName).toBe('Profile');
      expect(getProfileRes.body).toHaveProperty('profileCompletion');

      // Update Profile
      const updateRes = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'ProfileUpdated',
          institution: 'New Institute'
        });

      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body.firstName).toBe('ProfileUpdated');
      expect(updateRes.body.institution).toBe('New Institute');

      // Change Password
      const changePassRes = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'ProfilePassword123!',
          newPassword: 'SuperNewPassword123!'
        });

      expect(changePassRes.statusCode).toEqual(200);

      // Verify login with changed password
      const reLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'SuperNewPassword123!'
        });

      expect(reLogin.statusCode).toEqual(200);
    });

    it('should allow user to fetch their own profile by ID, forbid other non-admins, and allow admins', async () => {
      const user1Res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'StudentOne',
          lastName: 'User',
          email: 'student1@example.com',
          password: 'Password123!',
          role: 'student'
        });

      const user2Res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'StudentTwo',
          lastName: 'User',
          email: 'student2@example.com',
          password: 'Password123!',
          role: 'student'
        });

      // Self lookup succeeds (200)
      const selfRes = await request(app)
        .get(`/api/users/${user1Res.body._id}`)
        .set('Authorization', `Bearer ${user1Res.body.token}`);
      expect(selfRes.statusCode).toEqual(200);
      expect(selfRes.body.email).toBe('student1@example.com');

      // Non-admin looking up another user is forbidden (403)
      const forbiddenRes = await request(app)
        .get(`/api/users/${user2Res.body._id}`)
        .set('Authorization', `Bearer ${user1Res.body.token}`);
      expect(forbiddenRes.statusCode).toEqual(403);

      // Promote user1 to admin and verify lookup succeeds (200)
      await User.update({ role: 'admin' }, { where: { id: user1Res.body._id } });
      const adminRes = await request(app)
        .get(`/api/users/${user2Res.body._id}`)
        .set('Authorization', `Bearer ${user1Res.body.token}`);
      expect(adminRes.statusCode).toEqual(200);
      expect(adminRes.body.email).toBe('student2@example.com');
    });

    it('should manage active sessions and allow revoking other sessions', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Session',
          lastName: 'Tester',
          email: 'session.test@example.com',
          password: 'Password123!',
          role: 'student'
        });
      const token1 = regRes.body.token;

      // Simulate a second login from a mobile device
      const loginRes = await request(app)
        .post('/api/auth/login')
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
        .send({
          email: 'session.test@example.com',
          password: 'Password123!'
        });
      const token2 = loginRes.body.token;

      // Inspect active sessions
      const sessionsRes = await request(app)
        .get('/api/users/sessions')
        .set('Authorization', `Bearer ${token2}`);

      expect(sessionsRes.statusCode).toEqual(200);
      expect(sessionsRes.body.sessions.length).toBeGreaterThanOrEqual(2);
      const current = sessionsRes.body.sessions.find((s) => s.is_current);
      expect(current).toBeDefined();

      // Revoke other device sessions from current session
      const revokeRes = await request(app)
        .delete('/api/users/sessions')
        .set('Authorization', `Bearer ${token2}`);

      expect(revokeRes.statusCode).toEqual(200);
      expect(revokeRes.body.message).toContain('Revoked');

      // Remaining sessions should only be 1
      const afterRes = await request(app)
        .get('/api/users/sessions')
        .set('Authorization', `Bearer ${token2}`);
      expect(afterRes.body.sessions.length).toBe(1);
    });

    it('should export user personal data archive under GDPR compliance', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Gdpr',
          lastName: 'Tester',
          email: 'gdpr.test@example.com',
          password: 'Password123!',
          role: 'student'
        });

      const exportRes = await request(app)
        .get('/api/users/export-data')
        .set('Authorization', `Bearer ${regRes.body.token}`);

      expect(exportRes.statusCode).toEqual(200);
      expect(exportRes.body).toHaveProperty('export_metadata');
      expect(exportRes.body.export_metadata.compliance).toContain('GDPR');
      expect(exportRes.body.user_profile.email).toBe('gdpr.test@example.com');
      expect(exportRes.body).toHaveProperty('active_sessions');
      expect(exportRes.body).toHaveProperty('orders');
    });

    it('should dispatch security alert notification when password is changed', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Sec',
          lastName: 'Alert',
          email: 'sec.alert@example.com',
          password: 'OldPassword123!',
          role: 'student'
        });

      const changeRes = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${regRes.body.token}`)
        .send({
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!'
        });

      expect(changeRes.statusCode).toEqual(200);

      // Verify security alert was dispatched
      const notif = await Notification.findOne({
        where: { user_id: regRes.body._id, type: 'security_alert' }
      });
      expect(notif).not.toBeNull();
      expect(notif.title).toContain('Password Changed');
    });

    it('should allow self-service account deactivation with password confirmation', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Close',
          lastName: 'Account',
          email: 'close.me@example.com',
          password: 'Password123!',
          role: 'student'
        });

      // Reject invalid password
      const badRes = await request(app)
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${regRes.body.token}`)
        .send({ password: 'WrongPassword' });
      expect(badRes.statusCode).toEqual(401);

      // Succeeded with correct password
      const deleteRes = await request(app)
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${regRes.body.token}`)
        .send({ password: 'Password123!' });
      expect(deleteRes.statusCode).toEqual(200);
      expect(deleteRes.body.message).toContain('deactivated');

      // Subsequent access should be blocked (token revoked / account inactive)
      const checkRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${regRes.body.token}`);
      expect([401, 403]).toContain(checkRes.statusCode);
    });
  });
});