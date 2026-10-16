const tls = require('tls');
const net = require('net');

/**
 * Lightweight zero-dependency SMTP client using Node.js native tls/net modules.
 * Sends real emails when SMTP_HOST, SMTP_USER, and SMTP_PASS are set in environment variables,
 * and falls back gracefully to console output + direct verification URLs in local/Docker dev mode.
 */
const sendSmtpMail = ({ host, port, secure, user, pass, from, to, subject, html }) => {
  return new Promise((resolve, reject) => {
    const timeoutMs = 8000;
    let step = 0;
    let buffer = '';

    const onConnect = (socket) => {
      socket.setEncoding('utf8');
      socket.setTimeout(timeoutMs, () => {
        socket.destroy();
        reject(new Error('SMTP connection timed out'));
      });

      const sendLine = (line) => {
        socket.write(`${line}\r\n`);
      };

      socket.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\r\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line || line[3] === '-') continue;
          const code = parseInt(line.substring(0, 3), 10);

          if (code >= 400) {
            socket.end();
            return reject(new Error(`SMTP Error ${code}: ${line}`));
          }

          if (step === 0 && code === 220) {
            step = 1;
            sendLine(`EHLO edumart.local`);
          } else if (step === 1 && code === 250) {
            step = 2;
            sendLine('AUTH LOGIN');
          } else if (step === 2 && code === 334) {
            step = 3;
            sendLine(Buffer.from(user).toString('base64'));
          } else if (step === 3 && code === 334) {
            step = 4;
            sendLine(Buffer.from(pass).toString('base64'));
          } else if (step === 4 && code === 235) {
            step = 5;
            sendLine(`MAIL FROM:<${from}>`);
          } else if (step === 5 && code === 250) {
            step = 6;
            sendLine(`RCPT TO:<${to}>`);
          } else if (step === 6 && code === 250) {
            step = 7;
            sendLine('DATA');
          } else if (step === 7 && code === 354) {
            step = 8;
            const message = [
              `From: "EduMart" <${from}>`,
              `To: <${to}>`,
              `Subject: ${subject}`,
              'MIME-Version: 1.0',
              'Content-Type: text/html; charset=UTF-8',
              '',
              html,
              '.'
            ].join('\r\n');
            sendLine(message);
          } else if (step === 8 && code === 250) {
            step = 9;
            sendLine('QUIT');
            socket.end();
            resolve({ sent: true });
          }
        }
      });

      socket.on('error', (err) => reject(err));
    };

    if (secure) {
      const socket = tls.connect({ host, port, rejectUnauthorized: false }, () => onConnect(socket));
      socket.on('error', reject);
    } else {
      const socket = net.createConnection({ host, port }, () => onConnect(socket));
      socket.on('error', reject);
    }
  });
};

const getFrontendBaseUrl = () => {
  return (process.env.FRONTEND_URL || 'http://localhost').replace(/\/$/, '');
};

/**
 * Send account verification email to newly registered user
 */
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const baseUrl = getFrontendBaseUrl();
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

  if (process.env.NODE_ENV !== 'test') {
    console.log(`[EMAIL-SERVICE] Verification URL for ${email}: ${verificationUrl}`);
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@edumart.com';

  if (smtpHost && smtpUser && smtpPass && process.env.NODE_ENV !== 'test') {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">Welcome to EduMart, ${firstName || 'Learner'}!</h2>
          <p style="color: #374151; line-height: 1.6;">
            Thank you for creating an EduMart account. Please verify your email address by clicking the button below:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
          </p>
        </div>
      `;

      await sendSmtpMail({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom,
        to: email,
        subject: 'Verify your EduMart Account',
        html
      });

      return { sent: true, verificationUrl };
    } catch (err) {
      console.warn(`[EMAIL-SERVICE] SMTP send failed (${err.message}). Falling back to direct link.`);
    }
  }

  return { sent: false, verificationUrl };
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const baseUrl = getFrontendBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  if (process.env.NODE_ENV !== 'test') {
    console.log(`[EMAIL-SERVICE] Password Reset URL for ${email}: ${resetUrl}`);
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@edumart.com';

  if (smtpHost && smtpUser && smtpPass && process.env.NODE_ENV !== 'test') {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">EduMart Password Reset Request</h2>
          <p style="color: #374151; line-height: 1.6;">
            Hi ${firstName || 'there'}, we received a request to reset your EduMart password. Click the button below within 1 hour to set a new password:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
          </p>
        </div>
      `;

      await sendSmtpMail({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom,
        to: email,
        subject: 'Reset your EduMart Password',
        html
      });

      return { sent: true, resetUrl };
    } catch (err) {
      console.warn(`[EMAIL-SERVICE] SMTP send failed (${err.message}). Falling back to direct link.`);
    }
  }

  return { sent: false, resetUrl };
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
