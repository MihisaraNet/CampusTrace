const request = require('supertest');
const express = require('express');

// Mock models and services before requiring controller
jest.mock('../models/Notification', () => {
  const mockNotification = {
    _id: 'notif123',
    recipient: 'user123',
    title: '📢 Lost Item Alert: Blue Backpack',
    message: 'Lost at Main Library (Bags)',
    type: 'item_lost_broadcast',
    link: '/?search=Blue%20Backpack',
    isRead: false,
    createdAt: new Date().toISOString(),
    save: jest.fn().mockResolvedValue({
      _id: 'notif123',
      isRead: true,
    }),
  };

  return {
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockNotification]),
          }),
        }),
      }),
    }),
    countDocuments: jest.fn().mockImplementation((query) => {
      if (query && query.isRead === false) return Promise.resolve(1);
      return Promise.resolve(1);
    }),
    findOne: jest.fn().mockResolvedValue(mockNotification),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    findOneAndDelete: jest.fn().mockResolvedValue(mockNotification),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };
});

const notificationController = require('../controllers/notificationController');

// Build test app with simulated authenticated user
const app = express();
app.use(express.json());

// Inject mock req.user middleware
app.use((req, res, next) => {
  req.user = { _id: 'user123', name: 'Test Student', studentId: 'ST1001', role: 'student' };
  next();
});

app.get('/api/notifications', notificationController.getNotifications);
app.get('/api/notifications/unread-count', notificationController.getUnreadCount);
app.put('/api/notifications/:id/read', notificationController.markAsRead);
app.put('/api/notifications/read-all', notificationController.markAllAsRead);
app.delete('/api/notifications/:id', notificationController.deleteNotification);
app.delete('/api/notifications', notificationController.clearAllNotifications);

describe('Notification API Endpoints', () => {
  it('GET /api/notifications should return paginated notifications and unreadCount', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('notifications');
    expect(res.body).toHaveProperty('unreadCount', 1);
    expect(res.body.notifications.length).toBe(1);
    expect(res.body.notifications[0].title).toBe('📢 Lost Item Alert: Blue Backpack');
  });

  it('GET /api/notifications/unread-count should return unread notification count', async () => {
    const res = await request(app).get('/api/notifications/unread-count');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ unreadCount: 1 });
  });

  it('PUT /api/notifications/:id/read should mark notification as read', async () => {
    const res = await request(app).put('/api/notifications/notif123/read');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('notification');
    expect(res.body.notification.isRead).toBe(true);
  });

  it('PUT /api/notifications/read-all should mark all notifications as read', async () => {
    const res = await request(app).put('/api/notifications/read-all');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('All notifications marked as read');
    expect(res.body.unreadCount).toBe(0);
  });

  it('DELETE /api/notifications/:id should delete a single notification', async () => {
    const res = await request(app).delete('/api/notifications/notif123');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Notification deleted successfully');
  });

  it('DELETE /api/notifications should clear all notifications', async () => {
    const res = await request(app).delete('/api/notifications');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('All notifications cleared successfully');
    expect(res.body.unreadCount).toBe(0);
  });
});
