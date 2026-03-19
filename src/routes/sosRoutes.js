const express = require('express');
const router = express.Router();
const User = require('../models/User');
const getDistance = require('../utils/distance');
const sendPush = require('../utils/push');

router.post('/community', async (req, res) => {
  console.log("BODY RECEIVED (sos/community):", req.body);
  const { latitude, longitude, userId } = req.body;

  try {
    const users = await User.find({
      _id: { $ne: userId }, // exclude sender
      latitude: { $exists: true },
      longitude: { $exists: true },
      pushToken: { $exists: true }
    });
    console.log(`Found ${users.length} users with coordinates and push tokens.`);

    const nearbyUsers = users.filter(user => {
      const distance = getDistance(
        latitude,
        longitude,
        user.latitude,
        user.longitude
      );
      return distance <= 2; // 2 km radius
    });

    console.log('Nearby users:', nearbyUsers.length);

    for (const user of nearbyUsers) {
      await sendPush(user.pushToken, latitude, longitude);
    }

    res.json({ success: true, nearbyCount: nearbyUsers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
