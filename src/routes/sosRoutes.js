import { Expo } from 'expo-server-sdk';
import express from 'express';
import User from '../models/User.js';
import getDistance from '../utils/distance.js';

const router = express.Router();
const expo = new Expo();

router.post('/community', async (req, res) => {
  console.log("--- Community SOS Alert Activated ---");
  console.log("BODY RECEIVED (sos/community):", req.body);
  const { latitude, longitude, userId } = req.body;
  console.log(`Sender location: [${latitude}, ${longitude}] from user: ${userId}`);

  try {
    // 1. Fetch ALL users (excluding sender) to debug why some are missing
    const allUsers = await User.find({ _id: { $ne: userId } });
    console.log(`--- SOS Debug: Total other users in DB: ${allUsers.length} ---`);

    // 2. Filter nearby users using Haversine formula (5 km)
    const nearbyUsers = allUsers.filter(user => {
      // Check top-level fields first, then GeoJSON fields
      const userLat = user.latitude || (user.location && user.location.coordinates && user.location.coordinates[1]);
      const userLon = user.longitude || (user.location && user.location.coordinates && user.location.coordinates[0]);

      if (userLat === undefined || userLon === undefined) {
        console.log(`[Debug] User ${user.name} skipped: No location data`);
        return false;
      }

      const distance = getDistance(latitude, longitude, userLat, userLon);
      const isNearby = distance <= 5;

      if (isNearby) {
        console.log(`[Debug] User ${user.name} is NEARBY (${distance.toFixed(2)} km) but has pushToken: ${!!user.pushToken}`);
      }
      
      return isNearby && user.pushToken; // Must have pushToken to receive notification
    });

    console.log(`Final nearby recipients with tokens: ${nearbyUsers.length}`);

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

