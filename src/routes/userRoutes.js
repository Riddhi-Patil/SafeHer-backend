const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Save location
router.post('/updateLocation', async (req, res) => {
  console.log("BODY RECEIVED (updateLocation):", req.body);
  const { userId, latitude, longitude } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { latitude, longitude });
    console.log(`Location updated for user ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating location:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save push token
router.post('/savePushToken', async (req, res) => {
  console.log("BODY RECEIVED (savePushToken):", req.body);
  const { userId, token } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { pushToken: token });
    console.log(`Push token saved for user ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving push token:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
