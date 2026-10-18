import emailService, {
  getEmailStatus,
  sendTestEmail,
  sendDirectEmailJs
} from '../services/emailService';
import api from '../services/api';

jest.mock('../services/api');

describe('Client Email Service (EmailJS)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmailStatus', () => {
    it('should fetch status diagnostic data from /email/status', async () => {
      const mockStatusData = {
        success: true,
        data: {
          configured: true,
          activeProvider: 'emailjs',
          emailjs: { configured: true, serviceId: 'service_test' }
        }
      };
      api.get.mockResolvedValueOnce({ data: mockStatusData });

      const result = await getEmailStatus();
      expect(api.get).toHaveBeenCalledWith('/email/status');
      expect(result).toEqual(mockStatusData);
    });
  });

  describe('sendTestEmail', () => {
    it('should post test email payload to /email/send-test', async () => {
      const mockResponse = {
        success: true,
        message: 'Test email successfully processed'
      };
      api.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await sendTestEmail({
        to: 'tester@edumart.lk',
        subject: 'Unit Test',
        message: 'Hello World',
        templateType: 'custom'
      });

      expect(api.post).toHaveBeenCalledWith('/email/send-test', {
        to: 'tester@edumart.lk',
        subject: 'Unit Test',
        message: 'Hello World',
        templateType: 'custom',
        firstName: undefined
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendDirectEmailJs', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should throw an error when required configuration is missing', async () => {
      await expect(
        sendDirectEmailJs({
          serviceId: '',
          templateId: '',
          publicKey: ''
        })
      ).rejects.toThrow('EmailJS Service ID, Template ID, and Public Key are required');
    });

    it('should post directly to EmailJS REST API endpoint when invoked', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => 'OK'
      });

      const result = await sendDirectEmailJs({
        serviceId: 'srv_123',
        templateId: 'tmpl_456',
        publicKey: 'pub_789',
        templateParams: {
          to_email: 'learner@edumart.lk',
          to_name: 'Charuka'
        }
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.emailjs.com/api/v1.0/email/send',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: 'srv_123',
            template_id: 'tmpl_456',
            user_id: 'pub_789',
            template_params: {
              to_email: 'learner@edumart.lk',
              to_name: 'Charuka'
            }
          })
        })
      );
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should handle EmailJS non-200 responses gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'The service ID is invalid'
      });

      await expect(
        sendDirectEmailJs({
          serviceId: 'bad_srv',
          templateId: 'tmpl_456',
          publicKey: 'pub_789',
          templateParams: {}
        })
      ).rejects.toThrow('EmailJS failed with HTTP 400: The service ID is invalid');
    });
  });
});
