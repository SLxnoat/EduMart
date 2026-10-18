const asyncHandler = require('express-async-handler');
const { AiInteraction } = require('../models');
const {
  classifyIntent,
  handleOrderQuery,
  handleProductQuery,
  callGeminiChat,
  submitChatbotSupportTicket
} = require('../services/chatbotService');

// @desc    Send message to chatbot and get AI / knowledge base response
// @route   POST /api/chatbot/message
// @access  Public / Optional Auth
const sendMessage = asyncHandler(async (req, res) => {
  const { message, sessionId, history } = req.body;
  const startTime = Date.now();

  if (!message || typeof message !== 'string') {
    res.status(400);
    throw new Error('Message text is required');
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    res.status(400);
    throw new Error('Message text cannot be empty');
  }

  if (trimmedMessage.length > 1000) {
    res.status(400);
    throw new Error('Message exceeds the maximum length of 1000 characters');
  }

  const effectiveSessionId = sessionId || req.headers['x-session-id'] || 'session-anon';
  const userId = req.user ? req.user.id : null;
  const userEmail = req.user ? req.user.email : null;

  // 1. Initial rule-based and catalog classification
  const classification = classifyIntent(trimmedMessage);
  let replyText = classification.response;
  let quickReplies = classification.quickReplies || [];
  let products = [];
  let orderData = null;
  let provider = 'knowledge_base';
  let intent = classification.intent;
  let confidence = classification.confidence;

  // 2. Resolve Domain Queries
  if (classification.intent === 'order.status') {
    provider = 'order_service';
    const orderResult = await handleOrderQuery(classification.orderNumber, userId, userEmail);
    replyText = orderResult.reply;
    quickReplies = orderResult.quickReplies;
    orderData = orderResult.orderData;
  } else if (classification.intent === 'product.search') {
    provider = 'product_catalog';
    const productResult = await handleProductQuery(classification.query);
    replyText = productResult.reply;
    quickReplies = productResult.quickReplies;
    products = productResult.products || [];
  } else if (classification.intent === 'fallback.unknown') {
    // 3. Fallback to Google Gemini Generative AI if available
    const geminiResult = await callGeminiChat(trimmedMessage, history);
    if (geminiResult && geminiResult.reply) {
      replyText = geminiResult.reply;
      provider = 'gemini';
      intent = 'ai.generative';
      confidence = geminiResult.confidence || 0.96;
      quickReplies = ['Browse Materials', 'Track My Order', 'Open Support Ticket'];
    }
  }

  const responseTimeMs = Date.now() - startTime;

  // 4. Persist interaction record in database
  let interactionRecord = null;
  try {
    interactionRecord = await AiInteraction.create({
      user_id: userId,
      session_id: effectiveSessionId,
      message_text: trimmedMessage,
      response_text: replyText,
      intent,
      confidence_score: confidence,
      language: 'en',
      response_time_ms: responseTimeMs
    });
  } catch (logErr) {
    console.error('Failed to log AI interaction:', logErr);
  }

  res.status(200).json({
    data: {
      interactionId: interactionRecord ? interactionRecord.id : null,
      reply: replyText,
      intent,
      confidence,
      provider,
      suggestedQuickReplies: quickReplies,
      products,
      orderData,
      responseTimeMs
    }
  });
});

// @desc    Get chat history for user or session
// @route   GET /api/chatbot/history
// @access  Public / Private
const getHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;
  const userId = req.user ? req.user.id : null;

  const whereClause = {};
  if (userId) {
    whereClause.user_id = userId;
  } else if (sessionId) {
    whereClause.session_id = sessionId;
  } else {
    return res.status(200).json({ data: [] });
  }

  const interactions = await AiInteraction.findAll({
    where: whereClause,
    order: [['created_at', 'ASC']],
    limit: 50
  });

  res.status(200).json({ data: interactions });
});

// @desc    Submit helpfulness rating for chatbot response
// @route   POST /api/chatbot/feedback
// @access  Public / Private
const submitFeedback = asyncHandler(async (req, res) => {
  const { interactionId, isHelpful, rating } = req.body;

  if (!interactionId) {
    res.status(400);
    throw new Error('Interaction ID is required');
  }

  const interaction = await AiInteraction.findByPk(interactionId);
  if (!interaction) {
    res.status(404);
    throw new Error('Interaction record not found');
  }

  if (isHelpful !== undefined) {
    interaction.is_helpful = Boolean(isHelpful);
  }
  if (rating !== undefined) {
    interaction.feedback_rating = Number(rating);
  }

  await interaction.save();

  res.status(200).json({
    message: 'Feedback recorded successfully. Thank you for helping us improve!',
    success: true
  });
});

// @desc    Submit support ticket inquiry from in-chat form via EmailJS
// @route   POST /api/chatbot/ticket
// @access  Public / Private
const submitTicket = asyncHandler(async (req, res) => {
  const { name, email, subject, message, sessionId } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) {
    res.status(400);
    throw new Error('A valid email address is required to submit a support ticket');
  }

  if (!message || String(message).trim().length === 0) {
    res.status(400);
    throw new Error('Ticket message cannot be empty');
  }

  const result = await submitChatbotSupportTicket({
    name: name || req.user?.first_name || 'Student',
    email: email.trim(),
    subject: subject || 'General Student Inquiry',
    message: message.trim(),
    sessionId
  });

  res.status(200).json({
    success: true,
    message: `Support ticket #${result.ticketId} created successfully. Our team will email you shortly!`,
    ticketId: result.ticketId
  });
});

// @desc    Get AI chatbot analytics summary for Admin KPI dashboard
// @route   GET /api/chatbot/analytics
// @access  Protected / Admin or Public Diagnostic
const getChatbotAnalytics = asyncHandler(async (req, res) => {
  const totalInteractions = await AiInteraction.count();
  const helpfulCount = await AiInteraction.count({ where: { is_helpful: true } });
  const unhelpfulCount = await AiInteraction.count({ where: { is_helpful: false } });

  const totalRated = helpfulCount + unhelpfulCount;
  const helpfulnessPercentage = totalRated > 0 ? Math.round((helpfulCount / totalRated) * 100) : 100;

  // Unresolved / Fallback questions
  const unresolvedInteractions = await AiInteraction.findAll({
    where: { intent: 'fallback.unknown' },
    attributes: ['message_text', 'created_at', 'session_id'],
    order: [['created_at', 'DESC']],
    limit: 10
  });

  res.status(200).json({
    success: true,
    data: {
      totalInteractions,
      totalRated,
      helpfulCount,
      unhelpfulCount,
      helpfulnessPercentage,
      unresolvedQuestions: unresolvedInteractions.map((i) => ({
        question: i.message_text,
        timestamp: i.created_at
      }))
    }
  });
});

module.exports = {
  sendMessage,
  getHistory,
  submitFeedback,
  submitTicket,
  getChatbotAnalytics
};
