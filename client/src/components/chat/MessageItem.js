import React from 'react';
import { Box, Paper, Typography, IconButton, Rating } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import QuickReplies from './QuickReplies';

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

const MessageItem = ({ message, onSelectQuickReply, onFeedback }) => {
  const isUser = message.sender === 'user';
  const formattedTime = formatTime(message.timestamp);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        alignSelf: isUser ? 'flex-end' : 'flex-start'
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: isUser ? 'primary.main' : 'white',
          color: isUser ? 'white' : 'text.primary',
          borderBottomRightRadius: isUser ? 0 : 2,
          borderBottomLeftRadius: isUser ? 2 : 0
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {message.text}
        </Typography>
        {formattedTime && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              textAlign: 'right',
              fontSize: '0.65rem',
              opacity: isUser ? 0.8 : 0.6
            }}
          >
            {formattedTime}
          </Typography>
        )}
      </Paper>

      {/* Quick Replies for Bot Messages */}
      {!isUser && message.quickReplies && message.quickReplies.length > 0 && (
        <QuickReplies
          quickReplies={message.quickReplies}
          onSelect={onSelectQuickReply}
        />
      )}

      {/* Feedback Controls for Bot Messages */}
      {!isUser && message.interactionId && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Helpful?
          </Typography>
          <IconButton
            size="small"
            aria-label="mark helpful"
            onClick={() =>
              onFeedback &&
              onFeedback(message.id, message.interactionId, true, message.ratingGiven || 5)
            }
            color={message.feedbackGiven === 'helpful' ? 'primary' : 'default'}
            sx={{ p: 0.3 }}
          >
            {message.feedbackGiven === 'helpful' ? (
              <ThumbUpIcon sx={{ fontSize: 14 }} />
            ) : (
              <ThumbUpOutlinedIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>
          <IconButton
            size="small"
            aria-label="mark unhelpful"
            onClick={() =>
              onFeedback &&
              onFeedback(message.id, message.interactionId, false, message.ratingGiven || 1)
            }
            color={message.feedbackGiven === 'unhelpful' ? 'error' : 'default'}
            sx={{ p: 0.3 }}
          >
            {message.feedbackGiven === 'unhelpful' ? (
              <ThumbDownIcon sx={{ fontSize: 14 }} />
            ) : (
              <ThumbDownOutlinedIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>

          <Rating
            name={`rating-${message.id}`}
            size="small"
            value={message.ratingGiven || 0}
            onChange={(e, newValue) => {
              if (newValue && onFeedback) {
                onFeedback(
                  message.id,
                  message.interactionId,
                  newValue >= 3,
                  newValue
                );
              }
            }}
            sx={{ fontSize: '0.9rem', ml: 0.5 }}
          />

          {message.feedbackGiven && (
            <Typography
              variant="caption"
              color="success.main"
              sx={{ fontSize: '0.68rem', ml: 0.5, fontWeight: 'medium' }}
            >
              Thank you for your feedback!
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MessageItem;
