const asyncHandler = require('express-async-handler');
const { AiInteraction } = require('../models');
const { classifyIntent, handleOrderQuery, handleProductQuery } = require('../services/chatbotService');

// @desc    Send message to chatbot and get AI response
// @route   POST /api/chatbot/message
// @access  Public / Optional Auth
const sendMessage = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  const startTime = Date.now();

  if (!message || typeof message !== 'string') {
    res.status(400);
    throw new Error('Message text is required');
  }

  const effectiveSessionId = sessionId || req.headers['x-session-id'] || 'session-anon';
  const userId = req.user ? req.user.id : null;

  // Classify intent
  const classification = classifyIntent(message);
  let replyText = classification.response;
  let quickReplies = classification.quickReplies || [];

  // If order status inquiry, resolve with Order Service
  if (classification.intent === 'order.status') {
    const orderResult = await handleOrderQuery(classification.orderNumber, userId);
    replyText = orderResult.reply;
    quickReplies = orderResult.quickReplies;
  } else if (classification.intent === 'product.search') {
    const productResult = await handleProductQuery(classification.query);
    replyText = productResult.reply;
    quickReplies = productResult.quickReplies;
  }

  const responseTimeMs = Date.now() - startTime;

  // Persist interaction record in database
  let interactionRecord = null;
  try {
    interactionRecord = await AiInteraction.create({
      user_id: userId,
      session_id: effectiveSessionId,
      message_text: message,
      response_text: replyText,
      intent: classification.intent,
      confidence_score: classification.confidence,
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
      intent: classification.intent,
      confidence: classification.confidence,
      suggestedQuickReplies: quickReplies,
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

module.exports = {
  sendMessage,
  getHistory,
  submitFeedback
};
