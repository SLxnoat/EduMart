import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Tooltip
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MessageItem from './MessageItem';

const CHAT_STORAGE_KEY = 'edumart_chat_messages';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getWelcomeMessage = () => ({
    id: 'welcome',
    sender: 'bot',
    text: user?.firstName
      ? `Hello ${user.firstName}! 👋 I'm EduMart's AI Assistant. How can I help you today with study materials, downloads, or orders?`
      : "Hello! 👋 I'm EduMart's AI Assistant. How can I help you today with study materials, downloads, or orders?",
    quickReplies: ['Browse Materials', 'How to Download?', 'Track My Order', 'Refund Policy'],
    timestamp: new Date().toISOString()
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore storage read error
    }
    return [getWelcomeMessage()];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('edumart_chat_session');
    if (!sid) {
      sid = 'session-' + Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem('edumart_chat_session', sid);
    }
    return sid;
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Persist messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      // ignore storage quota errors
    }
  }, [messages]);

  // Hydrate conversation history from backend when widget opens
  useEffect(() => {
    if (!isOpen || historyLoaded) return;

    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/chatbot/history?sessionId=${encodeURIComponent(sessionId)}`);
        const records = response.data?.data;
        if (isMounted && Array.isArray(records) && records.length > 0 && messages.length <= 1) {
          const hydrated = [getWelcomeMessage()];
          records.forEach((rec) => {
            hydrated.push({
              id: `user-${rec.id}`,
              sender: 'user',
              text: rec.message_text,
              timestamp: rec.created_at || new Date().toISOString()
            });
            hydrated.push({
              id: rec.id,
              interactionId: rec.id,
              sender: 'bot',
              text: rec.response_text,
              quickReplies: [],
              feedbackGiven:
                rec.is_helpful === true
                  ? 'helpful'
                  : rec.is_helpful === false
                  ? 'unhelpful'
                  : null,
              ratingGiven: rec.feedback_rating || 0,
              timestamp: rec.created_at || new Date().toISOString()
            });
          });
          setMessages(hydrated);
        }
      } catch (err) {
        // Silently ignore history fetch errors if offline or unauthenticated
      } finally {
        if (isMounted) setHistoryLoaded(true);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, historyLoaded, sessionId]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const message = (textToSend || inputText).trim();
    if (!message) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.post('/chatbot/message', {
        message,
        sessionId
      });

      const { data } = response.data;

      const botMessage = {
        id: data.interactionId || 'bot-' + Date.now(),
        interactionId: data.interactionId,
        sender: 'bot',
        text: data.reply,
        quickReplies: data.suggestedQuickReplies || [],
        feedbackGiven: null,
        ratingGiven: 0,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'bot',
          text: "Sorry, I'm having trouble connecting right now. Please try again or visit our Help Center.",
          quickReplies: ['Contact Support'],
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId, interactionId, isHelpful, rating) => {
    if (!interactionId) return;

    try {
      await api.post('/chatbot/feedback', {
        interactionId,
        isHelpful,
        rating
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, feedbackGiven: isHelpful ? 'helpful' : 'unhelpful', ratingGiven: rating }
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300
        }}
      >
        <Tooltip title={isOpen ? 'Close Assistant' : 'Chat with EduMart AI'} placement="left">
          <Fab
            color="primary"
            aria-label="chat"
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              boxShadow: 4,
              '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
            }}
          >
            {isOpen ? <CloseIcon /> : <ChatIcon />}
          </Fab>
        </Tooltip>
      </Box>

      {/* Expandable Chat Window */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 380 },
            height: 520,
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1300,
            bgcolor: 'background.paper'
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 36, height: 36 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                  EduMart Assistant
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#4caf50'
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Online 24/7
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages Stream */}
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: '#f8f9fa'
            }}
          >
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onSelectQuickReply={handleSendMessage}
                onFeedback={handleFeedback}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-start' }}>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white' }}>
                  <Typography variant="caption" color="text.secondary">
                    EduMart Assistant is typing...
                  </Typography>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Footer */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            sx={{
              p: 1.5,
              bgcolor: 'white',
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Ask anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <IconButton
              color="primary"
              type="submit"
              disabled={!inputText.trim() || isTyping}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatWidget;
