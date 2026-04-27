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
      // Get the coordinates accurately
      let userLat = user.latitude;
      let userLon = user.longitude;

      // Fallback to location object if latitude/longitude are missing
      if (userLat === undefined || userLat === null) {
        userLat = user.location?.coordinates?.[1];
      }
      if (userLon === undefined || userLon === null) {
        userLon = user.location?.coordinates?.[0];
      }

      // Convert to Number just in case they are stored as strings
      userLat = Number(userLat);
      userLon = Number(userLon);

      if (isNaN(userLat) || isNaN(userLon)) {
        console.log(`[Debug] User ${user.name} (${user.email}) skipped: Invalid coordinates`);
        return false;
      }

      const distance = getDistance(latitude, longitude, userLat, userLon);
      const isNearby = distance <= 5;

      console.log(`[Debug] User: ${user.name}, Dist: ${distance.toFixed(2)}km, Nearby: ${isNearby}, Token: ${!!user.pushToken}`);
      
      // CRITICAL: We only send if they have a token AND are nearby
      return isNearby && user.pushToken && user.pushToken.startsWith('ExponentPushToken') && user.communitySOS === true;
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
        channelId: 'sos-alerts'
      });
    }

    if (messages.length > 0) {
      console.log(`Sending ${messages.length} push notifications via Expo...`);
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];
      
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          console.log("Expo response tickets:", ticketChunk);
        } catch (error) {
          console.error('CRITICAL: Error sending push notification chunk:', error);
        }
      }
    } else {
      console.log("No valid nearby users to send notifications to.");
    }

    res.json({ 
      success: true, 
      nearbyCount: nearbyUsers.length,
      notificationsAttempted: messages.length,
      details: nearbyUsers.map(u => ({ name: u.name, token: !!u.pushToken }))
    });

  } catch (err) {
    console.error("SOS community route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

