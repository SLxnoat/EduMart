const { Op } = require('sequelize');
const { Order, Product } = require('../models');

const FAQ_KNOWLEDGE_BASE = [
  {
    intent: 'faq.digital_download',
    keywords: ['download', 'pdf', 'past paper', 'digital', 'ebook', 'file', 'papers', 'notes', 'how to download', 'download items'],
    response: 'You can download purchased digital materials instantly from your Order Confirmation page or from your Profile under "My Downloads". Download links remain permanently active in your account.',
    quickReplies: ['View My Orders', 'Payment Help', 'Contact Support']
  },
  {
    intent: 'faq.tutor_registration',
    keywords: ['become a tutor', 'register as tutor', 'sell', 'upload material', 'seller', 'instructor', 'teach', 'tutor'],
    response: 'To sell materials on EduMart, register as a Tutor or Institute. Once logged in, visit the Seller Dashboard to upload past papers, model papers, or revision notes and start earning.',
    quickReplies: ['Register as Tutor', 'Seller Guidelines', 'Commission Rates']
  },
  {
    intent: 'faq.commission_rates',
    keywords: ['commission', 'commission rates', 'seller guidelines', 'fees', 'payout', 'earnings', 'royalty'],
    response: 'EduMart tutors and institutes keep 85% of every sale! Platform commission is just 15% to cover payment processing and hosting. Seller guidelines require original or authorized PDFs under 50MB.',
    quickReplies: ['Become a Tutor', 'Payment Help', 'Contact Support']
  },
  {
    intent: 'faq.payment_help',
    keywords: ['payment', 'payment help', 'pay', 'card', 'visa', 'mastercard', 'billing', 'checkout issue'],
    response: 'We accept Visa, MasterCard, LankaQR, and bank transfers. All transactions are encrypted. If a payment fails, please verify your card limits or try again from your Cart.',
    quickReplies: ['Track My Order', 'Refund Policy', 'Contact Support']
  },
  {
    intent: 'faq.refund_policy',
    keywords: ['refund', 'money back', 'return', 'return policy', 'return request', 'cancel order', 'damaged', 'policy'],
    response: 'Physical printed materials can be returned within 7 days of delivery if damaged. Digital downloads are non-refundable once downloaded, unless the file is corrupt or unreadable.',
    quickReplies: ['Track My Order', 'Payment Help', 'Contact Support']
  },
  {
    intent: 'faq.shipping_delivery',
    keywords: ['track shipment', 'shipping', 'delivery', 'courier', 'dispatch', 'physical delivery'],
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
    keywords: ['contact support', 'support email', 'need help', 'human agent', 'customer service', 'help desk', 'call'],
    response: 'You can reach our EduMart Support Team at support@edumart.lk or call +94 11 234 5678 (Mon-Sat, 8:00 AM - 6:00 PM). We typically respond within 2 hours!',
    quickReplies: ['Track My Order', 'Refund Policy', 'Browse Materials']
  },
  {
    intent: 'faq.platform_overview',
    keywords: ['what is edumart', 'how it works', 'about', 'platform', 'edumart'],
    response: 'EduMart is Sri Lanka\'s premier marketplace for educational materials. Students can purchase past papers, model papers, and revision notes, while tutors and institutes can upload and sell their study materials.',
    quickReplies: ['Browse Materials', 'Become a Tutor', 'How to Download?']
  }
];

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
    normalized.includes('track my order')
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

  // Check for Product / Catalog search intent
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
    'mathematics',
    'science',
    'physics',
    'chemistry',
    'biology',
    'english',
    'history',
    'ict',
    'accounting',
    'economics'
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

// Real-time Product catalog lookup bridging into Product model
const handleProductQuery = async (query) => {
  try {
    const searchTerm = (query || '').trim();
    const isGenericBrowse = !searchTerm || searchTerm === 'browse materials' || searchTerm === 'materials';

    const whereClause = { is_active: true };
    if (!isGenericBrowse) {
      const stopWords = new Set(['find', 'search', 'past', 'papers', 'paper', 'notes', 'model', 'for', 'the', 'and', 'with']);
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
      limit: 3
    });

    if (products && products.length > 0) {
      const listText = products
        .map((p) => `• ${p.title} (${p.subject} - ${p.grade_level}) — $${Number(p.price).toFixed(2)}`)
        .join('\n');
      return {
        reply: `Here are top study materials matching your request:\n${listText}\n\nYou can view and purchase these directly in our Products catalog!`,
        quickReplies: ['How to Download?', 'Payment Help', 'Track My Order']
      };
    }
  } catch (err) {
    // Graceful fallback if products table is not synced or empty
  }

  return {
    reply: 'You can explore our full catalog of O/L, A/L, and university past papers, model papers, and revision notes on the Products page. Try searching by subject (e.g., "Mathematics", "Physics") or grade level!',
    quickReplies: ['How to Download?', 'Become a Tutor', 'Contact Support']
  };
};

// Real-time Order status lookup bridging into Charuka's Order model
const handleOrderQuery = async (orderNumber, userId) => {
  if (orderNumber) {
    const order = await Order.findOne({ where: { order_number: orderNumber } });
    if (order) {
      let trackingInfo = '';
      if (order.carrier && order.tracking_number) {
        trackingInfo = ` Dispatched via ${order.carrier} (Tracking: ${order.tracking_number}).`;
      }
      return {
        reply: `Order #${order.order_number} is currently ${order.status.toUpperCase()}. Payment Status: ${order.payment_status.toUpperCase()} (Total: $${order.total_amount}).${trackingInfo}`,
        quickReplies: ['Track Shipment', 'View Order Details', 'Need Help']
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
        reply: `Your most recent order #${latestOrder.order_number} is currently ${latestOrder.status.toUpperCase()} (Payment: ${latestOrder.payment_status.toUpperCase()}).${trackingInfo}`,
        quickReplies: ['View Order Details', 'Download Items', 'Return Policy']
      };
    }
  }

  return {
    reply: "Please provide your order number (e.g., EDM-20261017-0001 or ORD-2026-0001) so I can look up the real-time fulfillment and shipment status for you.",
    quickReplies: ['View My Orders', 'Contact Support']
  };
};

module.exports = {
  classifyIntent,
  handleOrderQuery,
  handleProductQuery,
  FAQ_KNOWLEDGE_BASE
};
