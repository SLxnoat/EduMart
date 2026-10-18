const https = require('https');
const { Op } = require('sequelize');
const { Order, Product } = require('../models');
const { sendCustomEmail } = require('../utils/emailService');

const FAQ_KNOWLEDGE_BASE = [
  {
    intent: 'faq.digital_download',
    keywords: [
      'download', 'pdf', 'past paper', 'digital', 'ebook', 'file', 'papers', 'notes',
      'how to download', 'download items', 'downlod', 'dwnload', 'pdf ganna', 'download karanne'
    ],
    response: 'You can download purchased digital materials instantly from your Order Confirmation page or from your Profile under "My Downloads". Download links remain permanently active in your account.',
    quickReplies: ['View My Orders', 'Payment Help', 'Contact Support']
  },
  {
    intent: 'faq.tutor_registration',
    keywords: [
      'become a tutor', 'register as tutor', 'sell', 'upload material', 'seller',
      'instructor', 'teach', 'tutor', 'tutr', 'seler', 'tutor kenek'
    ],
    response: 'To sell materials on EduMart, register as a Tutor or Institute. Once logged in, visit the Seller Dashboard to upload past papers, model papers, or revision notes and start earning.',
    quickReplies: ['Register as Tutor', 'Seller Guidelines', 'Commission Rates']
  },
  {
    intent: 'faq.commission_rates',
    keywords: ['commission', 'commission rates', 'seller guidelines', 'fees', 'payout', 'earnings', 'royalty', 'comision'],
    response: 'EduMart tutors and institutes keep 85% of every sale! Platform commission is just 15% to cover payment processing and hosting. Seller guidelines require original or authorized PDFs under 50MB.',
    quickReplies: ['Become a Tutor', 'Payment Help', 'Contact Support']
  },
  {
    intent: 'faq.payment_help',
    keywords: ['payment', 'payment help', 'pay', 'card', 'visa', 'mastercard', 'billing', 'checkout issue', 'paymnt', 'gewanne kohomada'],
    response: 'We accept Visa, MasterCard, LankaQR, and bank transfers. All transactions are encrypted. If a payment fails, please verify your card limits or try again from your Cart.',
    quickReplies: ['Track My Order', 'Refund Policy', 'Contact Support']
  },
  {
    intent: 'faq.refund_policy',
    keywords: ['refund', 'money back', 'return', 'return policy', 'return request', 'cancel order', 'damaged', 'policy', 'refnd'],
    response: 'Physical printed materials can be returned within 7 days of delivery if damaged. Digital downloads are non-refundable once downloaded, unless the file is corrupt or unreadable.',
    quickReplies: ['Track My Order', 'Payment Help', 'Contact Support']
  },
  {
    intent: 'faq.shipping_delivery',
    keywords: ['track shipment', 'shipping', 'delivery', 'courier', 'dispatch', 'physical delivery', 'delivry', 'enna dawas'],
    response: 'Physical study packs are dispatched within 24 hours via island-wide courier and delivered in 2-4 business days. You can check your Order Status anytime using your order number (e.g., ORD-2026-0001).',
    quickReplies: ['Track My Order', 'Refund Policy', 'Contact Support']
  },
  {
    intent: 'account.password_reset',
    keywords: ['forgot password', 'reset password', 'change password', 'login issue', 'cannot login', 'reset password page', 'login page'],
    response: 'You can reset your password anytime by clicking "Forgot Password?" on the Sign In page, or from your Profile page under the Security tab.',
    quickReplies: ['Update Profile', 'Contact Support', 'Browse Materials']
  },
  {
    intent: 'account.profile_update',
    keywords: ['update profile', 'verify email', 'resend verification', 'edit profile', 'institution', 'phone number'],
    response: 'You can update your name, phone number, and institution from your Profile page. If your email is unverified, click "Resend Verification Email" on your Profile banner.',
    quickReplies: ['Forgot Password', 'Track My Order', 'Contact Support']
  },
  {
    intent: 'faq.contact_support',
    keywords: ['contact support', 'support email', 'need help', 'human agent', 'customer service', 'help desk', 'call', 'ticket', 'open ticket'],
    response: 'You can reach our EduMart Support Team at support@edumart.lk or call +94 11 234 5678 (Mon-Sat, 8:00 AM - 6:00 PM). You can also submit an in-chat support ticket right here!',
    quickReplies: ['Open Support Ticket', 'Track My Order', 'Browse Materials']
  },
  {
    intent: 'faq.platform_overview',
    keywords: ['what is edumart', 'how it works', 'about', 'platform', 'edumart', 'monawada'],
    response: 'EduMart is Sri Lanka\'s premier marketplace for educational materials. Students can purchase past papers, model papers, and revision notes, while tutors and institutes can upload and sell their study materials.',
    quickReplies: ['Browse Materials', 'Become a Tutor', 'How to Download?']
  }
];

