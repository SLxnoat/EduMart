import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Pagination,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Notifications,
  MarkEmailRead,
  Delete,
  CheckCircle,
  Warning,
  Info,
  LocalShipping,
  Payment,
  RateReview,
  Campaign,
  FiberManualRecord
} from '@mui/icons-material';
import notificationService from '../../services/notificationService';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'order_status':
      return <LocalShipping color="primary" />;
    case 'payment_status':
      return <Payment color="success" />;
    case 'review_reply':
      return <RateReview color="secondary" />;
    case 'security_alert':
      return <Warning color="error" />;
    case 'system_announcement':
      return <Campaign color="primary" />;
    default:
      return <Info color="info" />;
  }
};

const getPriorityChip = (priority) => {
  switch (priority) {
    case 'urgent':
      return <Chip label="URGENT" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
    case 'high':
      return <Chip label="HIGH" color="warning" size="small" />;
    case 'low':
      return <Chip label="LOW" color="default" size="small" />;
    case 'normal':
    default:
      return null;
  }
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchNotifications = useCallback(async (targetPage = 1, onlyUnread = unreadOnly) => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getNotifications({
        page: targetPage,
        limit: 15,
        unread: onlyUnread ? 'true' : 'false'
      });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setTotalPages(data.totalPages || 1);
      setPage(targetPage);
    } catch (err) {
      setError('Failed to fetch notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchNotifications(1, unreadOnly);
  }, [fetchNotifications, unreadOnly]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setActionMsg('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      setActionMsg('All notifications marked as read');
    } catch (err) {
      setActionMsg('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setActionMsg('Notification removed');
    } catch (err) {
      setActionMsg('Failed to delete notification');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" fontSize="large" />
            <div>
              <Typography variant="h5" fontWeight="bold">
                Notifications Inbox
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </Typography>
            </div>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  color="primary"
                />
              }
              label="Unread only"
            />
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<MarkEmailRead />}
                onClick={handleMarkAllRead}
              >
                Mark All Read
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {actionMsg && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>
            {actionMsg}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Alert severity="info" sx={{ my: 3 }}>
            No notifications found in your inbox.
          </Alert>
        ) : (
          <List disablePadding>
            {notifications.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: item.is_read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {!item.is_read && (
                        <IconButton
                          size="small"
                          color="primary"
                          title="Mark as read"
                          onClick={() => handleMarkRead(item.id)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="default"
                        title="Delete notification"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 44, mt: 1 }}>
                    {getNotificationIcon(item.type)}
                  </ListItemIcon>
                  <ListItemText
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {!item.is_read && (
                          <FiberManualRecord color="primary" sx={{ fontSize: 10 }} />
                        )}
                        <Typography variant="subtitle1" fontWeight={item.is_read ? 'normal' : 'bold'}>
                          {item.title}
                        </Typography>
                        {getPriorityChip(item.priority)}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                          {item.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
              </React.Fragment>
            ))}
          </List>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => fetchNotifications(val, unreadOnly)}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationList;
