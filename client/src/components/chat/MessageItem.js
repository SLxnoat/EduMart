import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Rating,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import QuickReplies from './QuickReplies';
import { useCart } from '../../context/CartContext';

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

/**
 * Lightweight text renderer with markdown bold and clickable link support
 */
const renderFormattedText = (text, isUser) => {
  if (!text) return null;

  // Split by markdown link pattern [text](url) or bold **bold**
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Process markdown link [label](url)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <a
          key={`link-${lineIdx}-${match.index}`}
          href={url}
          target={url.startsWith('/') ? '_self' : '_blank'}
          rel="noopener noreferrer"
          style={{
            color: isUser ? '#ffffff' : '#2563eb',
            textDecoration: 'underline',
            fontWeight: 600
          }}
        >
          {label}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    // Process bold text **text** in parts
    const finalElements = parts.map((part, pIdx) => {
      if (typeof part !== 'string') return part;
      const boldParts = part.split(/\*\*(.*?)\*\*/g);
      return boldParts.map((bPart, bIdx) => {
        if (bIdx % 2 === 1) {
          return <strong key={`b-${lineIdx}-${pIdx}-${bIdx}`}>{bPart}</strong>;
        }
        return bPart;
      });
    });

    return (
      <span key={`line-${lineIdx}`}>
        {finalElements}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
};

const MessageItem = ({ message, onSelectQuickReply, onFeedback }) => {
  const isUser = message.sender === 'user';
  const formattedTime = formatTime(message.timestamp);
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState({});

  const handleAddToCartClick = (product) => {
    if (addToCart && typeof addToCart === 'function') {
      addToCart({
        id: product.id,
        product_id: product.id,
        title: product.title,
        price: product.price,
        format: product.format || 'digital',
        subject: product.subject,
        grade_level: product.grade_level
      });
      setAddedItems((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [product.id]: false }));
      }, 3000);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '92%',
        alignSelf: isUser ? 'flex-end' : 'flex-start'
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          borderRadius: 2.5,
          bgcolor: isUser ? 'primary.main' : 'white',
          color: isUser ? 'white' : 'text.primary',
          borderBottomRightRadius: isUser ? 0 : 2.5,
          borderBottomLeftRadius: isUser ? 2.5 : 0,
          border: isUser ? 'none' : '1px solid #e5e7eb'
        }}
      >
        <Typography variant="body2" component="div" sx={{ lineHeight: 1.6 }}>
          {renderFormattedText(message.text, isUser)}
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

      {/* Rich In-Chat Product Cards */}
      {!isUser && Array.isArray(message.products) && message.products.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, width: '100%' }}>
          {message.products.map((prod) => (
            <Card
              key={prod.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: '#e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                bgcolor: '#ffffff'
              }}
            >
              <CardContent sx={{ p: 1.5, pb: 0 }}>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                  {prod.subject && (
                    <Chip label={prod.subject} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                  )}
                  {prod.grade_level && (
                    <Chip label={prod.grade_level} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                  )}
                  <Chip
                    label={prod.is_digital ? 'Digital PDF' : 'Printed Book'}
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: prod.is_digital ? '#ecfdf5' : '#eff6ff', color: prod.is_digital ? '#059669' : '#1d4ed8' }}
                  />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.3 }}>
                  {prod.title}
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800, mt: 0.5 }}>
                  LKR {Number(prod.price).toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 1, pt: 0.5, display: 'flex', gap: 0.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityIcon fontSize="small" />}
                  href={`/products/${prod.id}?preview=true`}
                  sx={{ fontSize: '0.7rem', textTransform: 'none', py: 0.2, px: 1, flex: 1 }}
                >
                  Preview
                </Button>
                <Button
                  size="small"
                  variant={addedItems[prod.id] ? 'contained' : 'contained'}
                  color={addedItems[prod.id] ? 'success' : 'primary'}
                  startIcon={addedItems[prod.id] ? <CheckCircleIcon fontSize="small" /> : <AddShoppingCartIcon fontSize="small" />}
                  onClick={() => handleAddToCartClick(prod)}
                  sx={{ fontSize: '0.7rem', textTransform: 'none', py: 0.2, px: 1, flex: 1 }}
                >
                  {addedItems[prod.id] ? 'Added!' : 'Add to Cart'}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Rich In-Chat Order Card */}
      {!isUser && message.orderData && (
        <Card
          variant="outlined"
          sx={{
            mt: 1,
            borderRadius: 2,
            borderColor: '#bfdbfe',
            bgcolor: '#eff6ff',
            width: '100%',
            p: 1.5
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e40af' }}>
              Order #{message.orderData.order_number}
            </Typography>
            <Chip
              label={message.orderData.status?.toUpperCase() || 'PROCESSING'}
              size="small"
              color={message.orderData.status === 'delivered' ? 'success' : 'primary'}
              sx={{ fontWeight: 700, fontSize: '0.65rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#1e3a8a' }}>
            Total: <strong>{message.orderData.currency || 'LKR'} {Number(message.orderData.total_amount).toFixed(2)}</strong>
          </Typography>
          {message.orderData.carrier && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <LocalShippingIcon sx={{ fontSize: 16, color: '#2563eb' }} />
              <Typography variant="caption" sx={{ color: '#1d4ed8' }}>
                {message.orderData.carrier} {message.orderData.tracking_number ? `(${message.orderData.tracking_number})` : ''}
              </Typography>
            </Box>
          )}
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<ReceiptIcon fontSize="small" />}
            href={`/orders/${message.orderData.id}`}
            sx={{ mt: 1.5, fontSize: '0.75rem', textTransform: 'none', width: '100%' }}
          >
            View Full Receipt & Downloads
          </Button>
        </Card>
      )}

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
