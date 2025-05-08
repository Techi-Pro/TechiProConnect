import * as notificationService from '../services/notification.service';

export const registerDeviceToken = async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;
  try {
    if (!token) return res.status(400).json({ message: 'Device token is required' });
    await notificationService.registerDeviceToken(userId, token);
    res.status(201).json({ message: 'Device token registered' });
  } catch (error) {
    console.error('Error registering device token:', error);
    res.status(500).json({ message: 'Error registering device token' });
  }
};

export const sendPushNotification = async (req, res) => {
  const { token, title, body, data } = req.body;
  try {
    if (!token || !title || !body) return res.status(400).json({ message: 'token, title, and body are required' });
    const result = await notificationService.sendPushNotification({ token, title, body, data });
    res.status(200).json({ message: 'Notification sent', result });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Error sending notification' });
  }
}; 