/**
 * Call Google Gemini 1.5 Flash API via native https
 */
const callGeminiChat = async (userMessage, contextHistory = []) => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.startsWith('your_') || process.env.NODE_ENV === 'test') {
    return null;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const systemInstruction =
    'You are EduMart\'s friendly AI Educational Assistant for Sri Lanka\'s leading educational marketplace (https://edumart.lk). ' +
    'You assist students, parents, and tutors with exam preparation (G.C.E. O/L, G.C.E. A/L Physical Science, Bio Science, Commerce, Arts, Technology, and Grade 5 Scholarship), ' +
    'past papers, model papers, worked answers, and syllabus guidelines. ' +
    'Key Platform Facts: ' +
    '1. Digital PDF materials are unlocked and downloaded instantly after purchase. ' +
    '2. Physical printed books/packs are dispatched via island-wide courier (PromptX Express) in 2-4 business days. ' +
    '3. Payment methods: Visa, MasterCard, LankaQR, and Direct Bank Transfer. ' +
    '4. Tutors keep 85% of each sale and can upload original study materials in the Seller Dashboard. ' +
    '5. Official support email: support@edumart.lk, Hotline: +94 11 234 5678. ' +
    'Rules: ' +
    '- Be warm, concise, and helpful. Format responses with clean markdown bullet points or short paragraphs. ' +
    '- If users ask in Sinhala or Singlish, reply politely in Sinhala/Singlish or English. ' +
    '- Never invent fake orders or private tracking numbers; prompt users to supply their order number. ' +
    '- Limit responses to under 200 words.';

  const contents = [
    ...(Array.isArray(contextHistory) ? contextHistory.slice(-4).map((h) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text || '' }]
    })) : []),
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  const payload = JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 350
    }
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 7000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            const candidateText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText && candidateText.trim()) {
              return resolve({
                reply: candidateText.trim(),
                provider: 'gemini',
                confidence: 0.96
              });
            }
          } catch (e) {
            // parsing error fallback
          }
        }
        resolve(null);
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.on('error', () => {
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Classify user intent with typo-tolerance and Singlish keyword support
 */
const classifyIntent = (message) => {
  const normalized = (message || '').toLowerCase().trim();

  // Check for Order Status query pattern (e.g. "EDM-", "ORD-", "#123", "order status")
  const orderMatch = normalized.match(/edm-[\w\-]+|ord-[\w\-]+|order\s+#?([a-zA-Z0-9\-]+)/i);
  if (
    orderMatch ||
    normalized.includes('my order') ||
    normalized.includes('view my orders') ||
    normalized.includes('view order details') ||
    normalized.includes('order status') ||
    normalized.includes('track order') ||
    normalized.includes('track my order') ||
    normalized.includes('mage order') ||
    normalized.includes('order eka')
  ) {
    let orderNumber = null;
    if (orderMatch) {
      orderNumber = orderMatch[1] || orderMatch[0];
      const upper0 = orderMatch[0].toUpperCase();
      if (upper0.startsWith('EDM-') || upper0.startsWith('ORD-')) {
        orderNumber = orderMatch[0];
      }
    }

    return {
      intent: 'order.status',
      orderNumber: orderNumber ? orderNumber.toUpperCase() : null,
      confidence: 0.95
    };
  }

  // Check if user is asking how to download materials
  if (
    normalized.includes('how to download') ||
    normalized.includes('how do i download') ||
    normalized.includes('download my') ||
    normalized.includes('download items') ||
    normalized.includes('download karanne')
  ) {
    const faq = FAQ_KNOWLEDGE_BASE.find((f) => f.intent === 'faq.digital_download');
    return {
      intent: 'faq.digital_download',
      response: faq.response,
      quickReplies: faq.quickReplies,
      confidence: 0.95
    };
  }

  // Check for Product / Catalog search intent (including typos and subjects)
  const productTriggers = [
    'browse materials',
    'find ',
    'search ',
    'looking for',
    'do you have',
    'available papers',
    'grade ',
    'o/l',
    'a/l',
    'al papers',
    'ol papers',
    'scholarship',
    'mathematics',
    'maths',
    'mathemtics',
    'science',
    'physics',
    'pyhsics',
    'chemistry',
    'biology',
    'english',
    'history',
    'ict',
    'accounting',
    'economics',
    'business',
    'tute',
    'tutes',
    'model paper',
    'papers monawada',
    'poth monawada'
  ];

  if (productTriggers.some((trigger) => normalized.includes(trigger))) {
    const cleanedQuery = normalized
      .replace(/^(browse materials|find|search|looking for|do you have|available papers)\s*/i, '')
      .trim();
    return {
      intent: 'product.search',
      query: cleanedQuery || normalized,
      confidence: 0.92
    };
  }

  // Match against FAQ knowledge base
  for (const faq of FAQ_KNOWLEDGE_BASE) {
    const matched = faq.keywords.some((kw) => normalized.includes(kw));
    if (matched) {
      return {
        intent: faq.intent,
        response: faq.response,
        quickReplies: faq.quickReplies,
        confidence: 0.90
      };
    }
  }

  // Fallback unknown intent
  return {
    intent: 'fallback.unknown',
    response: "I'm EduMart's AI Assistant. I can help you with finding study materials, downloading PDFs, order tracking, becoming a tutor, and account management. How can I assist you today?",
    quickReplies: ['Browse Materials', 'How to Download?', 'Track My Order', 'Contact Support'],
    confidence: 0.40
  };
};

/**
 * Real-time Product catalog lookup bridging into Product model
 * Returns text summary AND structured product objects for rich in-chat cards
 */
const handleProductQuery = async (query) => {
  try {
    const searchTerm = (query || '').trim();
    const isGenericBrowse = !searchTerm || searchTerm === 'browse materials' || searchTerm === 'materials';

    const whereClause = { is_active: true };
    if (!isGenericBrowse) {
      const stopWords = new Set(['find', 'search', 'past', 'papers', 'paper', 'notes', 'model', 'for', 'the', 'and', 'with', 'available', 'looking']);
      const tokens = searchTerm
        .split(/\s+/)
        .map((t) => t.replace(/[^a-zA-Z0-9\/]/g, ''))
        .filter((t) => t.length >= 2 && !stopWords.has(t.toLowerCase()));
      const keywords = tokens.length > 0 ? tokens : [searchTerm];

      const orConditions = [];
      keywords.forEach((kw) => {
        orConditions.push(
          { title: { [Op.like]: `%${kw}%` } },
          { subject: { [Op.like]: `%${kw}%` } },
          { grade_level: { [Op.like]: `%${kw}%` } },
          { description: { [Op.like]: `%${kw}%` } }
        );
      });
      whereClause[Op.or] = orConditions;
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 4
    });

    if (products && products.length > 0) {
      const listText = products
        .map((p) => `• **${p.title}** (${p.subject || ''} • ${p.grade_level || ''}) — LKR ${Number(p.price).toFixed(2)}`)
        .join('\n');

      const richProducts = products.map((p) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        subject: p.subject,
        grade_level: p.grade_level,
        format: p.format,
        is_digital: p.format !== 'physical',
        is_physical: p.format === 'physical' || p.format === 'both',
        cover_image_url: p.cover_image_url || null,
        preview_url: `/products/${p.id}`,
        preview_image_url: `/api/products/${p.id}/preview-image/1`
      }));

      return {
        reply: `Here are top study materials matching your request:\n${listText}\n\nYou can preview specimen pages or add them to your cart below!`,
        quickReplies: ['How to Download?', 'Payment Help', 'Track My Order'],
        products: richProducts
      };
    }
  } catch (err) {
    // Graceful fallback if products table is not synced or empty
  }

  return {
    reply: 'You can explore our full catalog of O/L, A/L, and university past papers, model papers, and revision notes on the Products page. Try searching by subject (e.g., "Mathematics", "Physics") or grade level!',
    quickReplies: ['How to Download?', 'Become a Tutor', 'Contact Support'],
    products: []
  };
};

