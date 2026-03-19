import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/users/savePushToken', async (req, res) => {
  const { userId, pushToken } = req.body;
  if (!userId || !pushToken) {
    return res.status(400).json({ error: 'Missing userId or pushToken' });
  }
  try {
    await User.findByIdAndUpdate(userId, { pushToken });
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save push token', err);
    res.status(500).json({ error: 'Failed to save push token' });
  }
});

router.post('/users/updateLocation', async (req, res) => {
  const { userId, latitude, longitude } = req.body;
  if (!userId || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing userId or location' });
  }
  try {
    await User.findByIdAndUpdate(userId, {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to update location', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

import { Expo } from 'expo-server-sdk';

const expo = new Expo();

router.post('/sos/community', async (req, res) => {
  const { userId, latitude, longitude } = req.body;
  if (!userId || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing userId or location' });
  }

  try {
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: 2000, // 2km
        },
      },
    });

    const messages = [];
    for (const user of nearbyUsers) {
      if (user._id.toString() !== userId && Expo.isExpoPushToken(user.pushToken)) {
        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: '🚨 SafeHer Alert',
          body: 'Someone nearby needs help',
          data: { latitude, longitude },
        });
      }
    }

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    res.json({ ok: true, sentTo: messages.length });
  } catch (err) {
    console.error('Failed to send community SOS', err);
    res.status(500).json({ error: 'Failed to send community SOS' });
  }
});

export default router;
