const request = require('supertest');
const https = require('https');
const EventEmitter = require('events');
const app = require('../server');
const {
  getEmailStatus,
  sendEmailJsMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendCustomEmail,
  isEmailJsConfigured,
  isSmtpConfigured
} = require('../src/utils/emailService');

describe('Outbound Email Service & EmailJS Integration', () => {
  describe('Configuration & Status Diagnostic Inspection', () => {
    it('should correctly inspect EmailJS and SMTP configuration state', () => {
      const status = getEmailStatus();

      expect(status).toHaveProperty('configured');
      expect(status).toHaveProperty('activeProvider');
      expect(status).toHaveProperty('emailjs');
      expect(status.emailjs).toHaveProperty('templates');
      expect(status.emailjs.templates).toHaveProperty('verify');
      expect(status.emailjs.templates).toHaveProperty('reset');
      expect(status.emailjs.templates).toHaveProperty('order');
      expect(status).toHaveProperty('smtp');
      expect(status.smtp).toHaveProperty('port');
    });

    it('should identify whether EmailJS or SMTP is configured', () => {
      expect(typeof isEmailJsConfigured()).toBe('boolean');
      expect(typeof isSmtpConfigured()).toBe('boolean');
    });
  });

  describe('Direct EmailJS Client (sendEmailJsMail)', () => {
    it('should reject when missing required parameters', async () => {
      await expect(
        sendEmailJsMail({ serviceId: '', templateId: '', publicKey: '' })
      ).rejects.toThrow('EmailJS requires serviceId, templateId, and publicKey');
    });

    it('should successfully post payload to EmailJS API endpoint when https succeeds', async () => {
      const originalRequest = https.request;

      // Mock https.request to simulate successful EmailJS HTTP 200
      https.request = jest.fn((options, callback) => {
        expect(options.hostname).toBe('api.emailjs.com');
        expect(options.path).toBe('/api/v1.0/email/send');
        expect(options.method).toBe('POST');
        expect(options.headers['Content-Type']).toBe('application/json');

        const mockResponse = new EventEmitter();
        mockResponse.statusCode = 200;

        const mockClientRequest = new EventEmitter();
        mockClientRequest.write = jest.fn((chunk) => {
          const body = JSON.parse(chunk);
          expect(body.service_id).toBe('test_service');
          expect(body.template_id).toBe('test_template');
          expect(body.user_id).toBe('test_public_key');
          expect(body.template_params.to_email).toBe('student@edumart.lk');
        });
        mockClientRequest.end = jest.fn(() => {
          process.nextTick(() => {
            callback(mockResponse);
            mockResponse.emit('data', 'OK');
            mockResponse.emit('end');
          });
        });

        return mockClientRequest;
      });

      const result = await sendEmailJsMail({
        serviceId: 'test_service',
        templateId: 'test_template',
        publicKey: 'test_public_key',
        privateKey: 'test_private_key',
        templateParams: {
          to_email: 'student@edumart.lk',
          to_name: 'Saman Perera'
        }
      });

      expect(result.sent).toBe(true);
      expect(result.provider).toBe('emailjs');
      expect(result.status).toBe(200);

      // Restore original https.request
      https.request = originalRequest;
    });

    it('should reject with descriptive error when EmailJS returns non-200 status', async () => {
      const originalRequest = https.request;

      https.request = jest.fn((options, callback) => {
        const mockResponse = new EventEmitter();
        mockResponse.statusCode = 400;

        const mockClientRequest = new EventEmitter();
        mockClientRequest.write = jest.fn();
        mockClientRequest.end = jest.fn(() => {
          process.nextTick(() => {
            callback(mockResponse);
            mockResponse.emit('data', 'The service ID is invalid');
            mockResponse.emit('end');
          });
        });

        return mockClientRequest;
      });

      await expect(
        sendEmailJsMail({
          serviceId: 'invalid_service',
          templateId: 'test_template',
          publicKey: 'test_public_key'
        })
      ).rejects.toThrow('EmailJS API returned 400: The service ID is invalid');

      https.request = originalRequest;
    });
  });

  describe('Email Helper Workflows (Verification, Reset, Orders, Custom)', () => {
    it('should generate and dispatch verification email with valid verification link', async () => {
      const result = await sendVerificationEmail('kasun@example.com', 'Kasun', 'token_abc_123');

      expect(result.sent).toBe(true);
      expect(result).toHaveProperty('verificationUrl');
      expect(result.verificationUrl).toContain('/verify-email?token=token_abc_123');
    });

    it('should generate and dispatch password reset email with valid reset link', async () => {
      const result = await sendPasswordResetEmail('kasun@example.com', 'Kasun', 'reset_def_456');

      expect(result.sent).toBe(true);
      expect(result).toHaveProperty('resetUrl');
      expect(result.resetUrl).toContain('/reset-password?token=reset_def_456');
    });

    it('should format and dispatch order confirmation email for purchased materials', async () => {
      const mockOrder = {
        id: '990e8400-e29b-41d4-a716-446655440000',
        order_number: 'ORD-2026-8888',
        total_amount: 5400.00,
        currency: 'LKR',
        carrier: 'PromptX Courier',
        items: [
          {
            product_title: 'Physics Revision Notes 2026',
            product_subject: 'Physics',
            product_grade_level: 'Grade 12/13 A/L',
            is_digital: true,
            is_physical: false,
            quantity: 1,
            total_price: 3400.00
          },
          {
            product_title: 'Chemistry Past Paper Worksheets',
            product_subject: 'Chemistry',
            product_grade_level: 'Grade 12/13 A/L',
            is_digital: false,
            is_physical: true,
            quantity: 1,
            total_price: 2000.00
          }
        ]
      };

      const result = await sendOrderConfirmationEmail({
        email: 'kasun@example.com',
        firstName: 'Kasun',
        order: mockOrder
      });

      expect(result.sent).toBe(true);
      expect(result).toHaveProperty('orderUrl');
      expect(result.orderUrl).toContain(`/orders/${mockOrder.id}`);
      expect(result.orderNumber).toBe('ORD-2026-8888');
    });

    it('should fail order confirmation when recipient email is missing', async () => {
      const result = await sendOrderConfirmationEmail({
        order: { id: 'no-email-order', items: [] }
      });

      expect(result.sent).toBe(false);
      expect(result.error).toContain('Recipient email not specified');
    });

    it('should send generic custom or notification email', async () => {
      const result = await sendCustomEmail({
        to: 'inquiry@example.com',
        toName: 'Parent',
        subject: 'Custom Inquiry',
        message: 'Your inquiry has been received.'
      });

      expect(result.sent).toBe(true);
      expect(result.subject).toBe('Custom Inquiry');
    });
  });

  describe('Email API Endpoints (/api/email)', () => {
    it('GET /api/email/status should return email provider diagnostic details', async () => {
      const res = await request(app).get('/api/email/status');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('configured');
      expect(res.body.data).toHaveProperty('activeProvider');
      expect(res.body.data).toHaveProperty('emailjs');
      expect(res.body.data.emailjs).toHaveProperty('templates');
    });

    it('POST /api/email/send-test should dispatch a test custom email successfully', async () => {
      const res = await request(app)
        .post('/api/email/send-test')
        .send({
          to: 'tester@edumart.lk',
          firstName: 'Charuka',
          subject: 'Diagnostic Check',
          message: 'Verifying end-to-end outbound email dispatch pipeline'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.recipient).toBe('tester@edumart.lk');
      expect(res.body.result.sent).toBe(true);
    });

    it('POST /api/email/send-test should support verification template test', async () => {
      const res = await request(app)
        .post('/api/email/send-test')
        .send({
          to: 'tester@edumart.lk',
          templateType: 'verification'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toHaveProperty('verificationUrl');
    });

    it('POST /api/email/send-test should support password reset template test', async () => {
      const res = await request(app)
        .post('/api/email/send-test')
        .send({
          to: 'tester@edumart.lk',
          templateType: 'reset'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toHaveProperty('resetUrl');
    });

    it('POST /api/email/send-test should support order confirmation template test', async () => {
      const res = await request(app)
        .post('/api/email/send-test')
        .send({
          to: 'tester@edumart.lk',
          templateType: 'order'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toHaveProperty('orderUrl');
    });

    it('POST /api/email/send-test should return 400 when recipient email is missing or invalid', async () => {
      const res = await request(app)
        .post('/api/email/send-test')
        .send({
          to: 'not-an-email',
          subject: 'Test'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('valid recipient email address');
    });
  });
});
