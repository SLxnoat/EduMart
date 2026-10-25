const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const tls = require('tls');
const net = require('net');
const https = require('https');
const crypto = require('crypto');

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (_) {
  // Graceful fallback to native socket SMTP if nodemailer is unavailable
}

/**
 * Mask sensitive key or email for secure diagnostic display
 */
const maskKey = (str) => {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (trimmed.length <= 4) return '****';
  return `${trimmed.substring(0, 2)}****${trimmed.substring(trimmed.length - 2)}`;
};

/**
 * Parse and normalize sender address into friendly name and clean email address.
 * Safely handles formats such as:
 * - "EduMart" <name@domain.com>
 * - EduMart <name@domain.com>
 * - EduMart name@domain.com
 * - name@domain.com
 */
const parseSenderAddress = (senderStr, fallbackEmail) => {
  const fallback = (fallbackEmail || 'support@edumart.lk').trim();
  if (!senderStr || typeof senderStr !== 'string') {
    return { name: 'EduMart', address: fallback, formatted: `"EduMart" <${fallback}>` };
  }
  const trimmed = senderStr.trim();

  // Pattern: "Name" <email> or Name <email>
  const bracketMatch = trimmed.match(/^(?:["']?([^"']*)["']?\s*)?<([^>]+@[^>]+)>$/);
  if (bracketMatch) {
    const name = (bracketMatch[1] || 'EduMart').trim();
    const address = bracketMatch[2].trim();
    return { name, address, formatted: `"${name}" <${address}>` };
  }

  // Pattern: Name email@domain.com
  const spaceMatch = trimmed.match(/^(?:([^\s<]+(?:\s+[^\s<]+)*)\s+)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
  if (spaceMatch && spaceMatch[1]) {
    const name = spaceMatch[1].replace(/["']/g, '').trim() || 'EduMart';
    const address = spaceMatch[2].trim();
    return { name, address, formatted: `"${name}" <${address}>` };
  }

  // Raw email
  if (trimmed.includes('@')) {
    return { name: 'EduMart', address: trimmed, formatted: `"EduMart" <${trimmed}>` };
  }

  return { name: trimmed, address: fallback, formatted: `"${trimmed}" <${fallback}>` };
};

/**
 * Check if EmailJS credentials are configured with non-placeholder values
 */
const isEmailJsConfigured = () => {
  const serviceId = (process.env.EMAILJS_SERVICE_ID || '').trim();
  const publicKey = (process.env.EMAILJS_PUBLIC_KEY || '').trim();
  if (!serviceId || !publicKey) return false;
  if (publicKey.startsWith('your_') || serviceId.startsWith('service_edumart_placeholder')) {
    return false;
  }
  return true;
};

/**
 * Check if SMTP credentials are configured with non-placeholder values
 */
const isSmtpConfigured = () => {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  return Boolean(
    host &&
    user &&
    pass &&
    !user.startsWith('your_') &&
    !pass.startsWith('your_')
  );
};

/**
 * Send email via EmailJS REST API v1.0 using Node.js native https module.
 * Endpoint: POST https://api.emailjs.com/api/v1.0/email/send
 */
const sendEmailJsMail = ({ serviceId, templateId, publicKey, privateKey, templateParams = {} }) => {
  return new Promise((resolve, reject) => {
    const sId = (serviceId !== undefined ? serviceId : (process.env.EMAILJS_SERVICE_ID || '')).trim();
    const tId = (templateId !== undefined ? templateId : (process.env.EMAILJS_TEMPLATE_ID || '')).trim();
    const pKey = (publicKey !== undefined ? publicKey : (process.env.EMAILJS_PUBLIC_KEY || '')).trim();
    const privKey = (privateKey !== undefined ? privateKey : (process.env.EMAILJS_PRIVATE_KEY || '')).trim();

    if (!sId || !tId || !pKey) {
      return reject(new Error('EmailJS requires serviceId, templateId, and publicKey (user_id)'));
    }

    const payload = JSON.stringify({
      service_id: sId,
      template_id: tId,
      user_id: pKey,
      ...(privKey && !privKey.startsWith('your_') ? { accessToken: privKey } : {}),
      template_params: templateParams
    });

    const options = {
      hostname: 'api.emailjs.com',
      port: 443,
      path: '/api/v1.0/email/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'EduMart-Platform/1.0',
        'Origin': 'https://edumart.lk'
      },
      timeout: 12000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ sent: true, provider: 'emailjs', status: res.statusCode, response: data });
        } else {
          reject(new Error(`EmailJS API returned ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('EmailJS API request timed out'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Send email via SMTP. Uses Nodemailer when available for industry-standard deliverability,
 * MIME multipart/alternative (text + HTML), RFC-5322 compliance, and anti-spam header construction.
 * Seamlessly falls back to native TLS/net sockets if Nodemailer is absent.
 */
const sendSmtpMail = async ({ host, port, secure, user, pass, from, to, subject, html, text }) => {
  const parsedSender = parseSenderAddress(from, user);
  const plainText = text || (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');
  const cleanPass = (pass || '').replace(/\s+/g, '');
  const recipient = to.trim();

  // Primary Path: Nodemailer
  if (nodemailer) {
    const isPort465 = port === 465 || secure === true;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: isPort465,
      auth: {
        user: user.trim(),
        pass: cleanPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: parsedSender.formatted,
      to: recipient,
      replyTo: process.env.SMTP_REPLY_TO || parsedSender.address,
      subject,
      text: plainText,
      html,
      headers: {
        'X-Mailer': 'EduMart Platform v1.0',
        'X-Priority': '3',
        'Auto-Submitted': 'auto-generated'
      }
    });

    return {
      sent: true,
      provider: 'smtp',
      messageId: info.messageId,
      response: info.response
    };
  }

  // Secondary Path: Zero-dependency native TLS/net socket client
  return new Promise((resolve, reject) => {
    const timeoutMs = 15000;
    let step = 0;
    let buffer = '';
    let activeSocket = null;
    let settled = false;

    const finish = (err, result) => {
      if (settled) return;
      settled = true;
      if (activeSocket && !activeSocket.destroyed) {
        try {
          activeSocket.end();
        } catch (_) {
          // ignore
        }
      }
      if (err) reject(err);
      else resolve(result);
    };

    const sendLine = (line) => {
      if (activeSocket && !activeSocket.destroyed) {
        activeSocket.write(`${line}\r\n`);
      }
    };

    const handleSmtpResponse = (code, fullText) => {
      if (code >= 400) {
        return finish(new Error(`SMTP Error ${code}: ${fullText}`));
      }

      if (step === 0 && code === 220) {
        step = 1;
        sendLine('EHLO edumart.local');
      } else if (step === 1 && code === 250) {
        if (!secure && port === 587 && fullText.toUpperCase().includes('STARTTLS')) {
          step = 15;
          sendLine('STARTTLS');
        } else {
          step = 2;
          sendLine('AUTH LOGIN');
        }
      } else if (step === 15 && code === 220) {
        activeSocket.removeAllListeners('data');
        const tlsSocket = tls.connect(
          {
            socket: activeSocket,
            host,
            servername: host,
            rejectUnauthorized: false
          },
          () => {
            activeSocket = tlsSocket;
            attachListeners(tlsSocket);
            step = 16;
            sendLine('EHLO edumart.local');
          }
        );
        tlsSocket.on('error', (err) => finish(err));
      } else if (step === 16 && code === 250) {
        step = 2;
        sendLine('AUTH LOGIN');
      } else if (step === 2 && code === 334) {
        step = 3;
        sendLine(Buffer.from(user.trim()).toString('base64'));
      } else if (step === 3 && code === 334) {
        step = 4;
        sendLine(Buffer.from(cleanPass).toString('base64'));
      } else if (step === 4 && code === 235) {
        step = 5;
        sendLine(`MAIL FROM:<${parsedSender.address}>`);
      } else if (step === 5 && code === 250) {
        step = 6;
        sendLine(`RCPT TO:<${recipient}>`);
      } else if (step === 6 && code === 250) {
        step = 7;
        sendLine('DATA');
      } else if (step === 7 && code === 354) {
        step = 8;
        const boundary = `----=_Part_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const messageId = `<${Date.now()}.${crypto.randomBytes(8).toString('hex')}@${host}>`;

        const message = [
          `From: ${parsedSender.formatted}`,
          `To: <${recipient}>`,
          `Reply-To: <${parsedSender.address}>`,
          `Subject: ${subject}`,
          `Date: ${new Date().toUTCString()}`,
          `Message-ID: ${messageId}`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/plain; charset=UTF-8',
          'Content-Transfer-Encoding: 8bit',
          '',
          plainText,
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: 8bit',
          '',
          html,
          '',
          `--${boundary}--`,
          '.'
        ].join('\r\n');
        sendLine(message);
      } else if (step === 8 && code === 250) {
        step = 9;
        sendLine('QUIT');
        finish(null, { sent: true, provider: 'smtp' });
      }
    };

    const attachListeners = (sock) => {
      sock.setEncoding('utf8');
      sock.setTimeout(timeoutMs, () => {
        finish(new Error('SMTP connection timed out'));
      });

      let multiLineAcc = [];
      sock.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\r\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line) continue;
          multiLineAcc.push(line);
          if (line.length >= 4 && line[3] === '-') {
            continue;
          }
          const code = parseInt(line.substring(0, 3), 10);
          const fullText = multiLineAcc.join(' | ');
          multiLineAcc = [];
          if (!Number.isNaN(code)) {
            handleSmtpResponse(code, fullText);
          }
        }
      });

      sock.on('error', (err) => finish(err));
    };

    if (secure) {
      activeSocket = tls.connect(
        { host, port, servername: host, rejectUnauthorized: false },
        () => attachListeners(activeSocket)
      );
      activeSocket.on('error', (err) => finish(err));
    } else {
      activeSocket = net.createConnection({ host, port }, () => attachListeners(activeSocket));
      activeSocket.on('error', (err) => finish(err));
    }
  });
};