/**
 * Real-time Order status lookup bridging into Order model
 * Protects customer privacy for guest lookups and provides clickable order actions
 */
const handleOrderQuery = async (orderNumber, userId, userEmail) => {
  if (orderNumber) {
    const order = await Order.findOne({ where: { order_number: orderNumber } });
    if (order) {
      const isOwner = Boolean(
        (userId && order.user_id && String(userId) === String(order.user_id)) ||
        (userEmail && (order.shipping_address?.email === userEmail || order.user?.email === userEmail))
      );

      let trackingInfo = '';
      if (order.carrier && order.tracking_number) {
        trackingInfo = ` Dispatched via ${order.carrier} (Tracking: ${order.tracking_number}).`;
      }

      const orderData = {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        total_amount: Number(order.total_amount),
        currency: order.currency || 'LKR',
        carrier: order.carrier,
        tracking_number: order.tracking_number,
        order_url: `/orders/${order.id}`
      };

      if (!isOwner && !userId) {
        return {
          reply: `Order #${order.order_number} is currently **${order.status.toUpperCase()}**. Payment Status: **${order.payment_status.toUpperCase()}** (Total: ${order.currency || 'LKR'} ${order.total_amount}).${trackingInfo}\n\n*Note: Personal delivery address is masked for security.*`,
          quickReplies: ['Track Shipment', 'View Order Details', 'Need Help'],
          orderData
        };
      }

      return {
        reply: `Order #${order.order_number} is currently **${order.status.toUpperCase()}**. Payment Status: **${order.payment_status.toUpperCase()}** (Total: ${order.currency || 'LKR'} ${order.total_amount}).${trackingInfo}`,
        quickReplies: ['Track Shipment', 'View Order Details', 'Need Help'],
        orderData
      };
    }
  }

  if (userId) {
    const latestOrder = await Order.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    if (latestOrder) {
      let trackingInfo = '';
      if (latestOrder.carrier && latestOrder.tracking_number) {
        trackingInfo = ` Dispatched via ${latestOrder.carrier} (Tracking: ${latestOrder.tracking_number}).`;
      }
      return {
        reply: `Your most recent order #${latestOrder.order_number} is currently **${latestOrder.status.toUpperCase()}** (Payment: **${latestOrder.payment_status.toUpperCase()}**).${trackingInfo}`,
        quickReplies: ['View Order Details', 'Download Items', 'Refund Policy'],
        orderData: {
          id: latestOrder.id,
          order_number: latestOrder.order_number,
          status: latestOrder.status,
          payment_status: latestOrder.payment_status,
          total_amount: Number(latestOrder.total_amount),
          currency: latestOrder.currency || 'LKR',
          carrier: latestOrder.carrier,
          tracking_number: latestOrder.tracking_number,
          order_url: `/orders/${latestOrder.id}`
        }
      };
    }
  }

  return {
    reply: "Please provide your order number (e.g., EDM-20261017-0001 or ORD-2026-0001) so I can look up the real-time fulfillment and shipment status for you.",
    quickReplies: ['View My Orders', 'Contact Support'],
    orderData: null
  };
};

/**
 * Handle in-chat support ticket dispatch via EmailJS
 */
const submitChatbotSupportTicket = async ({ name, email, subject, message, sessionId }) => {
  const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const ticketSubject = `[Support Ticket #${ticketId}] ${subject || 'Student Inquiry via AI Assistant'}`;

  const emailResult = await sendCustomEmail({
    to: 'support@edumart.lk',
    toName: 'EduMart Support Team',
    subject: ticketSubject,
    message: `
      <h3>New In-Chat Support Ticket</h3>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Sender:</strong> ${name || 'Student'} (&lt;${email}&gt;)</p>
      <p><strong>Session ID:</strong> ${sessionId || 'N/A'}</p>
      <hr/>
      <p><strong>Inquiry Message:</strong></p>
      <blockquote style="background: #f9fafb; padding: 12px; border-left: 4px solid #2563eb;">
        ${(message || '').replace(/\n/g, '<br/>')}
      </blockquote>
    `
  });

  return {
    success: true,
    ticketId,
    emailResult
  };
};

module.exports = {
  classifyIntent,
  handleOrderQuery,
  handleProductQuery,
  callGeminiChat,
  submitChatbotSupportTicket,
  FAQ_KNOWLEDGE_BASE
};
