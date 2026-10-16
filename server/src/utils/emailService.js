const tls = require('tls');
const net = require('net');

/**
 * Full-featured zero-dependency SMTP client using Node.js native tls/net modules.
 * Supports both Port 465 (Implicit TLS) and Port 587 (STARTTLS) with AUTH LOGIN.
 */
const sendSmtpMail = ({ host, port, secure, user, pass, from, to, subject, html }) => {
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
          // ignore close errors
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
          step = 15; // STARTTLS upgrade step
          sendLine('STARTTLS');
        } else {
          step = 2;
          sendLine('AUTH LOGIN');
        }
      } else if (step === 15 && code === 220) {
        // Upgrade plain TCP socket to TLS
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
        sendLine(Buffer.from(pass.replace(/\s+/g, '')).toString('base64'));
      } else if (step === 4 && code === 235) {
        step = 5;
        sendLine(`MAIL FROM:<${from.trim()}>`);
      } else if (step === 5 && code === 250) {
        step = 6;
        sendLine(`RCPT TO:<${to.trim()}>`);
      } else if (step === 6 && code === 250) {
        step = 7;
        sendLine('DATA');
      } else if (step === 7 && code === 354) {
        step = 8;
        const message = [
          `From: "EduMart" <${from.trim()}>`,
          `To: <${to.trim()}>`,
          `Subject: ${subject}`,
          `Date: ${new Date().toUTCString()}`,
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
        finish(null, { sent: true });
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
          // In SMTP, '250-...' is a continuation line, whereas '250 ...' is the final line of the reply
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
 * Send account verification email to the user's email address
 */
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const baseUrl = getFrontendBaseUrl();
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const smtpFrom = (process.env.SMTP_FROM || smtpUser || 'noreply@edumart.com').trim();

  if (smtpHost && smtpUser && smtpPass && process.env.NODE_ENV !== 'test') {
    try {
      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">EduMart</h1>
            <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 14px;">Educational Resources Marketplace</p>
          </div>
          <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Verify your email address</h2>
          <p style="color: #374151; line-height: 1.6; font-size: 15px;">
            Hi <strong>${firstName || 'Learner'}</strong>,
          </p>
          <p style="color: #374151; line-height: 1.6; font-size: 15px;">
            Thank you for creating an EduMart account! To complete your registration and activate full access to your account, please verify your email address by clicking the button below:
          </p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
              Verify My Email Address
            </a>
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

      console.log(`[EMAIL-SERVICE] Verification email successfully sent to ${email}`);
      return { sent: true, verificationUrl };
    } catch (err) {
      console.error(`[EMAIL-SERVICE] Failed to send verification email to ${email}: ${err.message}`);
      return { sent: false, error: err.message, verificationUrl };
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    console.warn(
      `[EMAIL-SERVICE] SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured in .env. ` +
      `Email was not sent to ${email}. Verification link: ${verificationUrl}`
    );
  }

  return { sent: false, verificationUrl };
};

/**
 * Send password reset email to the user's email address
 */
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const baseUrl = getFrontendBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const smtpFrom = (process.env.SMTP_FROM || smtpUser || 'noreply@edumart.com').trim();

  if (smtpHost && smtpUser && smtpPass && process.env.NODE_ENV !== 'test') {
    try {
      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">EduMart</h1>
            <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 14px;">Educational Resources Marketplace</p>
          </div>
          <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Reset your password</h2>
          <p style="color: #374151; line-height: 1.6; font-size: 15px;">
            Hi <strong>${firstName || 'there'}</strong>, we received a request to reset the password for your EduMart account. Click the button below within 1 hour to choose a new password:
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

      console.log(`[EMAIL-SERVICE] Password reset email successfully sent to ${email}`);
      return { sent: true, resetUrl };
    } catch (err) {
      console.error(`[EMAIL-SERVICE] Failed to send password reset email to ${email}: ${err.message}`);
      return { sent: false, error: err.message, resetUrl };
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    console.warn(
      `[EMAIL-SERVICE] SMTP credentials are not configured in .env. ` +
      `Password reset link for ${email}: ${resetUrl}`
    );
  }

  return { sent: false, resetUrl };
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