const getFrontendBaseUrl = () => {
  return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
};

/**
 * Dispatch an email through the multi-provider pipeline:
 * 1. EmailJS (if configured and not test mode)
 * 2. SMTP (Nodemailer / TLS Socket)
 * 3. Fallback simulated delivery (in dev/test when no credentials provided)
 */
const dispatchEmail = async ({ to, subject, html, text, templateId, templateParams = {}, metadata = {} }) => {
  const isTest = process.env.NODE_ENV === 'test';

  // In automated test suite, fast-path simulated success unless explicitly forced
  if (isTest && !process.env.FORCE_NETWORK_EMAIL) {
    return {
      sent: true,
      provider: 'simulated',
      to,
      subject,
      ...metadata
    };
  }

  // 1. Try EmailJS
  if (isEmailJsConfigured()) {
    try {
      const emailJsResult = await sendEmailJsMail({
        templateId: templateId || process.env.EMAILJS_TEMPLATE_ID,
        templateParams: {
          to_email: to,
          user_email: to,
          email: to,
          to_name: templateParams.to_name || 'Valued User',
          user_name: templateParams.user_name || 'Valued User',
          subject: subject,
          message: templateParams.message || text || '',
          html_content: html,
          reply_to: process.env.EMAILJS_REPLY_TO || 'support@edumart.lk',
          from_name: 'EduMart Platform',
          ...templateParams
        }
      });
      console.log(`[EMAIL-SERVICE] EmailJS delivered successfully to ${to} (Subject: "${subject}")`);
      return { sent: true, provider: 'emailjs', ...metadata, ...emailJsResult };
    } catch (err) {
      console.warn(`[EMAIL-SERVICE] EmailJS dispatch attempt failed (${err.message}). Attempting SMTP fallback...`);
    }
  }

  // 2. Try SMTP
  if (isSmtpConfigured()) {
    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').trim();
    const smtpFrom = (process.env.SMTP_FROM || smtpUser || 'support@edumart.lk').trim();

    try {
      const result = await sendSmtpMail({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom,
        to,
        subject,
        html,
        text
      });
      console.log(`[EMAIL-SERVICE] SMTP delivered successfully to ${to} (Subject: "${subject}")`);
      return { sent: true, provider: 'smtp', ...metadata, ...result };
    } catch (err) {
      console.error(`[EMAIL-SERVICE] SMTP dispatch attempt failed: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        return { sent: false, provider: 'smtp', error: err.message, ...metadata };
      }
    }
  }

  // 3. Fallback simulated delivery for sandbox/development without live credentials
  console.info(
    `[EMAIL-SERVICE] [Sandbox/Simulated] Outbound email to ${to} logged. ` +
    `(No live EmailJS or SMTP credentials active). Metadata:`,
    metadata
  );

  return {
    sent: true,
    provider: 'simulated',
    to,
    subject,
    ...metadata
  };
};

/**
 * Send account verification email to the user's email address
 */
const sendVerificationEmail = async (email, firstName, verificationToken, options = {}) => {
  const reqOrigin = options?.origin || (options?.headers && (options.headers.origin || options.headers.referer));
  const cleanOrigin = reqOrigin ? reqOrigin.replace(/\/$/, '') : null;
  const baseUrl = cleanOrigin || getFrontendBaseUrl();
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
  const userName = firstName || 'Learner';

  const plainText = `Hi ${userName},

Thank you for creating an account with EduMart!

To verify your email address and activate your account, please click or visit the link below:
${verificationUrl}

Or enter this Verification Code / Token directly on the EduMart verification page:
${verificationToken}

If you did not register for an account on EduMart, you can safely disregard this message.

Kind regards,
The EduMart Platform Team
Educational Resources Marketplace
Support: support@edumart.lk`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 28px;">EduMart</h1>
        <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 14px;">Educational Resources Marketplace</p>
      </div>
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Verify your email address</h2>
      <p style="color: #374151; line-height: 1.6; font-size: 15px;">
        Hi <strong>${userName}</strong>,
      </p>
      <p style="color: #374151; line-height: 1.6; font-size: 15px;">
        Thank you for creating an EduMart account! To complete your registration and activate full access to your account, please verify your email address by clicking the button below:
      </p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
          Verify My Email Address
        </a>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Your Verification Code / Token:
        </p>
        <div style="background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-size: 13px; color: #1e40af; word-break: break-all; font-weight: bold; user-select: all;">
          ${verificationToken}
        </div>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">
          If viewing on a mobile phone, you can copy this code and paste it on the EduMart verification page on your computer.
        </p>
      </div>

      <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
        If the button above doesn't work, copy and paste this link into your browser:<br/>
        <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        If you did not create an EduMart account, you can safely ignore this email.
      </p>
    </div>
  `;

  return dispatchEmail({
    to: email,
    subject: 'Verify your EduMart Account',
    html,
    text: plainText,
    templateId: process.env.EMAILJS_TEMPLATE_VERIFY_ID || process.env.EMAILJS_TEMPLATE_ID,
    templateParams: {
      to_name: userName,
      user_name: userName,
      verification_url: verificationUrl,
      link: verificationUrl,
      action_url: verificationUrl,
      token: verificationToken
    },
    metadata: { verificationUrl }
  });
};

const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const baseUrl = getFrontendBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const userName = firstName || 'Learner';

  const plainText = `Hi ${userName},

We received a request to reset the password for your EduMart account.

Click the link below within 1 hour to choose a new password:
${resetUrl}

If you did not request a password reset, you can safely ignore this email.

Kind regards,
The EduMart Platform Team
support@edumart.lk`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 28px;">EduMart</h1>
        <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 14px;">Educational Resources Marketplace</p>
      </div>
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Reset your password</h2>
      <p style="color: #374151; line-height: 1.6; font-size: 15px;">
        Hi <strong>${userName}</strong>, we received a request to reset the password for your EduMart account. Click the button below within 1 hour to choose a new password:
      </p>
      <div style="margin: 32px 0; text-align: center;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
        Or copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  return dispatchEmail({
    to: email,
    subject: 'Reset your EduMart Password',
    html,
    text: plainText,
    templateId: process.env.EMAILJS_TEMPLATE_RESET_ID || process.env.EMAILJS_TEMPLATE_ID,
    templateParams: {
      to_name: userName,
      user_name: userName,
      reset_url: resetUrl,
      link: resetUrl,
      action_url: resetUrl,
      token: resetToken
    },
    metadata: { resetUrl }
  });
};

/**
 * Send order confirmation and instant digital delivery receipt email
 */
const sendOrderConfirmationEmail = async ({ email, firstName, order }) => {
  const baseUrl = getFrontendBaseUrl();
  const orderUrl = `${baseUrl}/orders/${order.id}`;

  const recipientEmail = email || order.user?.email || order.shipping_address?.email;
  const recipientName = firstName || order.user?.first_name || order.shipping_address?.fullName || 'Student';

  if (!recipientEmail) {
    return { sent: false, error: 'Recipient email not specified' };
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const hasDigital = items.some((i) => i.is_digital);
  const hasPhysical = items.some((i) => i.is_physical);

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827;">
        <strong>${item.product_title || 'Study Material'}</strong><br/>
        <span style="font-size: 12px; color: #6b7280;">${item.product_subject || ''} • ${item.product_grade_level || ''} (${item.is_digital ? 'Digital PDF' : 'Physical Book'})</span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: center; color: #374151;">${item.quantity || 1}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right; font-weight: 600; color: #111827;">${order.currency || 'LKR'} ${parseFloat(item.total_price || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const itemsSummaryText = items.map((i) => `${i.product_title || 'Study Material'} x ${i.quantity || 1}`).join(', ');

  const plainText = `Hi ${recipientName},

Thank you for your order on EduMart!
Order #${order.order_number} has been confirmed.

Total Paid: ${order.currency || 'LKR'} ${parseFloat(order.total_amount || 0).toFixed(2)}
Items: ${itemsSummaryText}

View your order and access study materials:
${orderUrl}

Kind regards,
The EduMart Platform Team
support@edumart.lk`;

  const digitalAccessBanner = hasDigital ? `
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h3 style="color: #065f46; margin: 0 0 8px 0; font-size: 16px;">
        ⚡ Instant Digital Study Materials Ready
      </h3>
      <p style="color: #047857; margin: 0 0 12px 0; font-size: 14px; line-height: 1.5;">
        Your purchased digital resources are authenticated and unlocked in your account. You can instantly download the PDFs now:
      </p>
      <a href="${orderUrl}" style="background-color: #059669; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
        Download Digital Materials
      </a>
    </div>
  ` : '';

  const physicalShippingBanner = hasPhysical ? `
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">
        📦 Parcel Courier Delivery
      </h3>
      <p style="color: #1d4ed8; margin: 0; font-size: 14px; line-height: 1.5;">
        Your printed educational package has been queued for warehouse packing and courier dispatch via <strong>${order.carrier || 'PromptX Express Courier'}</strong>. Tracking updates will be reflected in your order dashboard.
      </p>
    </div>
  ` : '';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 16px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 28px;">EduMart</h1>
        <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 14px;">Educational Resources Marketplace</p>
      </div>
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Order Confirmation & Receipt</h2>
      <p style="color: #374151; line-height: 1.6; font-size: 15px;">
        Hi <strong>${recipientName}</strong>, thank you for your order! Your payment for <strong>Order #${order.order_number}</strong> has been confirmed.
      </p>
      
      ${digitalAccessBanner}
      ${physicalShippingBanner}

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Material</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 13px; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Qty</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right; font-weight: 700; font-size: 15px; color: #111827;">Total Paid:</td>
            <td style="padding: 12px; text-align: right; font-weight: 700; font-size: 16px; color: #059669;">${order.currency || 'LKR'} ${parseFloat(order.total_amount || 0).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin: 32px 0; text-align: center;">
        <a href="${orderUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
          View Full Order & Tax Invoice
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px;">
        EduMart Marketplace Platform Ltd. • Colombo, Sri Lanka • Need help? Contact support@edumart.lk
      </p>
    </div>
  `;

  return dispatchEmail({
    to: recipientEmail,
    subject: `Order Confirmed #${order.order_number} - EduMart`,
    html,
    text: plainText,
    templateId: process.env.EMAILJS_TEMPLATE_ORDER_ID || process.env.EMAILJS_TEMPLATE_ID,
    templateParams: {
      to_name: recipientName,
      user_name: recipientName,
      order_number: order.order_number,
      order_id: order.id,
      total_amount: `${order.currency || 'LKR'} ${parseFloat(order.total_amount || 0).toFixed(2)}`,
      items_summary: itemsSummaryText,
      order_url: orderUrl,
      link: orderUrl,
      action_url: orderUrl
    },
    metadata: { orderUrl, orderNumber: order.order_number }
  });
};

/**
 * Send custom or notification email (e.g. contact form, tutor inquiry, broadcast)
 */
const sendCustomEmail = async ({ to, toName, subject, message, templateId, extraParams = {} }) => {
  if (!to) {
    return { sent: false, error: 'Recipient email not specified' };
  }

  const plainText = `Hi ${toName || 'Learner'},

${message}

Kind regards,
EduMart Marketplace Platform Ltd.
support@edumart.lk`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 16px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 28px;">EduMart</h1>
      </div>
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">${subject}</h2>
      <p style="color: #374151; line-height: 1.6; font-size: 15px;">
        Hi <strong>${toName || 'Learner'}</strong>,
      </p>
      <div style="color: #374151; line-height: 1.6; font-size: 15px; margin: 20px 0;">
        ${message}
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px;">
        EduMart Marketplace Platform Ltd. • Support: support@edumart.lk
      </p>
    </div>
  `;

  return dispatchEmail({
    to,
    subject,
    html,
    text: plainText,
    templateId: templateId || process.env.EMAILJS_TEMPLATE_ID,
    templateParams: {
      to_name: toName || 'Learner',
      user_name: toName || 'Learner',
      message,
      subject,
      ...extraParams
    },
    metadata: { subject }
  });
};

/**
 * Diagnostic and status inspection for email services
 */
const getEmailStatus = () => {
  const emailJsActive = isEmailJsConfigured();
  const smtpActive = isSmtpConfigured();

  let activeProvider = 'simulated';
  if (emailJsActive) activeProvider = 'emailjs';
  else if (smtpActive) activeProvider = 'smtp';

  return {
    configured: emailJsActive || smtpActive,
    activeProvider,
    emailjs: {
      configured: emailJsActive,
      serviceId: process.env.EMAILJS_SERVICE_ID || null,
      publicKeyMasked: maskKey(process.env.EMAILJS_PUBLIC_KEY),
      replyTo: process.env.EMAILJS_REPLY_TO || 'support@edumart.lk',
      templates: {
        default: process.env.EMAILJS_TEMPLATE_ID || null,
        verify: process.env.EMAILJS_TEMPLATE_VERIFY_ID || null,
        reset: process.env.EMAILJS_TEMPLATE_RESET_ID || null,
        order: process.env.EMAILJS_TEMPLATE_ORDER_ID || null
      }
    },
    smtp: {
      configured: smtpActive,
      host: process.env.SMTP_HOST || null,
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      userMasked: maskKey(process.env.SMTP_USER),
      engine: nodemailer ? 'nodemailer' : 'native-socket'
    }
  };
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendCustomEmail,
  sendEmailJsMail,
  sendSmtpMail,
  getEmailStatus,
  isEmailJsConfigured,
  isSmtpConfigured,
  parseSenderAddress
};
