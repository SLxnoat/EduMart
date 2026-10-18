# EduMart Platform — Professional Email Templates & EmailJS Guide

This document contains production-ready, fully responsive HTML email templates designed for **EduMart Marketplace Platform**. These templates are optimized for EmailJS, desktop email clients (Outlook, Apple Mail), webmail (Gmail, Yahoo, Proton), and mobile devices.

---

## Table of Contents
1. [EmailJS Setup Instructions](#emailjs-setup-instructions)
2. [Design System & Template Variables](#design-system--template-variables)
3. [Template 1: Account Verification (`template_verify`)](#template-1-account-verification-template_verify)
4. [Template 2: Password Reset Recovery (`template_reset`)](#template-2-password-reset-recovery-template_reset)
5. [Template 3: Order Confirmation & Digital Download Receipt (`template_order`)](#template-3-order-confirmation--digital-download-receipt-template_order)
6. [Template 4: Tutor Sale & Earnings Notification (`template_seller_sale`)](#template-4-tutor-sale--earnings-notification-template_seller_sale)
7. [Template 5: Study Material Listing Approved (`template_product_approved`)](#template-5-study-material-listing-approved-template_product_approved)
8. [Template 6: General Platform Inquiries & Announcements (`template_edumart`)](#template-6-general-platform-inquiries--announcements-template_edumart)

---

## EmailJS Setup Instructions

To deploy these templates into your live EmailJS account:

1. **Log in** to your [EmailJS Dashboard](https://dashboard.emailjs.com).
2. Go to **Email Templates** $\rightarrow$ Click **Create New Template**.
3. In the template settings:
   - **Template Name**: e.g., `EduMart Account Verification`
   - **Template ID**: Set to match your `.env` (e.g., `template_verify`, `template_reset`, `template_order`, `template_edumart`)
   - **To Email**: `{{to_email}}`
   - **From Name**: `{{from_name}}` (or `EduMart Educational Platform`)
   - **Reply-To**: `{{reply_to}}` (or `support@edumart.lk`)
   - **Subject**: Enter the recommended subject line provided below.
4. In the editor toolbar, click the **Source Code** or **`</>`** button.
5. Paste the complete HTML code block for the respective template.
6. Click **Save** in the top-right corner.

---

## Design System & Template Variables

### Palette & Typography
- **Primary Brand Color**: `#2563EB` (Royal Blue)
- **Accent / Instant Digital**: `#059669` (Emerald Green)
- **Courier / Logistics**: `#1D4ED8` (Navy Blue)
- **Canvas / Background**: `#F3F4F6` (Cool Gray)
- **Card Background**: `#FFFFFF` (Pure White)
- **Text Main**: `#111827` (Slate 900)
- **Text Muted**: `#4B5563` (Slate 600)
- **Borders & Dividers**: `#E5E7EB` (Slate 200)
- **Typography**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`

### Global Variables Auto-Mapped by EduMart Backend

| Variable | Description |
| :--- | :--- |
| `{{to_email}}` / `{{user_email}}` | Recipient email address |
| `{{to_name}}` / `{{user_name}}` | Recipient first name or display name |
| `{{subject}}` | Email subject line |
| `{{from_name}}` | Sender title (`EduMart Platform`) |
| `{{reply_to}}` | Support reply mailbox (`support@edumart.lk`) |
| `{{verification_url}}` / `{{link}}` | Full verification link with authentication token |
| `{{reset_url}}` / `{{link}}` | Full password reset link with authentication token |
| `{{order_number}}` | Order tracking code (e.g. `ORD-2026-8888`) |
| `{{total_amount}}` | Formatted transaction total (e.g. `LKR 3,500.00`) |
| `{{items_summary}}` | Purchased materials summary list |
| `{{order_url}}` | Direct link to view receipt and download digital files |
| `{{message}}` | Custom body copy for announcements or inquiries |

---

## Template 1: Account Verification (`template_verify`)

- **Template ID**: `template_verify`
- **Recommended Subject**: `Verify your EduMart Account — Welcome, {{to_name}}!`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your EduMart Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 30px; font-weight: 800; letter-spacing: -0.5px;">EduMart</h1>
              <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 14px; font-weight: 500;">Educational Resources & Study Marketplace</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 22px; font-weight: 700;">Welcome to EduMart, {{to_name}}! 🎉</h2>
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Thank you for joining Sri Lanka’s premier educational marketplace for exam revision guides, past paper collections, and verified tutor study materials.
              </p>
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Please confirm your email address to activate your account and unlock instant access to your study library:
              </p>
              <!-- Call to Action Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="{{verification_url}}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                      Verify My Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin: 24px 0;">
                <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Direct Link</p>
                <p style="margin: 0; font-size: 13px; word-break: break-all;">
                  <a href="{{verification_url}}" style="color: #2563eb; text-decoration: underline;">{{verification_url}}</a>
                </p>
              </div>
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                If you did not sign up for an EduMart account, please ignore this email or contact our support team.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                EduMart Educational Services Ltd. • Colombo, Sri Lanka
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Need assistance? Reach out to <a href="mailto:{{reply_to}}" style="color: #2563eb; text-decoration: none;">{{reply_to}}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 2: Password Reset Recovery (`template_reset`)

- **Template ID**: `template_reset`
- **Recommended Subject**: `Reset your EduMart Password — Security Notice`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your EduMart Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 30px; font-weight: 800; letter-spacing: -0.5px;">EduMart</h1>
              <p style="margin: 6px 0 0 0; color: #93c5fd; font-size: 14px; font-weight: 500;">Account Security Portal</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Request: Password Reset
                </p>
              </div>
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 700;">Hi {{to_name}},</h2>
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                We received a request to reset the password for your EduMart account associated with <strong>{{to_email}}</strong>.
              </p>
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                To choose a new secure password, click the button below. This link is valid for <strong>1 hour</strong>:
              </p>
              <!-- Call to Action Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="{{reset_url}}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin: 24px 0;">
                <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Alternative Link</p>
                <p style="margin: 0; font-size: 13px; word-break: break-all;">
                  <a href="{{reset_url}}" style="color: #2563eb; text-decoration: underline;">{{reset_url}}</a>
                </p>
              </div>
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                If you did not request this change, please ignore this email or review your account activity. Your current password remains unchanged.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                EduMart Security Operations • Questions? Contact <a href="mailto:{{reply_to}}" style="color: #2563eb;">{{reply_to}}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 3: Order Confirmation & Digital Download Receipt (`template_order`)

- **Template ID**: `template_order`
- **Recommended Subject**: `Order Confirmed #{{order_number}} — Instant Delivery & Receipt`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #{{order_number}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 650px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">EduMart</h1>
              <p style="margin: 6px 0 0 0; color: #a7f3d0; font-size: 14px; font-weight: 500;">Payment Confirmed & Digital Delivery</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 22px; font-weight: 700;">Thank you for your order, {{to_name}}! 📚</h2>
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Your payment for <strong>Order #{{order_number}}</strong> has been authenticated. Any digital study packs in this order have been permanently unlocked in your account.
              </p>

              <!-- Instant Digital Materials Notification Banner -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 16px; font-weight: 700;">⚡ Instant Digital Downloads Ready</h3>
                    <p style="margin: 0 0 14px 0; color: #047857; font-size: 14px; line-height: 1.5;">
                      Your PDF revision papers and digital materials are ready to download immediately.
                    </p>
                    <a href="{{order_url}}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 6px;">
                      Download Digital Materials
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Order Summary Section -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
                <tr style="background-color: #f9fafb;">
                  <th align="left" style="padding: 12px 16px; color: #4b5563; font-size: 13px; text-transform: uppercase;">Purchased Items</th>
                  <th align="right" style="padding: 12px 16px; color: #4b5563; font-size: 13px; text-transform: uppercase;">Amount</th>
                </tr>
                <tr>
                  <td style="padding: 16px; border-top: 1px solid #e5e7eb; color: #111827; font-size: 14px; line-height: 1.6;">
                    <strong>{{items_summary}}</strong>
                  </td>
                  <td align="right" style="padding: 16px; border-top: 1px solid #e5e7eb; color: #111827; font-size: 15px; font-weight: 700;">
                    {{total_amount}}
                  </td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td align="right" style="padding: 14px 16px; border-top: 2px solid #e5e7eb; font-weight: 700; color: #374151;">Total Paid:</td>
                  <td align="right" style="padding: 14px 16px; border-top: 2px solid #e5e7eb; font-weight: 800; color: #059669; font-size: 18px;">
                    {{total_amount}}
                  </td>
                </tr>
              </table>

              <!-- Action Link -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="{{order_url}}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px;">
                      View Order & Tax Invoice
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">
                EduMart Marketplace Platform Ltd. • Colombo, Sri Lanka
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Need help with your order? Contact <a href="mailto:{{reply_to}}" style="color: #2563eb;">{{reply_to}}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 4: Tutor Sale & Earnings Notification (`template_seller_sale`)

- **Template ID**: `template_seller_sale`
- **Recommended Subject**: `New Sale Notification! You earned on Order #{{order_number}}`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Sale Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800;">EduMart Creator Studio</h1>
              <p style="margin: 4px 0 0 0; color: #ddd6fe; font-size: 14px;">Tutor & Educational Partner Portal</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 40px;">
              <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">Great news, {{to_name}}! 💰</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                A student has just purchased your study material through EduMart:
              </p>
              <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #5b21b6; font-size: 15px; font-weight: 700;">
                  📦 {{items_summary}}
                </p>
                <p style="margin: 0; color: #6d28d9; font-size: 14px;">
                  Order ID: <strong>#{{order_number}}</strong> • Earnings Credited: <strong>{{total_amount}}</strong>
                </p>
              </div>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 28px;">
                Your seller balance has been updated. You can review buyer ratings, analytics, and withdraw earnings in your Tutor Dashboard.
              </p>
              <div style="text-align: center;">
                <a href="{{order_url}}" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
                  View Tutor Dashboard
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">EduMart Creator Studio • Colombo, Sri Lanka</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 5: Study Material Listing Approved (`template_product_approved`)

- **Template ID**: `template_product_approved`
- **Recommended Subject**: `Listing Approved: Your study pack is now live on EduMart!`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Study Material Approved</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800;">EduMart Quality Team</h1>
              <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 14px;">Curriculum & Material Verification</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 40px;">
              <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">Congratulations, {{to_name}}! ✅</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                Our curriculum team has reviewed and verified your educational material:
              </p>
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 6px 0; color: #065f46; font-size: 16px; font-weight: 700;">
                  📘 {{items_summary}}
                </p>
                <p style="margin: 0; color: #047857; font-size: 13px;">
                  Status: <strong>Active & Listed in Catalog</strong>
                </p>
              </div>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 28px;">
                Students across Sri Lanka can now discover, sample, and purchase your materials. Share your listing link with students to drive enrollment!
              </p>
              <div style="text-align: center;">
                <a href="{{order_url}}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
                  View Live Material Listing
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">EduMart Academic Review Board • Colombo, Sri Lanka</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 6: General Platform Inquiries & Announcements (`template_edumart`)

- **Template ID**: `template_edumart`
- **Recommended Subject**: `{{subject}} — EduMart Support`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">EduMart</h1>
              <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 14px;">Educational Marketplace</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px;">Hi {{to_name}},</h2>
              <div style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                {{message}}
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                Warm regards,<br/>
                <strong>The EduMart Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                EduMart Educational Services Ltd. • <a href="mailto:{{reply_to}}" style="color: #2563eb;">{{reply_to}}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Verification & Testing Guide

You can immediately test and preview each template using the EduMart backend diagnostic test tool or REST API:

### 1. Test Verification Email
```bash
curl -X POST http://localhost:5000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "firstName": "John", "templateType": "verification"}'
```

### 2. Test Password Reset Email
```bash
curl -X POST http://localhost:5000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "firstName": "John", "templateType": "reset"}'
```

### 3. Test Order Confirmation Email
```bash
curl -X POST http://localhost:5000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "firstName": "John", "templateType": "order"}'
```

### 4. Check Current Configuration Status
```bash
curl http://localhost:5000/api/email/status
```
