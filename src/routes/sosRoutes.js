import express from 'express';
import User from '../models/User.js';
import getDistance from '../utils/distance.js';
import { Expo } from 'expo-server-sdk';

const router = express.Router();
const expo = new Expo();

router.post('/community', async (req, res) => {
  console.log("--- Community SOS Alert Activated ---");
  console.log("BODY RECEIVED (sos/community):", req.body);
  const { latitude, longitude, userId } = req.body;
  console.log(`Sender location: [${latitude}, ${longitude}] from user: ${userId}`);

  try {
    // 1. Fetch users who have location and pushToken (excluding sender)
    const users = await User.find({
      _id: { $ne: userId },
      latitude: { $exists: true },
      longitude: { $exists: true },
      pushToken: { $exists: true }
    });
    console.log(`Potential users found in database: ${users.length}`);

    // 2. Filter nearby users using Haversine formula (2-5 km)
    const nearbyUsers = users.filter(user => {
      const distance = getDistance(
        latitude,
        longitude,
        user.latitude,
        user.longitude
      );
      return distance <= 5; // Using 5 km radius as requested
    });

    console.log(`Nearby users within 5km: ${nearbyUsers.length}`);

    // 3. Send Push Notifications using expo-server-sdk
    const messages = [];
    for (const user of nearbyUsers) {
      if (!Expo.isExpoPushToken(user.pushToken)) {
        console.error(`Push token ${user.pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: user.pushToken,
        sound: 'default',
        title: '🚨 SafeHer SOS Alert!',
        body: 'Someone nearby needs help! Open the app to see the location.',
        data: { latitude, longitude, senderId: userId },
        priority: 'high',
      });
    }

    if (messages.length > 0) {
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];
      
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          console.log(`Successfully sent ${chunk.length} push notifications.`);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }
    } else {
      console.log("No valid nearby users to send notifications to.");
    }

    res.json({ 
      success: true, 
      nearbyCount: nearbyUsers.length,
      notificationsSent: messages.length
    });

  } catch (err) {
    console.error("SOS community route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

